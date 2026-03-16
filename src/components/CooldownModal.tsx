"use client";

import { useState } from "react";
import { setClaudeCooldown, setGeminiCooldown } from "@/actions/account";

type ModalType = "CLAUDE" | "GEMINI" | null;

export function CooldownModal({ 
  accountId, 
  accountEmail,
  type, 
  onClose 
}: { 
  accountId: string, 
  accountEmail: string,
  type: ModalType, 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false);

  if (!type) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const hours = parseInt(formData.get("hours") as string) || 0;
    const minutes = parseInt(formData.get("minutes") as string) || 0;
    const quotaAvailable = formData.get("quotaStatus") === "available";

    if (type === "CLAUDE") {
      await setClaudeCooldown(accountId, hours, minutes, quotaAvailable);
    } else {
      await setGeminiCooldown(accountId, hours, minutes, quotaAvailable);
    }
    
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="terminal-border bg-[#0b0b0b] p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2">
          <h2 className="text-sm font-bold uppercase text-white">
            Set {type} Cooldown
          </h2>
          <button onClick={onClose} className="hover:text-white uppercase text-sm text-[#a1a1aa]">
            ✕
          </button>
        </div>
        
        <div className="mb-6 text-sm text-[#a1a1aa]">
          Target: {accountEmail}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs uppercase mb-2 text-[#a1a1aa]">Quota Status:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="quotaStatus" 
                  value="available"
                  defaultChecked
                  className="accent-[#22c55e]"
                />
                <span className="text-white">✓ available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="quotaStatus" 
                  value="exhausted"
                  className="accent-[#22c55e]"
                />
                <span className="text-[#a1a1aa]">✗ exhausted</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-xs uppercase mb-2 text-[#a1a1aa]">Refresh period:</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input 
                  type="number" 
                  name="hours"
                  min="0"
                  defaultValue={0}
                  className="terminal-input w-full p-2 text-center text-lg mb-1"
                />
                <label className="block text-[10px] uppercase text-[#a1a1aa] text-center">Hours</label>
              </div>
              <div>
                <input 
                  type="number" 
                  name="minutes"
                  min="0"
                  max="59"
                  defaultValue={30}
                  className="terminal-input w-full p-2 text-center text-lg mb-1"
                />
                <label className="block text-[10px] uppercase text-[#a1a1aa] text-center">Minutes</label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="text-xs uppercase hover:underline text-[#a1a1aa] px-2"
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
