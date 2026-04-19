import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    if (!avatarId) {
      return Response.json(
        { error: "Missing avatarId" },
        { status: 400 }
      );
    }

    console.log("➡️ Creating Runway session...");

    // 1️⃣ CREATE SESSION
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    console.log("✅ Session created:", sessionId);

    // 2️⃣ POLL UNTIL READY
    let sessionKey: string | undefined;

    for (let i = 0; i < 60; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        console.log("✅ Session READY");
        break;
      }

      if (session.status === "FAILED") {
        console.error("❌ Session FAILED:", session.failure);

        return Response.json(
          { error: session.failure || "Session failed" },
          { status: 500 }
        );
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      console.error("❌ Session TIMEOUT");

      return Response.json(
        { error: "Session timed out" },
        { status: 504 }
      );
    }

    // 3️⃣ CONSUME SESSION (CRITICAL STEP)
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

    const credentials = await consumeRes.json();

    if (!consumeRes.ok) {
      console.error("❌ Consume failed:", credentials);

      return Response.json(
        { error: credentials },
        { status: consumeRes.status }
      );
    }

    console.log("✅ Credentials received");

    // 4️⃣ RETURN WHAT FRONTEND NEEDS
    return Response.json({
      sessionId,
      serverUrl: credentials.url,
      token: credentials.token,
      roomName: credentials.roomName,
    });

  } catch (err: any) {
    console.error("❌ SERVER ERROR:", err);

    return Response.json(
      {
        error:
          err?.response?.data ||
          err?.message ||
          "Unknown error",
      },
      {
        status: err?.status || 500,
      }
    );
  }
}