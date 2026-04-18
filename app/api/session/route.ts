import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    const avatarId = "REPLACE_WITH_YOUR_REAL_AVATAR_ID";

    // STEP 1: Create session
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: avatarId,
      },
    });

    console.log("SESSION CREATED:", session.id);

    // STEP 2: Retrieve session to get sessionKey
    const fullSession = await client.realtimeSessions.retrieve(session.id);

    console.log("FULL SESSION:", fullSession);

    if (!fullSession.sessionKey) {
      throw new Error("No sessionKey returned");
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