import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    const avatarId = "406b979c-0fd3-42e9-9d42-f950406977c2";

    console.log("AVATAR ID:", avatarId);

    // 1. CREATE SESSION
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    console.log("SESSION CREATED:", sessionId);

    // 2. POLL UNTIL READY
    let sessionKey: string | undefined;

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      const session = await client.realtimeSessions.retrieve(sessionId);

      console.log("POLL:", session);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        throw new Error("Session failed");
      }
    }

    if (!sessionKey) {
      throw new Error("Session never became ready");
    }

    // 3. RETURN SESSION KEY (NOT connect_url)
    return Response.json({
      sessionKey,
      sessionId,
    });

  } catch (err: any) {
    console.error("SESSION ERROR:", err);
    return Response.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}