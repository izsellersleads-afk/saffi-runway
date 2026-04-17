"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarCall } from "@runwayml/avatars-react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const startSession = async () => {
      try {
        const res = await fetch("/api/session", { method: "POST" });

        if (!res.ok) {
          console.error("SESSION FAILED:", res.status);
          return;
        }

        const data = await res.json();

        if (!data.connectUrl) {
          console.error("NO CONNECT URL");
          return;
        }

        console.log("CONNECT URL:", data.connectUrl);
        setUrl(data.connectUrl);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    startSession();
  }, []);

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