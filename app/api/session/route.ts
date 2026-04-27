import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: avatarId,
      },
    }) as any;

    console.log("FULL SESSION:", JSON.stringify(session));

    // Temporary debug — return everything
    return Response.json(session);

  } catch (err: any) {
    console.error("SESSION ERROR:", JSON.stringify(err));
    return new Response(JSON.stringify(err), { status: 500 });
  }
}