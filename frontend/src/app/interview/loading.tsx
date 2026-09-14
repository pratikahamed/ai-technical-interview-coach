import React from "react";
import { Loader2 } from "lucide-react";

export default function InterviewLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-surface-container rounded" />
          <div className="h-6 w-48 bg-surface-container rounded" />
        </div>
        <div className="h-8 w-24 bg-surface-container rounded-lg" />
      </div>

      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline specular-rim space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-surface-container rounded" />
          <div className="h-4 w-16 bg-surface-container rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-6 w-3/4 bg-surface-container rounded" />
          <div className="h-4 w-full bg-surface-container/60 rounded" />
          <div className="h-4 w-5/6 bg-surface-container/60 rounded" />
        </div>

        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-container/50 border border-outline flex items-center px-4 gap-3"
            >
              <div className="w-6 h-6 rounded-md bg-surface-container shrink-0" />
              <div className="h-4 w-2/3 bg-surface-container rounded" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center pt-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>CALIBRATING INTERVIEW SESSION...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
