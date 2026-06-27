"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount(initialCount: number = 0): {
  unreadCount: number;
  refetch: () => void;
} {
  const [unreadCount, setUnreadCount] = useState(initialCount);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const json = await res.json();
      setUnreadCount(json.unreadCount ?? 0);
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    fetchCount(); // immediate fetch
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    refetch: fetchCount,
  };
}
