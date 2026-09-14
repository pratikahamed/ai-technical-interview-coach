"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw, Home, Loader2, Award } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { PerformanceSummary } from "@/components/results/PerformanceSummary";
import { QuestionReviewCard } from "@/components/results/QuestionReviewCard";
import { STORAGE_KEYS } from "@/lib/constants";
import { QuizResult } from "@/types/quiz";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedResult = sessionStorage.getItem(STORAGE_KEYS.QUIZ_RESULT);
      if (!storedResult) {
        // Direct access empty guard per PRD §6.3
        router.replace("/interview");
        return;
      }

      const parsed: QuizResult = JSON.parse(storedResult);
      setResult(parsed);
    } catch {
      router.replace("/interview");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleRetake = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.QUIZ_RESULT);
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_ANSWERS);
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
    } catch {
      // ignore
    }
    router.push("/interview");
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-on-surface relative selection:bg-primary selection:text-on-primary">
      {/* Background ambient lighting and grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-30" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-primary/10 blur-[140px] rounded-full z-0" />

      <Header />

      <main className="relative z-10 w-full pt-20 pb-24 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Top Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-tertiary px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Completed • Server-Side Scored</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
              Technical Scorecard &amp; Rubric Diagnostic
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-lg mx-auto">
              Staff-calibrated benchmark results. Review your architectural choices
              and invariant proofs below.
            </p>
          </div>

          {/* Radial Score Gauge */}
          <ScoreGauge
            score={result.score}
            total={result.total}
            percentage={result.percentage}
          />

          {/* Performance Summary Strip */}
          <PerformanceSummary
            topicId={result.topic_id}
            score={result.score}
            total={result.total}
            percentage={result.percentage}
          />

          {/* Detailed Question Review List */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <h2 className="font-semibold text-lg sm:text-xl text-on-surface tracking-tight">
                Granular Question Diagnostics
              </h2>
              <span className="font-mono text-xs text-on-surface-variant">
                {result.reviews.length} Scenarios Evaluated
              </span>
            </div>

            <div className="space-y-5">
              {result.reviews.map((review, idx) => (
                <QuestionReviewCard
                  key={review.question_id}
                  review={review}
                  index={idx}
                />
              ))}
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-6 border-t border-outline-variant/40 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-container to-secondary text-on-primary-container font-semibold text-sm shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_28px_rgba(76,215,246,0.55)] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Interview</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm border border-outline-variant transition-all"
            >
              <Home className="w-4 h-4 text-primary" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
