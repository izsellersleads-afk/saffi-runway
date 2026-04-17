import RunwayML from "@runwayml/sdk";

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET!,
});

// ✅ Simple GET for testing route
export async function GET() {
  return POST(new Request("http://localhost"));
}

// ✅ Main session creator
export async function POST(req: Request) {
  try {
    const avatarId = "406b979c-0fd3-42e9-9d42-f950406977c2";

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

       const consumeText = await consumeRes.text();
       console.log("🔥 CONSUME RAW:", consumeText);

       let consumeData;
       try {
         consumeData = JSON.parse(consumeText);
       } catch {
         return Response.json(
           { error: "Invalid JSON from consume", raw: consumeText },
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