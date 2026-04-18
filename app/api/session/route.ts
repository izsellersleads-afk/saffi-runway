import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    const avatarId = "YOUR_REAL_AVATAR_ID";

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "PASTE_REAL_UUID_HERE",
      },
    });

    console.log("SESSION CREATED:", session.id);

    let fullSession: any = null;

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      fullSession = await client.realtimeSessions.retrieve(session.id);

      console.log("POLL:", fullSession);

      if (fullSession && "sessionKey" in fullSession) break;
    }

    if (!fullSession || !("sessionKey" in fullSession)) {
      return Response.json(
        { error: "Session not ready after retries" },
        { status: 500 }
      );
    }

    return Response.json({
      sessionKey: fullSession.sessionKey,
    });

  } catch (err: any) {
    console.error("ERROR:", err);
    return Response.json(
      { error: err.message || "internal error" },
      { status: 500 }
    );
  }
}