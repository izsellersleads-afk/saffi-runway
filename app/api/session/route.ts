import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    const avatarId = "REPLACE_WITH_YOUR_REAL_AVATAR_ID";

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: avatarId,
      },
    });

    console.log("SESSION CREATED:", session.id);

    // 🔁 WAIT LOOP (THIS IS THE FIX)
    let fullSession;

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000)); // wait 1 sec

      fullSession = await client.realtimeSessions.retrieve(session.id);

      console.log("POLL:", fullSession);

      if ("sessionKey" in fullSession) break;
    }

    // ✅ FINAL CHECK
    if (!("sessionKey" in fullSession)) {
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