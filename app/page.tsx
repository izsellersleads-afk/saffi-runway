"use client";

import { useEffect, useState } from "react";
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
} from "@runwayml/avatars-react";

export default function Home() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // prevents duplicate updates

    const createSession = async () => {
      console.log("🚀 Creating session...");

      try {
        const res = await fetch("/api/session", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        console.log("✅ SESSION RESPONSE:", data);

        if (isMounted) {
          if (data?.connectUrl) {
            setUrl(data.connectUrl);
          } else {
            setError("No connectUrl returned");
          }
        }
      } catch (err: any) {
        console.error("❌ SESSION FETCH ERROR:", err);
        if (isMounted) {
          setError(err.message || "Unknown error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    createSession();

    return () => {
      isMounted = false; // cleanup
    };
  }, []);

  // 🔄 Loading state
  if (loading) {
    return <div style={{ color: "white" }}>Loading session...</div>;
  }

  // ❌ Error state
  if (error) {
    return (
      <div style={{ color: "red" }}>
        Error: {error}
      </div>
    );
  }

  // 🛑 Safety check
  if (!url) {
    return <div style={{ color: "white" }}>No session URL</div>;
  }

  // 🎥 Avatar render
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