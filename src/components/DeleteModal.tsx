"use client";

export function DeleteModal({
  accountEmail,
  onConfirm,
  onCancel,
}: {
  accountEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm font-mono">
      <div className="terminal-border bg-[#0b0b0b] p-6 w-full max-w-sm">
        <h2 className="text-[#e5e5e5] text-sm mb-4">delete account?</h2>
        
        <p className="text-[#a1a1aa] mb-8 text-sm">
          account: <span className="text-white">{accountEmail}</span>
        </p>
        
        <div className="flex gap-4">
          <button 
            onClick={onConfirm}
            className="text-[#a1a1aa] hover:text-[#22c55e] transition-colors flex items-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[#22c55e] mr-1">&gt;</span>
            [ confirm ]
          </button>
          
          <button 
            onClick={onCancel}
            className="text-[#a1a1aa] hover:text-white transition-colors flex items-center group"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[#22c55e] mr-1">&gt;</span>
            [ cancel ]
          </button>
        </div>
      </div>
    </div>
  );
}
