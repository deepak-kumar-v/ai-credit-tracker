import { useState, useEffect, useRef } from "react";
import { Account } from "@prisma/client";
import { AccountWithTimers, calculateTimers, getAccountQueues } from "@/lib/timers";

export function useTimers(initialAccounts: Account[]) {
  const [accounts, setAccounts] = useState<AccountWithTimers[]>([]);
  const [queues, setQueues] = useState<{ claudeQueue: AccountWithTimers[], geminiQueue: AccountWithTimers[] }>({
    claudeQueue: [],
    geminiQueue: []
  });
  
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const updated = initialAccounts.map(acc => calculateTimers(acc, now));
      setAccounts(updated);
      setQueues(getAccountQueues(updated));

      // Check for notifications
      updated.forEach(acc => {
        // Claude notification
        const cKey = `${acc.id}-claude-${acc.claudeNextRefresh?.getTime()}`;
        if (acc.claudeStatus === "READY" && acc.claudeNextRefresh && !notifiedRef.current.has(cKey)) {
          notifiedRef.current.add(cKey);
          if (Notification.permission === "granted") {
            new Notification("Claude READY", { body: `Claude credits refreshed for ${acc.email}!` });
          }
        }
        
        // Gemini notification
        const gKey = `${acc.id}-gemini-${acc.geminiNextRefresh?.getTime()}`;
        if (acc.geminiStatus === "READY" && acc.geminiNextRefresh && !notifiedRef.current.has(gKey)) {
          notifiedRef.current.add(gKey);
          if (Notification.permission === "granted") {
            new Notification("Gemini READY", { body: `Gemini ready for ${acc.email}!` });
          }
        }
      });
    };

    tick(); // Initial sync
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [initialAccounts]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return { accounts, queues };
}

export function formatMs(ms: number) {
  if (ms <= 0) return null;
  
  const totalSeconds = Math.ceil(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  
  const totalMinutes = Math.ceil(ms / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  
  if (d > 0) {
    if (h > 0) return `${d}d ${h}h`;
    return `${d}d`;
  }
  
  if (h > 0) {
    if (m > 0) return `${h}h ${m}m`;
    return `${h}h`;
  }
  
  return `${m}m`;
}
