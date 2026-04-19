import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    console.log("Creating session for:", avatarId);

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

      console.log("Polling:", session.status);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        throw new Error("Session failed");
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      throw new Error("Session never became ready");
    }

    // 3. 🔥 CONSUME SESSION (THIS IS WHAT YOU WERE MISSING)
    const consumeRes = await fetch(
      `https://api.dev.runwayml.com/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const credentials = await consumeRes.json();

    console.log("CONSUME RESPONSE:", credentials);

    // 4. RETURN FULL CREDENTIALS
    return Response.json(credentials);

  } catch (err: any) {
    console.error("SESSION ERROR:", err);

    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}