import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// GET = sanity check (NO session creation)
export async function GET() {
  return Response.json({
    status: "ok",
    message: "Use POST to create session",
  });
}

// POST = REAL session creation
export async function POST() {
  try {
    console.log("🚀 Creating Runway session...");

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("🧠 FULL SESSION OBJECT:", session);

    // 🔴 SAFE extraction (no guessing)
    const connectUrl =
      (session as any)?.connectUrl ||
      (session as any)?.connect_url ||
      null;

    if (!connectUrl) {
      console.error("❌ NO connectUrl FOUND");
      return Response.json(
        { error: "No connectUrl returned from Runway" },
        { status: 500 }
      );
    }

    return Response.json({
      connectUrl,
    });

  } catch (err) {
    console.error("❌ SESSION ERROR:", err);

    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}