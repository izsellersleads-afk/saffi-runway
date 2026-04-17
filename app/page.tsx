"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarCall } from "@runwayml/avatars-react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const startSession = async () => {
      try {
        const res = await fetch("/api/session", { method: "POST" });

        if (!res.ok) {
          console.error("SESSION FAILED:", res.status);
          setError(true); // 🚨 STOP EVERYTHING
          return;
        }

        const data = await res.json();

        if (!data.connectUrl) {
          console.error("NO CONNECT URL");
          setError(true); // 🚨 STOP
          return;
        }

        console.log("CONNECT URL:", data.connectUrl);
        setUrl(data.connectUrl);

      } catch (err) {
        console.error("FETCH ERROR:", err);
        setError(true); // 🚨 STOP
      }
    };

    startSession();
  }, []);

  if (error) {
    return <div style={{ color: "red" }}>Session failed. Stopped to prevent loop.</div>;
  }

  if (!url) {
    return <div style={{ color: "black" }}>Loading...</div>;
  }

  return (
    <AvatarCall
      avatarId="406b979c-0fd3-42e9-9d42-f950406977c2"
      connectUrl={url}
    />
  );
}