"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarCall } from "@runwayml/avatars-react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const started = useRef(false); // ✅ prevents loop

  useEffect(() => {
    if (started.current) return; // 🔴 STOP multiple calls
    started.current = true;

    const startSession = async () => {
      const res = await fetch("/api/session", { method: "POST" });
      const data = await res.json();
      console.log("CONNECT URL:", data.connectUrl);
      setUrl(data.connectUrl);
    };

    startSession();
  }, []);

  if (!url) return <div style={{ color: "black" }}>Loading...</div>;

  return (
    <AvatarCall
      avatarId="406b979c-0fd3-42e9-9d42-f950406977c2"
      connectUrl={url}
    />
  );
}