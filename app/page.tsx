"use client";

import { useEffect } from "react";

export default function Home() {
  console.log("🔥 PAGE RENDERED");

  useEffect(() => {
    console.log("🚀 USE EFFECT RUNNING");

    fetch("/api/session", {
      method: "POST", // 🔴 THIS IS THE FIX
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("✅ SESSION RESPONSE:", data);
      })
      .catch(err => {
        console.error("❌ FETCH ERROR:", err);
      });

  }, []);

  return (
    <div style={{ color: "white", background: "black", height: "100vh" }}>
      🚨 TEST PAGE LOADED 🚨
    </div>
  );
}