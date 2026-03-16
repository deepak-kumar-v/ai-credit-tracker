"use client";

import { useState } from "react";
import { deleteAccount } from "@/actions/account";
import { AccountWithTimers } from "@/lib/timers";
import { formatMs } from "@/hooks/useTimers";
import { CooldownModal } from "./CooldownModal";
import { DeleteModal } from "./DeleteModal";

export function AccountTable({ 
  accounts,
  recClaudeId,
  recGeminiId
}: { 
  accounts: AccountWithTimers[],
  recClaudeId?: string,
  recGeminiId?: string
}) {
  const [modalState, setModalState] = useState<{
    accountId: string;
    accountEmail: string;
    type: "CLAUDE" | "GEMINI" | null;
  }>({ accountId: "", accountEmail: "", type: null });

  const [deleteState, setDeleteState] = useState<{
    accountId: string;
    accountEmail: string;
    isOpen: boolean;
  }>({ accountId: "", accountEmail: "", isOpen: false });

  function openModal(acc: AccountWithTimers, type: "CLAUDE" | "GEMINI") {
    setModalState({ accountId: acc.id, accountEmail: acc.email, type });
  }

  function closeModal() {
    setModalState({ accountId: "", accountEmail: "", type: null });
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left font-mono text-sm leading-relaxed border-collapse">
        <thead className="border-b border-[#333] text-[#a1a1aa]">
          <tr>
            <th className="py-3 px-4 w-2/5 font-medium border border-[#333]">Account</th>
            <th className="py-3 px-4 w-[20%] font-medium border border-[#333]">Claude</th>
            <th className="py-3 px-4 w-[20%] font-medium border border-[#333]">Gemini</th>
            <th className="py-3 px-4 w-[20%] text-center font-medium border border-[#333]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(acc => {
            const isRecommended = acc.id === recClaudeId || acc.id === recGeminiId;
            return (
            <tr key={acc.id} className="border-b border-[#333] hover:bg-[#1a1a1a] transition-colors">
              <td className={`py-3 px-4 truncate border border-[#333] ${isRecommended ? 'text-[#22c55e]' : ''}`}>
                {acc.email}
              </td>
              <td className="py-3 px-4 border border-[#333]">
                {acc.claudeQuotaAvailable ? (
                  <div className="text-[#22c55e] mb-1 animate-pulse">available</div>
                ) : (
                  <div className="text-[#9ca3af] mb-1">exhausted</div>
                )}
                <div className="text-xs text-[#a1a1aa] min-h-[16px]">
                  {formatMs(acc.claudeRemainingMs) ? `refresh ${formatMs(acc.claudeRemainingMs)}` : ""}
                </div>
              </td>
              <td className="py-3 px-4 border border-[#333]">
                {acc.geminiQuotaAvailable ? (
                  <div className="text-[#22c55e] mb-1 animate-pulse">available</div>
                ) : (
                  <div className="text-[#9ca3af] mb-1">exhausted</div>
                )}
                <div className="text-xs text-[#a1a1aa] min-h-[16px]">
                  {formatMs(acc.geminiRemainingMs) ? `refresh ${formatMs(acc.geminiRemainingMs)}` : ""}
                </div>
              </td>
              <td className="py-3 px-4 border border-[#333] text-[#a1a1aa]">
                <div className="flex justify-center items-center gap-3">
                  <button 
                    onClick={() => openModal(acc, "CLAUDE")}
                    className="hover:text-white transition-colors group flex items-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[#22c55e] mr-1">&gt;</span>
                    set_claude
                  </button>
                  <span className="opacity-50">·</span>
                  <button 
                    onClick={() => openModal(acc, "GEMINI")}
                    className="hover:text-white transition-colors group flex items-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-[#22c55e] mr-1">&gt;</span>
                    set_gemini
                  </button>
                  <span className="opacity-50">·</span>
                  <button 
                    onClick={() => setDeleteState({ accountId: acc.id, accountEmail: acc.email, isOpen: true })}
                    className="hover:text-red-400 transition-colors group flex items-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 text-red-500 mr-1">&gt;</span>
                    delete
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-[#a1a1aa] border border-[#333]">
                No accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modalState.type && (
        <CooldownModal
          accountId={modalState.accountId}
          accountEmail={modalState.accountEmail}
          type={modalState.type}
          onClose={closeModal}
        />
      )}
      
      {deleteState.isOpen && (
        <DeleteModal
          accountEmail={deleteState.accountEmail}
          onCancel={() => setDeleteState({ accountId: "", accountEmail: "", isOpen: false })}
          onConfirm={() => {
            deleteAccount(deleteState.accountId);
            setDeleteState({ accountId: "", accountEmail: "", isOpen: false });
          }}
        />
      )}
    </div>
  );
}
