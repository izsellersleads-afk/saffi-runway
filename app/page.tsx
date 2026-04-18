"use client";

import { useEffect, useState } from "react";
import {
  AvatarSession,
  AvatarVideo,
  ControlBar,
} from "@runwayml/avatars-react";

export default function Home() {
  const [creds, setCreds] = useState<any>(null);

  useEffect(() => {
    const createSession = async () => {
      const res = await fetch("/api/session", { method: "POST" });
      const data = await res.json();

      console.log("CREDS:", data);

      if (data.serverUrl) {
        setCreds(data);
      }
    };

    createSession();
  }, []);

  if (!creds) return <div style={{ color: "white" }}>Connecting...</div>;

  return (
    <AvatarSession credentials={creds} audio video>
      <AvatarVideo />
      <ControlBar />
    </AvatarSession>
  );
}