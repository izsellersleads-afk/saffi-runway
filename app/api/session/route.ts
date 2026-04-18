import RunwayML from "@runwayml/sdk";

// IMPORTANT: do NOT hardcode your key
const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// OPTIONAL TEST ROUTE
export async function GET() {
  return Response.json({
    status: "ok",
    message: "Use POST to create session",
  });
}

// MAIN SESSION CREATION
export async function POST() {
  try {
    console.log("Creating Runway session...");

    // STEP 1: create session
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("SESSION CREATED:", session);

    const sessionId = (session as any).id;

    // STEP 2: poll until READY
    const deadline = Date.now() + 60000; // 60s timeout

    while (Date.now() < deadline) {
      const fullSession = await client.realtimeSessions.retrieve(sessionId);

      console.log("POLL:", fullSession.status);

      if (fullSession.status === "READY") {
        console.log("SESSION READY!");

        return Response.json({
          sessionId: fullSession.id,
          sessionKey: fullSession.sessionKey,
        });
      }

      // wait 1 second between polls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.error("Session never became ready");

    return Response.json(
      { error: "Session never became ready" },
      { status: 500 }
    );

  } catch (err: any) {
    console.error("SESSION ERROR:", err);

    return Response.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}