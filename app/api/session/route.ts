import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// OPTIONAL GET
export async function GET() {
  return Response.json({
    status: "ok",
    message: "Use POST to create session",
  });
}

// MAIN POST
export async function POST() {
  try {
    console.log("Creating Runway session...");

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("SESSION CREATED:", session.id);

    // ⏱️ INCREASE TIME + BETTER POLLING
    const MAX_WAIT = 60000; // 60 seconds
    const start = Date.now();

    while (Date.now() - start < MAX_WAIT) {
      const s = await client.realtimeSessions.retrieve(session.id);

      console.log("POLL:", s.status);

      if (s.status === "READY" && s.sessionKey) {
        console.log("SESSION READY!");

        return Response.json({
          connectUrl: s.sessionKey,
        });
      }

      // ⏱️ Slightly faster retry
      await new Promise((r) => setTimeout(r, 800));
    }

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