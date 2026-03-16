"use client";

import { useState } from "react";
import { editPlan } from "@/actions/account";

export function EditPlanModal({
  accountId,
  accountEmail,
  currentPlan,
  onClose
}: {
  accountId: string;
  accountEmail: string;
  currentPlan: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<"yearly" | "monthly_trial" | "none" | "unknown">(
    (currentPlan as any) || "unknown"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await editPlan(accountId, plan);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="terminal-border bg-[#0b0b0b] p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2">
          <h2 className="text-sm font-bold text-white uppercase">Edit Plan</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="hover:text-white text-[#a1a1aa] uppercase text-sm"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4 text-sm">
            <span className="text-[#a1a1aa]">Email:</span>{" "}
            <span className="text-white">{accountEmail}</span>
          </div>

          <div>
            <label className="block text-sm uppercase mb-2 text-[#a1a1aa]">Plan Type</label>
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="plan" 
                  value="yearly"
                  checked={plan === "yearly"}
                  onChange={() => setPlan("yearly")}
                  className="accent-[#22c55e]"
                />
                <span className="text-white">Yearly Plan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="plan" 
                  value="monthly_trial"
                  checked={plan === "monthly_trial"}
                  onChange={() => setPlan("monthly_trial")}
                  className="accent-[#22c55e]"
                />
                <span className="text-white">Monthly Trial</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="plan" 
                  value="none"
                  checked={plan === "none"}
                  onChange={() => setPlan("none")}
                  className="accent-[#22c55e]"
                />
                <span className="text-[#a1a1aa]">No Plan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="plan" 
                  value="unknown"
                  checked={plan === "unknown"}
                  onChange={() => setPlan("unknown")}
                  className="accent-[#22c55e]"
                />
                <span className="text-yellow-400">Decide Later</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="text-sm uppercase hover:underline text-[#a1a1aa] px-2"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="terminal-btn px-4 py-2 text-sm"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
