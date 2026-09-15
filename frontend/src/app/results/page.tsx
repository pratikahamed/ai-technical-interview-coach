"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RotateCcw,
  Home,
  Loader2,
  Award,
  Printer,
} from "lucide-react";
import { ScoreGauge } from "@/components/modules/score-gauge";
import { safeStorage } from "@/hooks/use-session-storage";
import { QuizResult } from "@/types";
import { Button } from "@/components/ui/button";

const STORAGE_KEYS = {
  ACTIVE_TOPIC: "ai_technical_interview_active_topic",
  ACTIVE_SENIORITY: "ai_technical_interview_active_seniority",
  ACTIVE_DIFFICULTY: "ai_technical_interview_active_difficulty",
  ACTIVE_SESSION_ID: "ai_technical_interview_active_session_id",
  ACTIVE_ANSWERS: "ai_technical_interview_active_answers",
  QUIZ_RESULT: "ai_technical_interview_quiz_result",
};

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const parsed = safeStorage.getJSON<QuizResult>(STORAGE_KEYS.QUIZ_RESULT);
        if (!parsed) {
          router.replace("/interview");
          return;
        }
        setResult(parsed);
      } catch {
        router.replace("/interview");
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRetake = () => {
    safeStorage.removeItem(STORAGE_KEYS.QUIZ_RESULT);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_ANSWERS);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_SENIORITY);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_DIFFICULTY);
    router.push("/interview");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-[#060709] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060709] text-slate-100 relative selection:bg-cyan-500/20 selection:text-cyan-200">
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-25" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-cyan-500/10 blur-[140px] rounded-full z-0" />

      <main className="relative z-10 w-full pt-20 pb-16 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Title & Completed Pill */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 specular-rim">
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Completed // Server-Side Graded</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Technical Scorecard & Calibration
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Deterministic benchmark results for{" "}
              <strong className="text-slate-200 uppercase font-mono">
                {result.topic_id}
              </strong>
              . Review composite metrics and proofs below.
            </p>
          </div>

          {/* Core Score Gauge & Granular Diagnostics */}
          <ScoreGauge result={result} onRetake={handleRetake} />

          {/* Action Bar */}
          <div className="pt-6 border-t border-outline flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="primary"
                onClick={handleRetake}
                className="flex-1 sm:flex-none gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Assessment</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handlePrint}
                className="flex-1 sm:flex-none gap-2"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print Scorecard</span>
              </Button>
            </div>

            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Home className="w-4 h-4 text-slate-400" />
                <span>Return to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
