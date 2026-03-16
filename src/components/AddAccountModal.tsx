"use client";

import { useState } from "react";
import { addAccount } from "@/actions/account";

export function AddAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addAccount(formData);
    setLoading(false);
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="terminal-btn px-3 py-1.5 text-sm flex gap-2 items-center"
      >
        <span>+</span> Add Account
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="terminal-border bg-[#0b0b0b] p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2">
              <h2 className="text-sm font-bold text-white uppercase">Add New Account</h2>
              <button onClick={() => setIsOpen(false)} className="hover:text-white text-[#a1a1aa] uppercase text-sm">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm uppercase mb-2 text-[#a1a1aa]">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="terminal-input w-full px-4 py-2"
                  placeholder="user@domain.com"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
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
      )}
    </>
  );
}
