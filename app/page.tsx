"use client";

import { useEffect, useState } from "react";
import { AvatarCall } from "@runwayml/avatars-react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        console.log("CONNECT URL:", data.connectUrl);
        setUrl(data.connectUrl);
      });
  }, []);

  if (!url) return <div style={{ color: "white" }}>Loading...</div>;

  return (
  <AvatarCall
    avatarId="406b979c-0fd3-42e9-9d42-f950406977c2"
    connectUrl={url}
  />
);
}