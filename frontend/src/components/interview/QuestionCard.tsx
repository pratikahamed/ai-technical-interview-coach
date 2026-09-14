import { QuestionPublic } from "@/types/quiz";

interface QuestionCardProps {
  question: QuestionPublic;
  questionIndex: number;
  selectedIndex?: number;
  onSelectOption: (optionIndex: number) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function QuestionCard({
  question,
  questionIndex,
  selectedIndex,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <div className="w-full rounded-xl bg-surface-container-low border border-outline-variant p-6 sm:p-8 space-y-6 shadow-xl text-left">
      {/* Question Header & Spec UID */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-primary font-semibold border border-outline-variant">
            SCENARIO // {question.id.toUpperCase()}
          </span>
          <span className="font-mono text-xs text-on-surface-variant">
            Track: {question.topic_id.toUpperCase()}
          </span>
        </div>
        <span className="font-mono text-xs text-tertiary">
          Calibrated Senior Rubric
        </span>
      </div>

      {/* Scenario Statement */}
      <div className="space-y-2">
        <h2 className="text-lg sm:text-xl font-medium text-on-surface leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* 4 Single-Select Options [A]-[D] */}
      <div className="space-y-3 pt-2">
        {question.options.map((optionText, idx) => {
          const isSelected = selectedIndex === idx;
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-150 flex items-start gap-4 ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-[0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-primary"
                  : "bg-surface-container hover:bg-surface-container-high border-outline-variant text-on-surface hover:border-primary/40"
              }`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-md font-mono text-xs font-semibold flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant"
                }`}
              >
                {letter}
              </span>
              <span
                className={`text-sm sm:text-base leading-relaxed pt-0.5 ${
                  isSelected ? "text-primary font-medium" : "text-on-surface"
                }`}
              >
                {optionText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
