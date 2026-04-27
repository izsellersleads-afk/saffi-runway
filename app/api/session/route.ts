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
    }) as any; // bypass SDK typing gap

    console.log("SESSION RESPONSE:", JSON.stringify(session));

    return Response.json({
      connectUrl: session.connect_url,
    });

  } catch (err: any) {
    console.error("SESSION ERROR:", JSON.stringify(err));
    return new Response(JSON.stringify(err), { status: 500 });
  }
}