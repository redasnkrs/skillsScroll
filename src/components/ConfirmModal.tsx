"use client";

import { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-900 flex items-center justify-center text-red-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white">{title}</h3>
        </div>
        
        <p className="text-zinc-400 text-sm leading-relaxed mb-10 font-light italic">
          "{message}"
        </p>
        
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg border border-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all"
          >
            Abort Sequence
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 px-6 py-3 rounded-lg bg-red-600 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all"
          >
            Confirm Termination
          </button>
        </div>
      </div>
    </div>
  );
}
