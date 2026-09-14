import { CheckCircle, XCircle } from "lucide-react";
import { PASSING_THRESHOLD_PERCENT } from "@/lib/constants";

interface ScoreGaugeProps {
  score: number;
  total: number;
  percentage: number;
}

export function ScoreGauge({ score, total, percentage }: ScoreGaugeProps) {
  const isPassing = percentage >= PASSING_THRESHOLD_PERCENT;

  // SVG Radial Dial Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-surface-container-low border border-outline-variant shadow-2xl relative overflow-hidden">
      {/* Background ambient glow according to pass/fail */}
      <div
        className={`pointer-events-none absolute inset-0 blur-3xl opacity-15 ${
          isPassing ? "bg-tertiary" : "bg-error"
        }`}
      />

      <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant mb-4">
        Composite Score Calibration
      </span>

      {/* SVG Radial Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="10"
            className="stroke-surface-container fill-none"
          />
          {/* Glowing active progress arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`fill-none transition-all duration-1000 ease-out ${
              isPassing ? "stroke-tertiary" : "stroke-error"
            }`}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
            {percentage}%
          </span>
          <span className="font-mono text-xs text-on-surface-variant">
            {score} of {total} Correct
          </span>
        </div>
      </div>

      {/* Pass / Needs Improvement Status Pill */}
      <div className="mt-6">
        {isPassing ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Candidate Passed • Ready for Screening</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error/10 border border-error/30 text-error font-mono text-xs font-semibold">
            <XCircle className="w-4 h-4" />
            <span>Needs Improvement • Below 70% Target</span>
          </div>
        )}
      </div>
    </div>
  );
}
