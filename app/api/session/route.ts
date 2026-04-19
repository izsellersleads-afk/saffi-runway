import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    const avatarId = "406b979c-0fd3-42e9-9d42-f950406977c2";

    console.log("Creating Runway session...");

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    console.log("SESSION CREATED:", session.id);

    // ✅ IMPORTANT: return ONLY sessionId
    return Response.json({
      sessionId: session.id,
    });

  } catch (err: any) {
    console.error("SESSION ERROR:", err);

    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}