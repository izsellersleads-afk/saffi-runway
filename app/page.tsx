"use client";

import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
} from "@runwayml/avatars-react";

export default function Home() {
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

          connect={async (avatarId) => {
            console.log("Creating session for avatar:", avatarId);

            const res = await fetch("/api/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ avatarId }),
            });

            const data = await res.json();

            console.log("SESSION RESPONSE:", data);

            if (!res.ok) {
              throw new Error("Session failed");
            }

            return data;
          }}

          onConnected={() => {
            console.log("✅ CONNECTED TO AVATAR");
          }}

          onDisconnected={() => {
            console.log("❌ DISCONNECTED");
          }}

          onError={(err) => {
            console.error("🚨 AVATAR ERROR:", err);
          }}
        >
          <AvatarVideo />
          <ControlBar />
        </AvatarCall>
      </div>
    </main>
  );
}