import { Activity } from "lucide-react";

export function CodeInspectorPreview() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="w-full rounded-xl bg-surface-container-low border border-outline-variant shadow-2xl p-4 sm:p-6 text-left">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-tertiary/80" />
            <span className="ml-2 font-mono text-xs text-on-surface-variant hidden sm:inline">
              evaluator-daemon --strict-rubric --track=distributed-systems
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-primary">
            <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse" />
            <span>LATENCY: 18ms</span>
          </div>
        </div>

        {/* Split: Code & Live Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Code display */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-lg p-4 font-mono text-xs sm:text-sm text-on-surface overflow-x-auto border border-outline-variant/30 leading-relaxed">
            <p className="text-on-surface-variant">// Phase 1: Evaluating candidate fault-tolerance topology</p>
            <p>
              <span className="text-primary">public class</span>{" "}
              <span className="text-secondary">ConsistentHashRing</span>&lt;T&gt; &#123;
            </p>
            <p className="pl-4">
              <span className="text-primary">private final</span> HashFunction hashFunc;
            </p>
            <p className="pl-4">
              <span className="text-primary">private final</span> SortedMap&lt;Long, VirtualNode&lt;T&gt;&gt; ring =
            </p>
            <p className="pl-8">
              <span className="text-secondary">new</span> ConcurrentSkipListMap&lt;&gt;();
            </p>
            <p className="pl-4 text-on-surface-variant">
              // Monitored lock contention &amp; replication quorum invariants
            </p>
            <p className="pl-4">
              <span className="text-primary">public void</span>{" "}
              <span className="text-tertiary">assignPartitionKey</span>(String key) &#123;
            </p>
            <p className="pl-8 text-on-surface-variant">
              /* Verified O(log N) partition lookup across 256 vnodes */
            </p>
            <p className="pl-4">&#125;</p>
            <p>&#125;</p>
          </div>

          {/* Diagnostic Rubric Scores */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-surface-container rounded-lg p-4 sm:p-5 border border-outline-variant/30 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                  Evaluator Rubric Telemetry
                </span>
              </div>

              <div className="space-y-4">
                {/* Metric 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface">Time Complexity</span>
                    <span className="text-tertiary font-semibold">O(log N) • Optimal</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full w-[94%]" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface">Concurrency Safety</span>
                    <span className="text-primary font-semibold">Lock-Free SkipList</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[88%]" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface">Architectural Soundness</span>
                    <span className="text-secondary font-semibold">9.8 / 10</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full w-[98%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
              <span>Ground Truth Drift</span>
              <span className="text-tertiary font-semibold">0.00% Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
