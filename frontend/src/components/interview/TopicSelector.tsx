"use client";

import {
  Code2,
  Network,
  Layers,
  Coffee,
  Leaf,
  Check,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  LucideIcon,
} from "lucide-react";
import { Topic } from "@/types/quiz";
import { TopicCardSkeleton } from "@/components/common/Skeleton";

interface TopicSelectorProps {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  selectedTopicId: string | null;
  onSelectTopic: (id: string) => void;
  onBegin: () => void;
  onRetry: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  dsa: Code2,
  "system-design": Network,
  lld: Layers,
  java: Coffee,
  spring: Leaf,
};

export function TopicSelector({
  topics,
  loading,
  error,
  selectedTopicId,
  onSelectTopic,
  onBegin,
  onRetry,
}: TopicSelectorProps) {
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
          Interview Configuration
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-on-surface tracking-tight">
          Select Your Assessment Track
        </h1>
        <p className="mt-2 text-sm sm:text-base text-on-surface-variant max-w-lg mx-auto">
          Choose a core software engineering domain. Each simulation contains 3
          scenario questions evaluated with zero-drift rubrics.
        </p>
      </div>

      {/* Cold Start / Error Alert */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-error/10 border border-error/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-error text-sm">
                Engine Connection Notice
              </h4>
              <p className="text-xs text-on-surface-variant mt-1">
                {error} Backend on free-tier Render instances may take ~30 seconds to spin up on cold start.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-mono text-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Grid of Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <TopicCardSkeleton key={i} />)
        ) : (
          topics.map((topic) => {
            const isSelected = topic.id === selectedTopicId;
            const Icon = ICON_MAP[topic.id] || Code2;

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onSelectTopic(topic.id)}
                className={`text-left p-6 rounded-xl border flex flex-col justify-between transition-all duration-200 relative group min-h-[220px] ${
                  isSelected
                    ? "bg-surface-container-low border-primary shadow-[0_0_24px_rgba(56,189,248,0.25)] ring-1 ring-primary"
                    : "bg-surface-container-low/70 hover:bg-surface-container-low border-outline-variant hover:border-primary/40 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-primary group-hover:scale-105"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 font-mono text-xs text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30">
                        <Check className="w-3 h-3" />
                        <span>Selected</span>
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-on-surface-variant px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
                        Track // {topic.id.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono text-on-surface-variant">
                  <span>3 Scenarios</span>
                  <span className="text-tertiary">Deterministic Scoring</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Action Drawer */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/40 py-4 px-4 sm:px-6 lg:px-8 shadow-[0_-8px_32px_rgba(0,0,0,0.7)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="font-mono text-xs text-on-surface-variant hidden sm:inline">
              Selected Track:
            </span>
            {selectedTopic ? (
              <span className="font-semibold text-primary text-sm flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                {selectedTopic.name}
              </span>
            ) : (
              <span className="text-xs text-on-surface-variant font-mono">
                Please select a track above to proceed
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedTopicId}
            onClick={onBegin}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
              selectedTopicId
                ? "bg-gradient-to-r from-primary-container to-secondary text-on-primary-container shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_28px_rgba(76,215,246,0.55)] cursor-pointer hover:scale-[1.01]"
                : "bg-surface-container text-on-surface-variant/40 border border-outline-variant cursor-not-allowed"
            }`}
          >
            <span>Begin Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
