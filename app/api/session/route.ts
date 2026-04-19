import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { avatarId } = await req.json();

    if (!avatarId) {
      return Response.json(
        { error: "avatarId is required" },
        { status: 400 }
      );
    }

    console.log("➡️ Creating session...");

    // 1️⃣ CREATE SESSION
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    const sessionId = session.id;

    console.log("✅ Session created:", sessionId);

    // 2️⃣ POLL UNTIL READY
    let readySession: any = null;

    for (let i = 0; i < 30; i++) {
      const current = await client.realtimeSessions.retrieve(sessionId);

      if (current.status === "READY") {
        readySession = current;
        break;
      }

      if (current.status === "FAILED") {
        console.error("❌ Session failed:", current);
        return Response.json(
          { error: "Session failed" },
          { status: 500 }
        );
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!readySession) {
      console.error("❌ Session timeout");
      return Response.json(
        { error: "Session not ready" },
        { status: 504 }
      );
    }

    // 3️⃣ RETURN FULL SESSION OBJECT (IMPORTANT)
    // DO NOT strip fields
    return Response.json(readySession);

  } catch (err: any) {
    console.error("❌ SERVER ERROR:", err);

    return Response.json(
      {
        error:
          err?.response?.data ||
          err?.message ||
          "Unknown error",
      },
      { status: err?.status || 500 }
    );
  }
}