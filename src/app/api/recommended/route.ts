import { getAccounts } from "@/actions/account";
import { calculateTimers, getAccountQueues } from "@/lib/timers";
import { NextResponse } from "next/server";

export async function GET() {
  const accounts = await getAccounts();
  const now = new Date();
  const withTimers = accounts.map(a => calculateTimers(a, now));
  
  const queues = getAccountQueues(withTimers);
  
  // Backward compatibility for extension: 
  // Return the best immediately available OR highest priority account
  const recommendedAccount = queues.claudeQueue[0] || queues.geminiQueue[0] || null;

  return NextResponse.json({ recommendedAccount });
}
