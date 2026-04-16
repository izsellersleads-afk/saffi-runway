import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// ✅ Simple GET for testing route
export async function GET() {
  return Response.json({ message: "Session endpoint ready" });
}

// ✅ Main session creator
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const avatarId = body?.avatarId;

    if (!avatarId) {
      return Response.json(
        { error: "avatarId required" },
        { status: 400 }
      );
    }

    // 🔹 1. Create session
    const session = await client.realtimeSessions.create({
      model: "gwm1_avatars",
      avatar: {
        type: "custom",
        avatarId,
      },
    });

    const sessionId = session.id;

    if (!sessionId) {
      return Response.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // 🔹 2. Wait until READY
    let sessionKey: string | undefined;

    for (let i = 0; i < 20; i++) {
      const statusCheck = await client.realtimeSessions.retrieve(sessionId);

      if (statusCheck.status === "READY") {
        sessionKey = statusCheck.sessionKey;
        break;
      }

      if (statusCheck.status === "FAILED") {
        return Response.json(
          { error: "Session failed during creation" },
          { status: 500 }
        );
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!sessionKey) {
      return Response.json(
        { error: "Session timeout (never became READY)" },
        { status: 504 }
      );
    }

    // 🔹 3. Consume session → required for AvatarCall
    const consumeRes = await fetch(
      `https://api.dev.runwayml.com/v1/realtime_sessions/${sessionId}/consume`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({}),
      }
    );

    // 🔥 Check HTTP response BEFORE parsing
    if (!consumeRes.ok) {
      const text = await consumeRes.text();
      console.error("Consume failed:", text);

      return Response.json(
        {
          error: "Consume request failed",
          details: text,
        },
        { status: 500 }
      );
    }

    const consumeData = await consumeRes.json();

    if (!consumeData?.url) {
      console.error("Consume response missing url:", consumeData);

      return Response.json(
        {
          error: "No connectUrl returned",
          details: consumeData,
        },
        { status: 500 }
      );
    }

    // 🔹 4. Return ONLY what frontend needs
    return Response.json({
      connectUrl: consumeData.url,
    });

  } catch (err: any) {
    console.error("FULL ERROR:", err);

    return Response.json(
      {
        error: err?.message || "Unknown error",
        details: err,
      },
      { status: 500 }
    );
  }
}