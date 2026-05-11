import Runway from '@runwayml/sdk';
import { getPresetAvatarMetadata } from '@/lib/preset-avatars';

const client = new Runway({ apiKey: process.env.RUNWAY_API_KEY });

export async function POST(req: Request) {
  const { avatarId } = await req.json();

  const avatar = getPresetAvatarMetadata(avatarId)
    ? { type: 'runway-preset' as const, presetId: avatarId }
    : { type: 'custom' as const, avatarId };

  const { id: sessionId } = await client.realtimeSessions.create({
    model: 'gwm1_avatars',
    avatar,
  });

  // Poll until ready
  let sessionKey: string | undefined;
  for (let i = 0; i < 60; i++) {
    const session = await client.realtimeSessions.retrieve(sessionId);
    if (session.status === 'READY') { sessionKey = session.sessionKey; break; }
    if (session.status === 'FAILED') return Response.json({ error: 'Session failed' }, { status: 500 });
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!sessionKey) return Response.json({ error: 'Session timed out' }, { status: 504 });

  // Consume credentials
  const consumeResponse = await fetch(
    `${client.baseURL}/v1/realtime_sessions/${sessionId}/consume`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    }
  );
  const credentials = await consumeResponse.json();

  return Response.json({
    sessionId,
    serverUrl: credentials.url,
    token: credentials.token,
    roomName: credentials.roomName,
  });
}