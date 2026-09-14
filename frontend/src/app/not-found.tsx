import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#060709] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500/20">
      <div className="max-w-md w-full mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 specular-rim">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-semibold">
            Error 404 // Route Not Found
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The requested assessment resource or evaluation session does not exist. Verify the target URL or return to the platform home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs tracking-wide transition-all specular-rim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/interview"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline text-slate-200 font-mono text-xs transition-all specular-rim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Track Catalog</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
