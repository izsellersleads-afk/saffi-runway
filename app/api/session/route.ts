import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("🚀 Creating session...");

    // 1. Create session
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("🆔 SESSION ID:", sessionId);

    // 2. Poll until READY
    let sessionKey: string | null = null;

    for (let i = 0; i < 60; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      console.log("⏳ STATUS:", session.status);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        console.error("❌ SESSION FAILED:", session.failure);
        return Response.json(
          { error: session.failure },
          { status: 500 }
        );
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      return Response.json(
        { error: "Session timeout (never READY)" },
        { status: 504 }
      );
    }

    // 3. Consume session → get connectUrl
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

    const data = await consumeRes.json();

    console.log("🎯 CONSUME RESPONSE:", data);

    return Response.json({
      connectUrl: data.connectUrl,
    });

  } catch (err) {
    console.error("❌ ERROR:", err);

    return Response.json(
      { error: "Session creation failed" },
      { status: 500 }
    );
  }
}