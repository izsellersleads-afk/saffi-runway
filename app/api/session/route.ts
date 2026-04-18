import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function GET() {
  return Response.json({
    status: "ok",
    message: "Use POST to create session",
  });
}

export async function POST() {
  try {
    console.log("🚀 Creating Runway session...");

    // STEP 1: CREATE SESSION
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("🧠 SESSION CREATED:", session);

    // STEP 2: WAIT (CRITICAL)
    await new Promise((r) => setTimeout(r, 3000));

    // STEP 3: GET SESSION STATUS
    const status = await client.realtimeSessions.retrieve(session.id);

    console.log("📡 SESSION STATUS:", status);

    // 🔴 DO NOT FAIL IF connect_url IS MISSING
    if (!(status as any).connect_url) {
      console.log("⚠️ connect_url not ready yet");

      return Response.json({
        error: "Session not ready yet",
        sessionId: session.id,
      }, { status: 202 }); // ← IMPORTANT
    }

    // STEP 4: SUCCESS
    return Response.json({
      connectUrl: (status as any).connect_url,
    });

  } catch (err) {
    console.error("❌ SESSION ERROR:", err);

    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}