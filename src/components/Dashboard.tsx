"use client";

import { Account } from "@prisma/client";
import { useTimers, formatMs } from "@/hooks/useTimers";
import { AccountTable } from "./AccountTable";
import { AddAccountModal } from "./AddAccountModal";

export function Dashboard({ initialAccounts }: { initialAccounts: Account[] }) {
  const { accounts, queues } = useTimers(initialAccounts);

  const claudeAvailableCount = accounts.filter(a => a.claudeQuotaAvailable).length;
  const geminiAvailableCount = accounts.filter(a => a.geminiQuotaAvailable).length;

  const claudeRec = queues.claudeQueue[0];
  const claudeNext = queues.claudeQueue[1];
  const isClaudeExhausted = claudeRec && !claudeRec.claudeQuotaAvailable;

  const geminiRec = queues.geminiQueue[0];
  const geminiNext = queues.geminiQueue[1];
  const isGeminiExhausted = geminiRec && !geminiRec.geminiQuotaAvailable;

  return (
    <div className="min-h-screen p-6 md:p-12 font-mono flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Terminal Header */}
        <div className="mb-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-[#333] pb-4">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-[#e5e5e5]">
                AI CREDIT TRACKER <span className="text-[#22c55e] terminal-cursor">_</span>
              </h1>
              <p className="opacity-80 mt-1 text-sm text-[#a1a1aa]">
                SYSTEM_STATUS: ONLINE | ACCOUNTS_TRACKED: {accounts.length}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <AddAccountModal />
            </div>
          </div>
        </div>

        {/* Queues Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Claude Queue */}
          <div className="terminal-border p-5 bg-[#0b0b0b]">
            <h2 className="text-[#a1a1aa] lowercase text-xs mb-3 font-bold tracking-wider border-b border-[#333] pb-2">
              &gt; claude_recommend()
            </h2>
            <div className="space-y-2 text-sm">
              {isClaudeExhausted ? (
                <>
                  <div className="flex">
                    <span className="text-[#a1a1aa] w-28 pl-4">Recommended:</span>
                    <span className="text-white font-bold opacity-80">NONE</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#a1a1aa] w-28 pl-4">Next Ready :</span>
                    <span className="text-[#22c55e]">
                      {claudeRec.email} 
                      <span className="text-[#a1a1aa] ml-1">
                        ({formatMs(claudeRec.claudeRemainingMs)})
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex">
                    <span className="text-[#22c55e] mr-2">&gt;</span>
                    <span className="text-[#a1a1aa] w-28">Recommended:</span>
                    <span className="text-white font-bold">
                      {claudeRec?.email || "NONE"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="invisible mr-2">→</span>
                    <span className="text-[#a1a1aa] w-28">Next:</span>
                    <span className="text-white">
                      {claudeNext?.email || "NONE"}
                    </span>
                  </div>
                </>
              )}
              
              <div className="text-[#a1a1aa] pt-4 mt-2 border-t border-[#333]/50">
                Claude available: <span className={claudeAvailableCount > 0 ? "text-white" : "text-red-400"}>{claudeAvailableCount}</span>
              </div>
            </div>
          </div>

          {/* Gemini Queue */}
          <div className="terminal-border p-5 bg-[#0b0b0b]">
            <h2 className="text-[#a1a1aa] lowercase text-xs mb-3 font-bold tracking-wider border-b border-[#333] pb-2">
              &gt; gemini_recommend()
            </h2>
            <div className="space-y-2 text-sm">
              {isGeminiExhausted ? (
                <>
                  <div className="flex">
                    <span className="text-[#a1a1aa] w-28 pl-4">Recommended:</span>
                    <span className="text-white font-bold opacity-80">NONE</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#a1a1aa] w-28 pl-4">Next Ready :</span>
                    <span className="text-[#22c55e]">
                      {geminiRec.email} 
                      <span className="text-[#a1a1aa] ml-1">
                        ({formatMs(geminiRec.geminiRemainingMs)})
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex">
                    <span className="text-[#22c55e] mr-2">&gt;</span>
                    <span className="text-[#a1a1aa] w-28">Recommended:</span>
                    <span className="text-white font-bold">
                      {geminiRec?.email || "NONE"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="invisible mr-2">→</span>
                    <span className="text-[#a1a1aa] w-28">Next:</span>
                    <span className="text-white">
                      {geminiNext?.email || "NONE"}
                    </span>
                  </div>
                </>
              )}
              
              <div className="text-[#a1a1aa] pt-4 mt-2 border-t border-[#333]/50">
                Gemini available: <span className={geminiAvailableCount > 0 ? "text-white" : "text-red-400"}>{geminiAvailableCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Output Table */}
        <div className="mb-2 flex justify-between text-[#a1a1aa] text-xs uppercase tracking-wider px-1">
          <span>accounts</span>
          <span>model status</span>
        </div>
        <div className="terminal-border p-6 bg-[#0b0b0b]">
          <AccountTable 
            accounts={accounts} 
            recClaudeId={isClaudeExhausted ? undefined : claudeRec?.id} 
            recGeminiId={isGeminiExhausted ? undefined : geminiRec?.id} 
          />
        </div>
      </div>
    </div>
  );
}
