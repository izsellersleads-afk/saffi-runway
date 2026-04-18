import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    // 1. Create session
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("Session created:", sessionId);

    // 2. Poll until READY
    let sessionKey: string | undefined;

    for (let i = 0; i < 30; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      console.log("Polling status:", session.status);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        return Response.json({ error: session.failure }, { status: 500 });
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      return Response.json({ error: "Session timed out" }, { status: 504 });
    }

    // 3. Consume session
    const res = await fetch(
      `${client.baseURL}/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const data = await res.json();

    console.log("CONSUME RESPONSE:", data);

    return Response.json({
      serverUrl: data.url,
      token: data.token,
      roomName: data.roomName,
    });

  } catch (err) {
    console.error("SESSION ERROR:", err);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}