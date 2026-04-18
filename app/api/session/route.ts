import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function GET() {
  return Response.json({
    status: "ok",
    message: "Use POST to create session",
  });
}

export async function POST() {
  try {
    console.log("🚀 Creating session...");

    // STEP 1: CREATE
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("SESSION ID:", sessionId);

    // STEP 2: POLL UNTIL READY
    let sessionKey: string | undefined;

    for (let i = 0; i < 15; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      console.log("STATUS:", session.status);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        return Response.json(
          { error: "Session failed" },
          { status: 500 }
        );
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      return Response.json(
        { error: "Session timeout" },
        { status: 504 }
      );
    }

    console.log("SESSION KEY:", sessionKey);

    // STEP 3: CONSUME (THIS IS WHAT YOU WERE MISSING)
    const consumeRes = await fetch(
      `${client.baseURL}/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const creds = await consumeRes.json();

    console.log("CREDENTIALS:", creds);

    if (!creds?.url) {
      return Response.json(
        { error: "No credentials returned" },
        { status: 500 }
      );
    }

    // STEP 4: RETURN CORRECT FORMAT
    return Response.json({
      serverUrl: creds.url,
      token: creds.token,
      roomName: creds.roomName,
    });

  } catch (err) {
    console.error("❌ ERROR:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}