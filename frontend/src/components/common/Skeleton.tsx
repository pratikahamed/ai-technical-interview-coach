import React from "react";

export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded bg-surface-container/60 border border-outline-variant/30 ${className}`}
    />
  );
}

export function TopicCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col justify-between h-[200px] animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-surface-container" />
          <div className="w-16 h-5 rounded-full bg-surface-container" />
        </div>
        <div className="w-3/4 h-6 rounded bg-surface-container" />
        <div className="w-full h-10 rounded bg-surface-container/50" />
      </div>
      <div className="w-24 h-4 rounded bg-surface-container" />
    </div>
  );
}
