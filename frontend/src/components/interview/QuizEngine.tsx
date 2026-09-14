"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
  RotateCcw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { QuestionPublic, Topic } from "@/types/quiz";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";

interface QuizEngineProps {
  topic: Topic;
  questions: QuestionPublic[];
  answers: Record<string, number>;
  onSelectAnswer: (questionId: string, optionIndex: number) => void;
  onSubmitQuiz: () => Promise<void>;
  onExit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  onClearSubmitError: () => void;
}

export function QuizEngine({
  topic,
  questions,
  answers,
  onSelectAnswer,
  onSubmitQuiz,
  onExit,
  isSubmitting,
  submitError,
  onClearSubmitError,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Top Chrome: Track & Exit */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit &amp; Change Track</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 font-semibold">
            {topic.name}
          </span>
        </div>
      </div>

      {/* Segmented Progress Rail */}
      <div className="mb-8">
        <ProgressBar current={currentIndex} total={totalQuestions} />
      </div>

      {/* Submission Failure Inline Alert */}
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/40 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-error text-sm">
                Submission Sync Failed
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {submitError} Your answers are securely preserved locally.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClearSubmitError();
              onSubmitQuiz();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-error/20 hover:bg-error/30 text-error font-mono text-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Submission</span>
          </button>
        </div>
      )}

      {/* Active Question Prompt */}
      <QuestionCard
        question={currentQuestion}
        questionIndex={currentIndex}
        selectedIndex={answers[currentQuestion.id]}
        onSelectOption={(optIdx) => onSelectAnswer(currentQuestion.id, optIdx)}
      />

      {/* Navigation Footer */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={isFirst || isSubmitting}
          onClick={handlePrev}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
            isFirst || isSubmitting
              ? "bg-surface-container/40 text-on-surface-variant/30 border-outline-variant/30 cursor-not-allowed"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant hover:border-primary/40 cursor-pointer"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          {!isLast ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant hover:border-primary/50 font-mono text-xs font-semibold transition-all"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allAnswered || isSubmitting}
              onClick={onSubmitQuiz}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                allAnswered && !isSubmitting
                  ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary-container shadow-[0_0_18px_rgba(56,189,248,0.4)] hover:shadow-[0_0_24px_rgba(76,215,246,0.6)] cursor-pointer"
                  : "bg-surface-container text-on-surface-variant/40 border border-outline-variant cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-on-primary-container" />
                  <span>Evaluating Rubrics...</span>
                </>
              ) : (
                <>
                  <span>Submit Interview</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Answer status guard caption */}
      <div className="mt-4 text-center">
        {allAnswered ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-tertiary">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All 3 questions answered. Ready for server-side evaluation.</span>
          </span>
        ) : (
          <span className="font-mono text-xs text-on-surface-variant">
            {answeredCount} of {totalQuestions} answered. You must answer all
            questions to submit.
          </span>
        )}
      </div>
    </div>
  );
}
