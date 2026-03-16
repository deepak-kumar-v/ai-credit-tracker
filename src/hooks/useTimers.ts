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
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  
  const h = Math.floor(m / 60);
  const remainingM = m % 60;
  
  if (h > 0) {
    return `${h}h ${remainingM}m`;
  }
  
  return `0h ${m}m`;
}
