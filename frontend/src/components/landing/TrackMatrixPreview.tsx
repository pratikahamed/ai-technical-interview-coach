import Link from "next/link";
import {
  Code2,
  Network,
  Layers,
  Coffee,
  Leaf,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

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

export function TrackMatrixPreview() {
  return (
    <section id="tracks" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
          Curriculum Calibration
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
          Targeted Senior Engineering Tracks
        </h2>
        <p className="mt-3 max-w-xl text-sm sm:text-base text-on-surface-variant">
          Select any track to run a deterministic 3-question mock interview evaluated against production staff invariants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRACKS.map((track) => {
          const Icon = track.icon;
          return (
            <div
              key={track.id}
              className="group relative flex flex-col justify-between p-6 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary/50 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(56,189,248,0.1)] hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
                    {track.badge}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                  {track.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {track.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant border border-outline-variant/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="font-mono text-xs text-on-surface-variant">
                  3 Scenario Questions
                </span>
                <Link
                  href={`/interview?track=${track.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:text-secondary group-hover:translate-x-0.5 transition-all"
                >
                  <span>Launch Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
