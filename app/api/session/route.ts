import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// OPTIONAL: GET (for browser test)
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

    // STEP 1: CREATE SESSION
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "runway-preset",
        presetId: "influencer",
      },
    });

    console.log("SESSION CREATED:", session);

    // STEP 2: POLL UNTIL READY
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      const res = await fetch(
        `https://api.dev.runwayml.com/v1/realtime_sessions/${session.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RUNWAYML_API_SECRET}`,
            "X-Runway-Version": "2024-11-06",
          },
        }
      );

      const data = await res.json();
      console.log("POLL:", data);

      // SUCCESS CONDITION
      if (data.status === "READY" && data.sessionKey) {
        return Response.json({
          connectUrl: data.sessionKey,
        });
      }

      // FAIL FAST IF RUNWAY SAYS FAILED
      if (data.status === "FAILED") {
        console.error("SESSION FAILED:", data);
        return Response.json(
          { error: "Runway session failed", details: data },
          { status: 500 }
        );
      }
    }

    // TIMEOUT
    return Response.json(
      { error: "Session never became ready" },
      { status: 500 }
    );

  } catch (err) {
    console.error("SESSION ERROR:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}