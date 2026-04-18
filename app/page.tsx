"use client";

import { useEffect, useState } from "react";
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
} from "@runwayml/avatars-react";

export default function Home() {
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch("/api/session", {
          method: "POST",
        });

        const data = await res.json();

        console.log("SESSION RESPONSE:", data);

        if (data.sessionKey) {
          setSessionKey(data.sessionKey);
        } else {
          console.warn("No sessionKey, retrying...");
          setTimeout(createSession, 2000);
        }
      } catch (err) {
        console.error("SESSION FETCH ERROR:", err);
      }
    };

    createSession();
  }, []);

  if (!sessionKey) {
    return (
      <div style={{ color: "white" }}>
        Connecting to SAFFI… this can take up to 30–60 seconds
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
      <div
        style={{
          width: "900px",
          height: "600px",
          border: "2px solid red",
        }}
      >
        <AvatarCall sessionKey={sessionKey}>
          <AvatarVideo />
          <ControlBar />
        </AvatarCall>
      </div>
    </main>
  );
}