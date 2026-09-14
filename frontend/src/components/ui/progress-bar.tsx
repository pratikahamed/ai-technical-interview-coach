import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  label?: string;
}

export function ProgressBar({
  current,
  total,
  className = "",
  label = "Question Progress",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      className={`w-full bg-surface-container rounded-full h-1.5 overflow-hidden border border-outline ${className}`}
    >
      <div
        className="bg-primary h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_#38BDF8]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
