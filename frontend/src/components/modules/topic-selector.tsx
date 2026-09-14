"use client";

import React from "react";
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
  Sparkles,
  Gauge,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Topic, Seniority, Difficulty } from "@/types";

interface TopicSelectorProps {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  selectedTopicId: string | null;
  selectedSeniority: Seniority | null;
  selectedDifficulty: Difficulty | null;
  onSelectTopic: (id: string) => void;
  onSelectSeniority: (seniority: Seniority) => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onBegin: () => void;
  onRetry: () => void;
  isInitializing?: boolean;
  validationError?: string | null;
}

const ICON_MAP: Record<string, LucideIcon> = {
  dsa: Code2,
  "system-design": Network,
  lld: Layers,
  java: Coffee,
  spring: Leaf,
};

const SENIORITY_LEVELS: { id: Seniority; label: string; exp: string; desc: string }[] = [
  {
    id: "junior",
    label: "Junior",
    exp: "0-2 Yrs",
    desc: "Syntax fundamentals, standard library primitives, core DSA logic",
  },
  {
    id: "mid",
    label: "Mid-Level",
    exp: "3-5 Yrs",
    desc: "Component trade-offs, concurrency basics, error resilience",
  },
  {
    id: "senior",
    label: "Senior / Staff",
    exp: "5+ Yrs",
    desc: "Distributed invariants, low-level cache topologies, failure modes",
  },
];

const DIFFICULTY_LEVELS: { id: Difficulty; label: string; desc: string }[] = [
  {
    id: "easy",
    label: "Easy",
    desc: "Clear, direct conceptual scenarios",
  },
  {
    id: "medium",
    label: "Medium",
    desc: "Practical engineering scenarios with production trade-offs",
  },
  {
    id: "hard",
    label: "Hard",
    desc: "Complex edge cases, concurrency hazards & deep optimizations",
  },
];

function TopicCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-surface-container-low border border-outline flex flex-col justify-between h-[200px] animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-surface-container" />
          <div className="w-16 h-5 rounded-full bg-surface-container" />
        </div>
        <div className="w-3/4 h-6 rounded bg-surface-container" />
        <div className="w-full h-10 rounded bg-surface-container/50" />
      </div>
      <div className="w-24 h-4 rounded bg-surface-container" />
    </div>
  );
}

export function TopicSelector({
  topics,
  loading,
  error,
  selectedTopicId,
  selectedSeniority,
  selectedDifficulty,
  onSelectTopic,
  onSelectSeniority,
  onSelectDifficulty,
  onBegin,
  onRetry,
  isInitializing = false,
  validationError = null,
}: TopicSelectorProps) {
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);
  const isReadyToBegin = Boolean(selectedTopicId && selectedSeniority && selectedDifficulty);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-36">
      {/* Header */}
      <div className="text-center mb-8 space-y-2.5">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary font-semibold px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 specular-rim">
          TRACK CATALOG // DUAL-LEVEL CALIBRATION
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
          Targeted Technical Engineering Tracks
        </h1>
        <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto">
          Choose a core software engineering domain, then calibrate your simulation by Seniority Tier and Topic Difficulty level.
        </p>
      </div>

      {/* Cold Start / Error Alert */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 specular-rim">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-rose-300 text-sm">
                Engine Connection Notice
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {error} Backend on free-tier Render instances may take ~30 seconds to spin up on cold start.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline text-slate-200 font-mono text-xs transition-all shrink-0 specular-rim active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Step 1: Seniority Experience Tier */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-surface-container-low/90 border border-outline specular-rim">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30 font-semibold">
              STEP 1
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Seniority Experience Tier</span>
            </div>
          </div>
          {selectedSeniority && (
            <span className="font-mono text-xs text-primary uppercase font-semibold">
              Selected: {selectedSeniority}
            </span>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label="Seniority Experience Tier"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {SENIORITY_LEVELS.map((lvl) => {
            const isSelected = selectedSeniority === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectSeniority(lvl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-surface-container border-primary shadow-[0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-primary"
                    : "bg-surface-container-lowest/60 hover:bg-surface-container border-outline hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    {lvl.label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 px-1.5 py-0.5 rounded bg-surface-container-lowest border border-outline">
                    {lvl.exp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lvl.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: 5 Technical Domain Tracks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30 font-semibold">
              STEP 2
            </span>
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              5 Technical Domain Tracks
            </h2>
          </div>
          {selectedTopic && (
            <span className="font-mono text-xs text-primary uppercase font-semibold">
              Selected: {selectedTopic.name}
            </span>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label="Technical Domain Tracks"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
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
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectTopic(topic.id)}
                  className={`text-left p-6 rounded-xl border flex flex-col justify-between transition-all duration-200 relative group min-h-[200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer ${
                    isSelected
                      ? "bg-surface-container-low border-primary specular-rim-strong shadow-[0_0_24px_rgba(56,189,248,0.2)] ring-1 ring-primary"
                      : "bg-surface-container-low/70 hover:bg-surface-container-low border-outline hover:border-slate-600 specular-rim hover:-translate-y-0.5 active:scale-[0.99]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 specular-rim ${
                          isSelected
                            ? "bg-primary text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                            : "bg-surface-container text-primary border border-outline group-hover:scale-105"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 font-mono text-xs text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 specular-rim font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-400 px-2.5 py-0.5 rounded bg-surface-container border border-outline">
                          Track // {topic.id.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-100 tracking-tight group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>3 Scenario Questions</span>
                    <span className="text-tertiary flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-tertiary" />
                      <span>Calibrated MCQs</span>
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Step 3: Question Difficulty Level */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-surface-container-low/90 border border-outline specular-rim">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30 font-semibold">
              STEP 3
            </span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
              <Gauge className="w-4 h-4 text-tertiary" />
              <span>Question Difficulty Level</span>
            </div>
          </div>
          {selectedDifficulty && (
            <span className="font-mono text-xs text-tertiary uppercase font-semibold">
              Selected: {selectedDifficulty}
            </span>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label="Question Difficulty Level"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {DIFFICULTY_LEVELS.map((lvl) => {
            const isSelected = selectedDifficulty === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectDifficulty(lvl.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-surface-container border-tertiary shadow-[0_0_16px_rgba(16,185,129,0.25)] ring-1 ring-tertiary"
                    : "bg-surface-container-lowest/60 hover:bg-surface-container border-outline hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100">
                    {lvl.label}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-tertiary" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {lvl.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Banner if user attempts to begin without selections */}
      {validationError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-center gap-2 font-mono text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Sticky Bottom Action Drawer */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#090A0F]/90 backdrop-blur-xl border-t border-outline py-3 sm:py-3.5 pb-11 sm:pb-3.5 px-4 sm:px-6 lg:px-8 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] specular-rim">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pr-0 sm:pr-48">
          <div className="flex flex-wrap items-center gap-2 text-center sm:text-left">
            <span className="font-mono text-xs text-slate-400 hidden sm:inline">
              Configuration:
            </span>
            {selectedSeniority ? (
              <span className="font-mono text-xs text-slate-200 uppercase px-2 py-0.5 rounded bg-surface-container border border-outline">
                1. {selectedSeniority}
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-mono">
                1. Select Seniority
              </span>
            )}

            <span className="text-slate-600">•</span>

            {selectedTopic ? (
              <span className="font-semibold text-primary text-sm flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                2. {selectedTopic.name}
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                2. Select Track
              </span>
            )}

            <span className="text-slate-600">•</span>

            {selectedDifficulty ? (
              <span className="font-mono text-xs text-tertiary uppercase px-2 py-0.5 rounded bg-surface-container border border-outline">
                3. {selectedDifficulty}
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-mono">
                3. Select Difficulty
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!isReadyToBegin || isInitializing}
            onClick={onBegin}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isReadyToBegin && !isInitializing
                ? "bg-white hover:bg-slate-100 text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)] specular-rim hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                : "bg-surface-container text-slate-500 border border-outline cursor-not-allowed"
            }`}
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Starting Interview...</span>
              </>
            ) : (
              <>
                <span>Begin Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
