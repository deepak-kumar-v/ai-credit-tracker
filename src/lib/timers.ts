import { Account } from "@prisma/client";
import { differenceInMilliseconds, addMinutes } from "date-fns";

export type TimerStatus = "READY" | "Cooling down";

export interface AccountWithTimers {
  id: string;
  email: string;
  claudeStatus: TimerStatus;
  geminiStatus: TimerStatus;
  claudeRemainingMs: number;
  geminiRemainingMs: number;
  claudeNextRefresh: Date | null;
  geminiNextRefresh: Date | null;
  claudeQuotaAvailable: boolean;
  geminiQuotaAvailable: boolean;
  plan: string;
}

export function calculateTimers(account: Account, now: Date): AccountWithTimers {
  let claudeStatus: TimerStatus = "READY";
  let claudeRemainingMs = 0;
  // Fallback to true if Prisma hasn't loaded the defaults into the object properly just yet
  let claudeQuotaAvailable = 'claudeQuotaAvailable' in account ? account.claudeQuotaAvailable as boolean : true;
  let claudeNextRefresh = account.claudeNextRefresh;

  if (account.claudeNextRefresh) {
    claudeRemainingMs = differenceInMilliseconds(account.claudeNextRefresh, now);
    if (claudeRemainingMs > 0) {
      claudeStatus = "Cooling down";
    } else {
      claudeRemainingMs = 0;
      claudeNextRefresh = null;
    }
  }

  let geminiStatus: TimerStatus = "READY";
  let geminiRemainingMs = 0;
  let geminiQuotaAvailable = 'geminiQuotaAvailable' in account ? account.geminiQuotaAvailable as boolean : true;
  let geminiNextRefresh = account.geminiNextRefresh;

  if (account.geminiNextRefresh) {
    geminiRemainingMs = differenceInMilliseconds(account.geminiNextRefresh, now);
    if (geminiRemainingMs > 0) {
      geminiStatus = "Cooling down";
    } else {
      geminiRemainingMs = 0;
      geminiNextRefresh = null;
    }
  }

  return {
    id: account.id,
    email: account.email,
    claudeStatus,
    claudeRemainingMs,
    claudeNextRefresh,
    claudeQuotaAvailable,
    geminiStatus,
    geminiRemainingMs,
    geminiNextRefresh,
    geminiQuotaAvailable,
    plan: 'plan' in account ? account.plan as string : "unknown",
  };
}

export function getAccountQueues(accounts: AccountWithTimers[]) {
  if (accounts.length === 0) {
    return {
      claudeQueue: [],
      geminiQueue: []
    };
  }

  // Claude Queue
  const claudeQueue = [...accounts].sort((a, b) => {
    // 1. Prioritize if quota is available
    if (a.claudeQuotaAvailable && !b.claudeQuotaAvailable) return -1;
    if (!a.claudeQuotaAvailable && b.claudeQuotaAvailable) return 1;
    // 2. Fall back to shortest cooldown amount remaining
    return a.claudeRemainingMs - b.claudeRemainingMs;
  });

  // Gemini Queue
  const geminiQueue = [...accounts].sort((a, b) => {
    // 1. Prioritize if quota is available
    if (a.geminiQuotaAvailable && !b.geminiQuotaAvailable) return -1;
    if (!a.geminiQuotaAvailable && b.geminiQuotaAvailable) return 1;
    // 2. Fall back to shortest cooldown amount remaining
    return a.geminiRemainingMs - b.geminiRemainingMs;
  });

  return {
    claudeQueue,
    geminiQueue
  };
}
