import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    // STEP 1: Create session
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("SESSION CREATED:", session);

    if (!session?.id) {
      throw new Error("Session ID missing");
    }

    // STEP 2: Poll until READY
    let attempts = 0;
    let currentSession = session;

    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 2000));

      const session = await client.realtimeSessions.create({
        model: "gwm1_avatars",
        avatar: {
          type: "custom",
          avatarId: avatarId,
        },
      });

return Response.json({
  sessionKey: session.sessionKey,
});

      attempts++;
    }

    if (currentSession.status !== "READY") {
      throw new Error("Session never became ready");
    }

    // STEP 3: Return sessionKey (NOT connect_url)
    if (!currentSession.sessionKey) {
      throw new Error("No sessionKey found");
    }

    return Response.json({
      sessionKey: currentSession.sessionKey,
    });

  } catch (error: any) {
    console.error("ERROR:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}