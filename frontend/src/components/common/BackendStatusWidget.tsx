"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/constants";
import { RefreshCw } from "lucide-react";

type ConnectionStatus = "checking" | "connected" | "error";

export function BackendStatusWidget() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    // Heartbeat ping every 20 seconds
    const interval = setInterval(checkConnection, 20000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return (
    <aside
      aria-label="Backend Connection Status"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-4 right-4 z-50 transition-all duration-300 select-none"
    >
      <div
        className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-xl border font-mono text-xs shadow-2xl transition-all duration-300 ${
          status === "connected"
            ? "bg-surface-container-lowest/90 border-tertiary/40 text-tertiary shadow-[0_0_20px_rgba(16,185,129,0.18)] hover:border-tertiary/70"
            : status === "error"
            ? "bg-surface-container-lowest/90 border-error/50 text-error shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:border-error/80"
            : "bg-surface-container-lowest/90 border-outline-variant text-on-surface-variant"
        }`}
      >
        {/* Status Indicator Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          {status === "connected" ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary shadow-[0_0_8px_#10B981]" />
            </>
          ) : status === "error" ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-error shadow-[0_0_8px_#F43F5E]" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-outline animate-pulse" />
          )}
        </span>

        {/* Concise Status Text */}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {status === "connected" ? (
            <>
              <span className="font-semibold tracking-tight text-on-surface">
                Engine Live
              </span>
              <span className="text-on-surface-variant opacity-60">•</span>
              <span className="text-tertiary font-medium">
                {latencyMs !== null ? `${latencyMs}ms` : "Operational"}
              </span>
            </>
          ) : status === "error" ? (
            <>
              <span className="font-semibold tracking-tight text-error">
                Engine Offline
              </span>
              <span className="text-on-surface-variant opacity-60">•</span>
              <span className="text-xs text-error/80">Connection Lost</span>
            </>
          ) : (
            <span className="text-on-surface-variant">Connecting...</span>
          )}
        </div>

        {/* Manual Re-ping Action */}
        <button
          type="button"
          onClick={checkConnection}
          disabled={isRefreshing}
          title="Click to re-ping backend health"
          className="ml-1 p-0.5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3 h-3 ${isRefreshing ? "animate-spin text-primary" : ""}`}
          />
        </button>

        {/* Expanded Info Tooltip on Hover */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-lg bg-surface-container-high/95 backdrop-blur-md border border-outline-variant text-[11px] text-on-surface font-mono shadow-xl pointer-events-none whitespace-nowrap">
            <div className="flex items-center justify-between gap-4">
              <span className="text-on-surface-variant">API Target:</span>
              <span className="text-primary font-semibold">{API_BASE_URL}</span>
            </div>
            <div className="flex items-center justify-between gap-4 mt-1">
              <span className="text-on-surface-variant">Health Status:</span>
              <span
                className={
                  status === "connected"
                    ? "text-tertiary font-semibold"
                    : "text-error font-semibold"
                }
              >
                {status === "connected" ? "HTTP 200 OK" : "Unreachable"}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
