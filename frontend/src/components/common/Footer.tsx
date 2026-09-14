import Link from "next/link";
import { Terminal, ShieldCheck, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Deterministic Assessment Engine • 0.00% Grading Drift</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-on-surface-variant font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
            <span>Staff L6+ Calibration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-secondary" />
            <span>Sub-50ms Evaluation</span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant/80 font-mono">
          &copy; {new Date().getFullYear()} AI Technical Interview Coach. Production Standard.
        </p>
      </div>
    </footer>
  );
}
