import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#060709] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500/20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center specular-rim">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            System Initializing
          </p>
          <p className="text-sm text-slate-400">
            Loading technical assessment environment...
          </p>
        </div>
      </div>
    </main>
  );
}
