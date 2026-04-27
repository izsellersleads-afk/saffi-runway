"use client";

import { useState } from "react";
import { AvatarCall } from "@runwayml/avatars-react";

export default function SaffiPage() {
  const [session, setSession] = useState<{ sessionId: string; sessionKey: string } | null>(null);

  const startSession = async () => {
    const res = await fetch("/api/avatar/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
      }),
    });
    const data = await res.json();
    console.log("SESSION DATA:", data);
    setSession(data);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {!session ? (
        <button onClick={startSession} style={{ margin: "40px", fontSize: "18px" }}>
          Start SAFFI
        </button>
      ) : (
        <AvatarCall
          sessionId={session.sessionId}
          sessionKey={session.sessionKey}
          avatarId="406b979c-0fd3-42e9-9d42-f950406977c2"
        />
      )}
    </div>
  );
}