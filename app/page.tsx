useEffect(() => {
  if (started.current) return;
  started.current = true;

  const startSession = async () => {
    try {
      const res = await fetch("/api/session", { method: "POST" });

      if (!res.ok) {
        console.error("SESSION FAILED:", res.status);
        return; // 🚨 STOP retry loop
      }

      const data = await res.json();

      if (!data.connectUrl) {
        console.error("NO CONNECT URL");
        return; // 🚨 STOP
      }

      console.log("CONNECT URL:", data.connectUrl);
      setUrl(data.connectUrl);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  startSession();
}, []);