import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    // 🔥 PUT YOUR REAL AVATAR ID HERE
    const avatarId = "406b979c-0fd3-42e9-9d42-f950406977c2";

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: avatarId,
      },
    });

    console.log("SESSION CREATED:", session.id);

    return Response.json({
      sessionKey: session.sessionKey,
    });

  } catch (err: any) {
    console.error("ERROR:", err);
    return Response.json(
      { error: err.message || "internal error" },
      { status: 500 }
    );
  }
}