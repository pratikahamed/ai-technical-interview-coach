"use client";

import Link from "next/link";
import { ArrowRight, Terminal, ShieldCheck, Cpu, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  const handleScrollToTracks = () => {
    const el = document.getElementById("tracks");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden text-center">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-25" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 blur-[150px] rounded-full z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline text-xs font-mono specular-rim">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-slate-300">Deterministic Assessment Engine</span>
          <span className="text-slate-500">•</span>
          <span className="text-tertiary">0.00% Grading Drift</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1]">
          Master Technical Interviews with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
            Senior Engineering Rigor
          </span>
        </h1>

        {/* Value Proposition */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Calibrated evaluations for DSA, System Design, LLD, Core Java, and Spring Framework. Immediate server-side rubric scoring with zero fluff and zero grading drift.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/interview" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <span>Start Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleScrollToTracks}
            className="w-full sm:w-auto gap-2"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>Explore 5 Engineering Tracks</span>
          </Button>
        </div>

        {/* Technical Guarantee Badges */}
        <div className="pt-8 border-t border-outline flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span>Sub-50ms Evaluation</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-tertiary" />
            <span>Staff L6+ Calibration</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-secondary" />
            <span>Dual Mock & Groq LLM Engine</span>
          </div>
        </div>
      </div>
    </section>
  );
}
