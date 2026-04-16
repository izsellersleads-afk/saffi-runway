export async function GET() {
  const res = await fetch("https://api.runwayml.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      avatar_id: "1a46766f-f259-428c-93a1-9a1829f3e7a9",
    }),
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);
    return Response.json(json);
  } catch {
    return new Response(text, { status: 500 });
  }
}