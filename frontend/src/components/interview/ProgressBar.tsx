interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
        <span>
          Question <strong className="text-primary">{current + 1}</strong> of{" "}
          <strong>{total}</strong>
        </span>
        <span className="text-primary font-semibold">{percentage}% Complete</span>
      </div>

      <div className="flex gap-1.5 w-full h-2">
        {Array.from({ length: total }).map((_, idx) => {
          const isCompleted = idx <= current;
          const isCurrent = idx === current;
          return (
            <div
              key={idx}
              className={`flex-1 h-full rounded-full transition-all duration-300 ${
                isCurrent
                  ? "bg-primary shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                  : isCompleted
                  ? "bg-primary/60"
                  : "bg-surface-container"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
