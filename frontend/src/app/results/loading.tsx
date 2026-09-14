import React from "react";
import { Loader2 } from "lucide-react";

export default function ResultsLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8">
      <div className="text-center space-y-3">
        <div className="h-6 w-40 bg-surface-container rounded-full mx-auto" />
        <div className="h-8 w-64 bg-surface-container rounded mx-auto" />
        <div className="h-4 w-96 bg-surface-container/60 rounded mx-auto" />
      </div>

      <div className="p-8 rounded-2xl bg-surface-container-low border border-outline specular-rim flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-36 h-36 rounded-full bg-surface-container/50 border-4 border-surface-container flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
        <div className="space-y-2 text-center">
          <div className="h-5 w-48 bg-surface-container rounded mx-auto" />
          <div className="h-4 w-64 bg-surface-container/60 rounded mx-auto" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-surface-container-low border border-outline space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-surface-container rounded" />
              <div className="h-4 w-16 bg-surface-container rounded" />
            </div>
            <div className="h-5 w-5/6 bg-surface-container rounded" />
            <div className="h-12 w-full bg-surface-container/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
