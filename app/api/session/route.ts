import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    // ✅ IMPORTANT: receive avatarId from frontend
    const { avatarId } = await req.json();

    console.log("Creating Runway session for:", avatarId);

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    console.log("SESSION CREATED:", session.id);

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