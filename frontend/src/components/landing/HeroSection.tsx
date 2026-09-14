import Link from "next/link";
import { ArrowRight, Ruler, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 flex flex-col items-center text-center">
      {/* Top Monospace Tag */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant shadow-sm hover:bg-surface-container transition-all cursor-default">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-primary font-medium">
          ⚡ Deterministic Assessment Engine • Zero Latency
        </span>
        <span className="h-3 w-px bg-surface-variant"></span>
        <span className="font-mono text-xs text-on-surface-variant">v2.4-prod</span>
      </div>

      {/* Hero Headline */}
      <div className="mt-8 max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-on-surface leading-[1.15]">
          Master Technical Interviews with{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
            Precision Architecture
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-on-surface-variant leading-relaxed">
          Calibrated evaluations for DSA, System Design, LLD, Core Java, and Spring
          Framework. Immediate server-side rubric scoring with zero fluff and zero grading drift.
        </p>
      </div>

      {/* Call to Actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/interview"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary text-on-primary-container font-semibold text-base shadow-[0_0_24px_rgba(56,189,248,0.35)] hover:shadow-[0_0_32px_rgba(76,215,246,0.55)] hover:scale-[1.01] transition-all"
        >
          <span>Start Mock Interview</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
        <a
          href="#tracks"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-base border border-outline-variant transition-all"
        >
          <Ruler className="w-5 h-5 text-primary" />
          <span>Explore Question Rubric</span>
        </a>
      </div>

      {/* Live Metric Ticker */}
      <div className="mt-8 flex items-center gap-2 text-on-surface-variant font-mono text-xs">
        <CheckCircle className="w-4 h-4 text-tertiary" />
        <span className="font-medium text-on-surface">5 Tracks</span>
        <span>•</span>
        <span>Deterministic Rule Engine Active</span>
        <span>•</span>
        <span className="text-primary">Phase 1 Untimed</span>
      </div>
    </section>
  );
}
