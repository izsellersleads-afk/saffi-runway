"use client";

import { useEffect, useState } from "react";
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
} from "@runwayml/avatars-react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch("/api/session", {
          method: "POST",
        });

        const data = await res.json();

        console.log("SESSION RESPONSE:", data);

        // ✅ ONLY SET WHEN READY
        if (data.connectUrl) {
          setUrl(data.connectUrl);
        } else {
          console.warn("Session not ready yet");
        }

      } catch (err) {
        console.error("SESSION FETCH ERROR:", err);
      }
    };

    createSession();
  }, []); // 🔒 runs ONCE only

  if (!url) {
    return (
      <div style={{ color: "white" }}>
        Waiting for session...
      </div>
    );
  }

  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "900px", height: "600px" }}>
        <AvatarCall
          avatarId="406b979c-0fd3-42e9-9d42-f950406977c2"
          connectUrl={url}
        >
          <AvatarVideo />
          <ControlBar />
        </AvatarCall>
      </div>
    </main>
  );
}