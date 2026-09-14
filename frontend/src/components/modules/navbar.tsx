"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Terminal, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

type ConnectionStatus = "checking" | "connected" | "error";

export function Navbar() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkConnection = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        cache: "no-store",
      });
      const elapsed = Math.round(performance.now() - startTime);

      if (response.ok) {
        setStatus("connected");
        setLatencyMs(elapsed);
      } else {
        setStatus("error");
        setLatencyMs(null);
      }
    } catch {
      setStatus("error");
      setLatencyMs(null);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkConnection(false);
    }, 0);
    const interval = setInterval(() => checkConnection(false), 20000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#090A0F]/85 backdrop-blur-xl border-b border-outline specular-rim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Platform Title */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline flex items-center justify-center text-primary specular-rim">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-100 flex items-center gap-2">
              AI Technical Interview Coach
              <Badge variant="primary" size="sm" className="hidden sm:inline-flex">
                v2.4
              </Badge>
            </span>
            <span className="font-mono text-[10px] text-slate-400 -mt-0.5">
              Deterministic Evaluation Engine
            </span>
          </div>
        </Link>

        {/* Right Status Indicator & Navigation */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/60 border border-outline text-xs font-mono specular-rim">
            <span className="relative flex h-2 w-2">
              {status === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === "connected"
                    ? "bg-tertiary"
                    : status === "error"
                    ? "bg-error"
                    : "bg-amber-400"
                }`}
              />
            </span>
            <span className="hidden sm:inline text-slate-300">
              {status === "connected"
                ? `Engine Active ${latencyMs ? `(${latencyMs}ms)` : ""}`
                : status === "error"
                ? "Engine Offline"
                : "Connecting..."}
            </span>
            <button
              type="button"
              onClick={() => checkConnection(true)}
              disabled={isRefreshing}
              title="Ping Backend Health"
              className="ml-1 p-0.5 rounded-full hover:bg-surface-container text-slate-400 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${isRefreshing ? "animate-spin text-primary" : ""}`}
              />
            </button>
          </div>

          <Link
            href="/interview"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-slate-950 font-semibold text-xs transition-all hover:bg-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-[0.98]"
          >
            <span>Start Practice</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
