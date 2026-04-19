import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    let sessionKey: string | undefined;

    for (let i = 0; i < 30; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      throw new Error("Session not ready");
    }

    return Response.json({
      sessionId,
      sessionKey,
    });

  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}