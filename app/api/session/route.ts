import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    const avatarId = "406b979c-0fd3-42e9-9d42-f950406977c2";

    console.log("Creating session...");

    // 1. CREATE SESSION
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    console.log("Session ID:", sessionId);

    // 2. POLL UNTIL READY
    let sessionKey: string | undefined;

    for (let i = 0; i < 30; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      console.log("STATUS:", session.status);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        throw new Error("Runway session failed");
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      throw new Error("Session never became ready");
    }

    console.log("Session READY");

    // 3. 🔥 CONSUME SESSION (THIS IS WHAT YOU WERE MISSING)
    const consumeResponse = await fetch(
      `${client.baseURL}/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const credentials = await consumeResponse.json();

    console.log("CREDENTIALS:", credentials);

    // 4. RETURN TO FRONTEND
    return Response.json(credentials);

  } catch (err: any) {
    console.error("SESSION ERROR:", err);
    return Response.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}