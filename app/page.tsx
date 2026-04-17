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

        if (data.connectUrl) {
          setUrl(data.connectUrl);
        }
      } catch (err) {
        console.error("SESSION FETCH ERROR:", err);
      }
    };

    createSession();
  }, []);

  if (!url) {
    return <div style={{ color: "white" }}>Loading...</div>;
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