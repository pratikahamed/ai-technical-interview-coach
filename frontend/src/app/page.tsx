"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Network,
  Layers,
  Coffee,
  Leaf,
  ArrowRight,
  LucideIcon,
  Terminal,
} from "lucide-react";
import { HeroBanner } from "@/components/modules/hero-banner";
import { pingHealth } from "@/lib/api-client";

interface TrackItem {
  id: string;
  name: string;
  badge: string;
  icon: LucideIcon;
  description: string;
  tags: string[];
}

const TRACKS: TrackItem[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    badge: "Track 01",
    icon: Code2,
    description:
      "Asymptotic complexity, balanced trees, graph traversal, and dynamic programming invariants.",
    tags: ["AVL & Red-Black", "Dijkstra O(E+VlogV)", "DSU α(N)"],
  },
  {
    id: "system-design",
    name: "System Design",
    badge: "Track 02",
    icon: Network,
    description:
      "Distributed consensus, partition tolerance, caching topologies, and event-driven architectures.",
    tags: ["Consistent Hashing", "CAP Theorem", "Cache Stampede"],
  },
  {
    id: "lld",
    name: "Low Level Design",
    badge: "Track 03",
    icon: Layers,
    description:
      "SOLID principles, concurrency patterns, creational/behavioral patterns, and domain modeling.",
    tags: ["Observer Pattern", "Liskov Substitution", "Double-Checked Locking"],
  },
  {
    id: "java",
    name: "Core Java",
    badge: "Track 04",
    icon: Coffee,
    description:
      "JVM memory models, garbage collection tuning, concurrent primitives, and classloader semantics.",
    tags: ["ConcurrentHashMap", "G1 GC Internals", "Monitor Ownership"],
  },
  {
    id: "spring",
    name: "Spring Framework",
    badge: "Track 05",
    icon: Leaf,
    description:
      "Spring Boot internals, IoC lifecycle, transaction propagation, and reactive pipelines.",
    tags: ["AOP Self-Invocation", "Bean Scopes", "REQUIRES_NEW"],
  },
];

export default function LandingPage() {
  // Silent non-blocking health probe on landing to pre-warm backend container
  useEffect(() => {
    pingHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060709] text-slate-100 relative selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Background ambient lighting and grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-25" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/10 blur-[140px] rounded-full z-0" />

      <main className="relative z-10 w-full flex-1">
        <HeroBanner />

        {/* 5 Technical Engineering Tracks Matrix */}
        <section id="tracks" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center text-center mb-12 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold px-2.5 py-1 rounded bg-primary/10 border border-primary/30 specular-rim">
              CURRICULUM CALIBRATION // 5 CORE DOMAINS
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
              Targeted Technical Engineering Tracks
            </h2>
            <p className="max-w-xl text-sm sm:text-base text-slate-400">
              Select any track to run a 3-question simulation calibrated across Seniority Tiers and Topic Difficulty levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRACKS.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-surface-container-low border border-outline specular-rim hover:border-slate-600 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(56,189,248,0.1)] hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline specular-rim flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs text-slate-400 px-2.5 py-0.5 rounded bg-surface-container border border-outline">
                        {track.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-primary transition-colors tracking-tight">
                      {track.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {track.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {track.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#090A0F] border border-outline"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-outline flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500">
                      3 Calibrated MCQs
                    </span>
                    <Link
                      href={`/interview?track=${track.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:text-sky-300 font-mono transition-colors"
                    >
                      <span>Launch Track</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Production Footer */}
      <footer className="relative z-10 w-full border-t border-outline bg-[#090A0F]/80 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>AI Technical Interview Coach v2.4</span>
            <span className="text-slate-600">•</span>
            <span>Deterministic Scoring Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>FastAPI Backend</span>
            <span>Next.js 16 App Router</span>
            <span>Groq LLM Acceleration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
