import { QuestionPublic } from "@/types";
import { Badge } from "@/components/ui/badge";

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
    <div className="w-full rounded-2xl bg-surface-container-low border border-outline specular-rim p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl text-left">
      {/* Question Spec Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-outline">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Badge variant="primary">
            SCENARIO 0{questionIndex + 1} {"//"} {question.id.toUpperCase()}
          </Badge>
          <span className="text-slate-400">
            Track: <span className="text-slate-200 font-medium">{question.topic_id.toUpperCase()}</span>
          </span>
        </div>
        <span className="font-mono text-xs text-tertiary flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
          <span>Calibrated Senior Rubric</span>
        </span>
      </div>

      {/* Question Prompt */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed tracking-tight">
          {question.text}
        </h2>
      </div>

      {/* 4 Single-Select Radio Options */}
      <div
        role="radiogroup"
        aria-label={`Options for scenario ${question.id}`}
        className="space-y-2.5 pt-1"
      >
        {question.options.map((optionText, idx) => {
          const isSelected = selectedIndex === idx;
          const letter = OPTION_LETTERS[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isSelected
                  ? "bg-primary/10 border-primary text-sky-100 specular-rim-strong shadow-[0_0_16px_rgba(56,189,248,0.2)] ring-1 ring-primary"
                  : "bg-surface-container/50 hover:bg-surface-container text-slate-200 border-outline hover:border-slate-500 specular-rim active:scale-[0.99]"
              }`}
            >
              {/* Option Letter Key Badge */}
              <span
                className={`shrink-0 w-6 h-6 rounded font-mono text-xs font-semibold flex items-center justify-center transition-all duration-150 ${
                  isSelected
                    ? "bg-primary text-slate-950 font-bold shadow-[0_0_8px_#38BDF8]"
                    : "bg-[#090A0F] text-slate-400 border border-outline"
                }`}
              >
                {letter}
              </span>

              {/* Option Technical Statement */}
              <span
                className={`text-xs sm:text-sm leading-relaxed pt-0.5 ${
                  isSelected ? "text-primary font-medium" : "text-slate-300"
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
