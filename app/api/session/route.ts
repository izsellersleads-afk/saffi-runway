import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function GET() {
  return Response.json({ message: "Session endpoint ready" });
}
export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    if (!avatarId) {
      return Response.json({ error: "avatarId required" }, { status: 400 });
    }

    // 1. Create session
    const { id: sessionId } = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    let sessionKey: string | undefined;

    // 2. Wait until READY
    for (let i = 0; i < 20; i++) {
      const session = await client.realtimeSessions.retrieve(sessionId);

      if (session.status === "READY") {
        sessionKey = session.sessionKey;
        break;
      }

      if (session.status === "FAILED") {
        return Response.json({ error: "Session failed" }, { status: 500 });
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      return Response.json({ error: "Timeout" }, { status: 504 });
    }

    // 3. 🔥 CONSUME (THIS IS REQUIRED FOR AvatarCall)
    const consumeRes = await fetch(
  `https://api.runwayml.com/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({}),
      }
    );

    const consumeData = await consumeRes.json();
    if (!consumeData?.url) {
       console.error("Consume response:", consumeData);
       return Response.json({ error: "No connectUrl returned" }, { status: 500 });
    }
    // 4. 🔥 RETURN connectUrl ONLY
    return Response.json({
      connectUrl: consumeData.url,
    });

  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}