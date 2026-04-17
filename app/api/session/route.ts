import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// ✅ SAFE GET (no session creation → no credit burn)
export async function GET() {
  return Response.json({
    status: "ok",
    message: "Use POST to create session",
  });
}

// ✅ REAL SESSION CREATION (only happens when frontend calls it)
export async function POST() {
  try {
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    return Response.json({
      connectUrl: (session as any).connect_url,
    });

  } catch (err) {
    console.error("SESSION ERROR:", err);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}