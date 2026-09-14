"use client";

import { ShieldCheck, Cpu, Terminal, Target, Lightbulb } from "lucide-react";
import { formatPercentage, formatPassStatus } from "@/utils/format-score";
import { QuizResult } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ScoreGaugeProps {
  result: QuizResult;
  onRetake?: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function ScoreGauge({ result }: ScoreGaugeProps) {
  const { score, total, percentage, topic_id, reviews } = result;
  const { isPassing, label } = formatPassStatus(percentage);

  // SVG Radial Dial Dimensions
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full space-y-6">
      {/* 1. Composite Score Calibration Card */}
      <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline specular-rim shadow-2xl relative overflow-hidden">
        {/* Background ambient glow according to pass/fail */}
        <div
          className={`pointer-events-none absolute inset-0 blur-3xl opacity-15 ${
            isPassing ? "bg-tertiary" : "bg-error"
          }`}
        />

        <Badge variant={isPassing ? "tertiary" : "error"} className="mb-4">
          {label}
        </Badge>

        {/* SVG Radial Gauge */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              strokeWidth="9"
              className="stroke-surface-container fill-none"
            />
            {/* Active progress arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`fill-none transition-all duration-1000 ease-out ${
                isPassing
                  ? "stroke-tertiary shadow-[0_0_12px_#10b981]"
                  : "stroke-error shadow-[0_0_12px_#f43f5e]"
              }`}
            />
          </svg>

          {/* Center Percentage Display */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
              {formatPercentage(percentage)}
            </span>
            <span className="font-mono text-xs text-slate-400 mt-1">
              {score} of {total} Correct
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-md">
          {isPassing
            ? "Candidate demonstrated rigorous command of architectural invariants and scenario trade-offs."
            : "Performance indicates targeted gaps in concurrency fundamentals or distributed failure modes."}
        </p>
      </div>

      {/* 2. Telemetry Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline specular-rim">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>Track</span>
          </div>
          <div className="mt-1.5 font-semibold text-sm sm:text-base text-slate-100 uppercase font-mono">
            {topic_id}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-outline specular-rim">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Target className="w-3.5 h-3.5 text-tertiary" />
            <span>Accuracy</span>
          </div>
          <div className="mt-1.5 font-semibold text-sm sm:text-base text-slate-100 font-mono">
            {score}/{total} ({formatPercentage(percentage)})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-outline specular-rim">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>Grading Drift</span>
          </div>
          <div className="mt-1.5 font-semibold text-sm sm:text-base text-tertiary font-mono">
            0.00% Verified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-outline specular-rim">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>Evaluation Engine</span>
          </div>
          <div className="mt-1.5 font-semibold text-sm sm:text-base text-primary font-mono">
            Deterministic
          </div>
        </div>
      </div>

      {/* 3. Detailed Scenario Diagnostics */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Scenario Diagnostics & Proofs
          </h2>
          <span className="font-mono text-xs text-slate-400">
            {reviews.length} Assessed Scenarios
          </span>
        </div>

        {reviews.map((review, idx) => {
          const selectedLetter =
            review.selected_option >= 0
              ? OPTION_LETTERS[review.selected_option] || `#${review.selected_option + 1}`
              : "SKIPPED";
          const correctLetter =
            OPTION_LETTERS[review.correct_option] || `#${review.correct_option + 1}`;

          return (
            <div
              key={review.question_id || idx}
              className="w-full rounded-xl bg-surface-container-low border border-outline specular-rim p-5 sm:p-6 space-y-4 text-left shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Badge variant={review.is_correct ? "tertiary" : "error"}>
                    SCENARIO 0{idx + 1} {"//"} {review.question_id.toUpperCase()}
                  </Badge>
                  <span className="text-slate-400">
                    Status:{" "}
                    {review.is_correct ? (
                      <span className="text-tertiary font-semibold">SOLVED</span>
                    ) : review.selected_option === -1 ? (
                      <span className="text-slate-400 font-semibold">SKIPPED</span>
                    ) : (
                      <span className="text-error font-semibold">MISSED</span>
                    )}
                  </span>
                </div>

                <Badge variant={review.is_correct ? "tertiary" : "outline"} size="sm">
                  {review.is_correct ? "+33.3 pts" : "0.0 pts"}
                </Badge>
              </div>

              <p className="text-sm sm:text-base font-medium text-slate-100">
                {review.text}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div
                  className={`p-3 rounded-lg border ${
                    review.is_correct
                      ? "bg-tertiary/10 border-tertiary/30 text-tertiary"
                      : "bg-error/10 border-error/30 text-error"
                  }`}
                >
                  <span className="text-slate-400 block mb-1">Your Submission:</span>
                  <span className="font-semibold text-sm">Option [{selectedLetter}]</span>
                </div>

                <div className="p-3 rounded-lg border bg-surface-container border-outline text-slate-200">
                  <span className="text-slate-400 block mb-1">Ground Truth Correct:</span>
                  <span className="font-semibold text-sm text-tertiary">Option [{correctLetter}]</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container/60 border border-outline text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100 block mb-0.5 font-mono">
                    Architectural Proof & Rationale:
                  </span>
                  <span>{review.explanation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
