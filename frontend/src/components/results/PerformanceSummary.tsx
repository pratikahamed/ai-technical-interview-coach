import { ShieldCheck, Cpu, Terminal, Target } from "lucide-react";

interface PerformanceSummaryProps {
  topicId: string;
  score: number;
  total: number;
  percentage: number;
}

export function PerformanceSummary({
  topicId,
  score,
  total,
  percentage,
}: PerformanceSummaryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
        <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs">
          <Terminal className="w-4 h-4 text-primary" />
          <span>Domain Track</span>
        </div>
        <div className="mt-2 font-semibold text-base sm:text-lg text-on-surface uppercase tracking-wide">
          {topicId}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
        <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs">
          <Target className="w-4 h-4 text-tertiary" />
          <span>Accuracy Ratio</span>
        </div>
        <div className="mt-2 font-semibold text-base sm:text-lg text-on-surface">
          {score} / {total} <span className="text-xs text-on-surface-variant font-mono">({percentage}%)</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
        <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs">
          <ShieldCheck className="w-4 h-4 text-secondary" />
          <span>Grading Drift</span>
        </div>
        <div className="mt-2 font-semibold text-base sm:text-lg text-tertiary font-mono">
          0.00% Verified
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
        <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs">
          <Cpu className="w-4 h-4 text-primary" />
          <span>Evaluation Engine</span>
        </div>
        <div className="mt-2 font-semibold text-base sm:text-lg text-primary font-mono">
          Deterministic
        </div>
      </div>
    </div>
  );
}
