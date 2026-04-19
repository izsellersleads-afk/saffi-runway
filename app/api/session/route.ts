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

    // 3. RETURN SESSION KEY (CRITICAL)
    return Response.json({
      sessionKey,
    });

  } catch (err: any) {
    console.error("SESSION ERROR:", err);

    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}