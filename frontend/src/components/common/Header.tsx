"use client";

import Link from "next/link";
import Image from "next/image";
import { Code, ArrowRight } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="relative w-8 h-8 shrink-0">
            <Image
              src="/logo.svg"
              alt="AI Technical Interview Coach Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-on-surface text-base sm:text-lg whitespace-nowrap group-hover:text-primary transition-colors">
              AI Technical Interview Coach
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant font-mono text-xs text-primary">
              v2.4
            </span>
          </div>
        </Link>

        {/* Status Pill & CTAs */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
            <span className="font-mono text-xs text-on-surface-variant whitespace-nowrap">
              Phase 1 Live • Untimed Assessment
            </span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="h-9 w-9 rounded-lg bg-surface-container-low hover:bg-surface-container hover:text-on-surface border border-outline-variant text-on-surface-variant flex items-center justify-center transition-all"
          >
            <Code className="w-4 h-4" />
          </a>

          <Link
            href="/interview"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-primary hover:bg-secondary text-on-primary font-medium text-sm transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)] hover:shadow-[0_0_18px_rgba(56,189,248,0.4)]"
          >
            <span>Launch Coach</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
