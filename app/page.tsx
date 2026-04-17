"use client";

import { useMemo } from "react";
import {
  AvatarCall,
  AvatarVideo,
  ControlBar,
} from "@runwayml/avatars-react";

export default function Home() {
  // 🔒 This prevents re-creation on every render
  const requestData = useMemo(
    () => ({
      avatarId: "406b979c-0fd3-42e9-9d42-f950406977c2",
    }),
    []
  );

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
          connectUrl="/api/session"
          requestData={requestData}
        >
          <AvatarVideo />
          <ControlBar />
        </AvatarCall>
      </div>
    </main>
  );
}