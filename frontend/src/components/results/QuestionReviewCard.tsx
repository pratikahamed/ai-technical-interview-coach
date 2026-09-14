import { Check, X, Lightbulb } from "lucide-react";
import { QuestionReview } from "@/types/quiz";

interface QuestionReviewCardProps {
  review: QuestionReview;
  index: number;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function QuestionReviewCard({ review, index }: QuestionReviewCardProps) {
  const selectedLetter = OPTION_LETTERS[review.selected_option] || `#${review.selected_option + 1}`;
  const correctLetter = OPTION_LETTERS[review.correct_option] || `#${review.correct_option + 1}`;

  return (
    <div className="w-full rounded-xl bg-surface-container-low border border-outline-variant p-6 sm:p-7 space-y-5 text-left shadow-lg">
      {/* Review Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-surface-container text-primary font-semibold border border-outline-variant">
            SCENARIO 0{index + 1} // {review.question_id.toUpperCase()}
          </span>
          <span className="text-on-surface-variant">
            Status:{" "}
            {review.is_correct ? (
              <span className="text-tertiary font-semibold">SOLVED</span>
            ) : (
              <span className="text-error font-semibold">MISSED</span>
            )}
          </span>
        </div>

        {/* Score Delta Badge */}
        <span
          className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            review.is_correct
              ? "bg-tertiary/10 text-tertiary border-tertiary/30"
              : "bg-surface-container text-on-surface-variant border-outline-variant"
          }`}
        >
          {review.is_correct ? "+33.3% Calibration" : "0.0% Calibration"}
        </span>
      </div>

      {/* Scenario Text */}
      <h3 className="text-base sm:text-lg font-medium text-on-surface leading-relaxed">
        {review.text}
      </h3>

      {/* Answer Comparison */}
      <div className="space-y-3 pt-1">
        {/* Candidate's Answer */}
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 ${
            review.is_correct
              ? "bg-tertiary/10 border-tertiary/30 text-tertiary"
              : "bg-error/10 border-error/30 text-error"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                review.is_correct
                  ? "bg-tertiary text-on-tertiary"
                  : "bg-error text-on-error"
              }`}
            >
              {selectedLetter}
            </span>
            <span className="text-xs sm:text-sm font-medium">
              Candidate Selection: Option [{selectedLetter}]
            </span>
          </div>

          <span className="flex items-center gap-1 font-mono text-xs shrink-0">
            {review.is_correct ? (
              <>
                <Check className="w-4 h-4" />
                <span>Correct</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                <span>Incorrect</span>
              </>
            )}
          </span>
        </div>

        {/* Deterministic Key if candidate was wrong */}
        {!review.is_correct && (
          <div className="p-3.5 rounded-lg bg-tertiary/5 border border-tertiary/20 text-tertiary flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-md bg-tertiary text-on-tertiary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {correctLetter}
              </span>
              <span className="text-xs sm:text-sm font-medium">
                Deterministic Key: Option [{correctLetter}]
              </span>
            </div>
            <span className="font-mono text-xs text-tertiary">Verified Solution</span>
          </div>
        )}
      </div>

      {/* Technical Invariant Rationale Box */}
      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/40 p-4 space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold">
          <Lightbulb className="w-4 h-4" />
          <span>Rationale &amp; Invariant Proof</span>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {review.explanation}
        </p>
      </div>
    </div>
  );
}
