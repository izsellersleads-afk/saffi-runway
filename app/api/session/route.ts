import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST() {
  try {
    console.log("Creating Runway session...");

    // 1️⃣ CREATE SESSION
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      },
    });

    console.log("SESSION CREATED:", session);

    if (!session?.id) {
      throw new Error("No session ID returned");
    }

    // 2️⃣ POLL SESSION UNTIL READY
    let sessionData = null;

    for (let i = 0; i < 10; i++) {
      console.log(`Polling session... attempt ${i + 1}`);

      await new Promise((r) => setTimeout(r, 1000));

      const res = await fetch(
        `https://api.dev.runwayml.com/v1/realtime/sessions/${session.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RUNWAYML_API_SECRET}`,
          },
        }
      );

      const data = await res.json();

      console.log("SESSION STATUS:", data);

      if (data?.status === "ready") {
        sessionData = data;
        break;
      }
    }

    if (!sessionData) {
      throw new Error("Session never became ready");
    }

    // 3️⃣ RETURN CONNECT DATA
    return Response.json({
      connectUrl: sessionData.connect_url,
    });

  } catch (err: any) {
    console.error("SESSION ERROR:", err);
    return Response.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}