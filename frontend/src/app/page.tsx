"use client";

import { useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { CodeInspectorPreview } from "@/components/landing/CodeInspectorPreview";
import { TrackMatrixPreview } from "@/components/landing/TrackMatrixPreview";
import { pingHealth } from "@/lib/api";

export default function LandingPage() {
  // Silent non-blocking health probe on landing to pre-warm Render container
  useEffect(() => {
    pingHealth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-on-surface relative selection:bg-primary selection:text-on-primary">
      {/* Background ambient lighting and grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-40" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[130px] rounded-full z-0" />

      <Header />

      <main className="relative z-10 w-full pt-20 flex-1">
        <HeroSection />
        <CodeInspectorPreview />
        <TrackMatrixPreview />
      </main>

      <Footer />
    </div>
  );
}
