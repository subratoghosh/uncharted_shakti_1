'use client';

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Sparkles,
  GitCommit,
  Layers,
  FileCode2,
  Check,
  RotateCcw,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    active: false,
  });

  // Interactive toggle for the hero card: switch between BLOCKED and REMEDIATED
  const [isRemediated, setIsRemediated] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTilt({
      rotateX,
      rotateY,
      active: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      active: false,
    });
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] lg:min-h-screen flex flex-col justify-start lg:justify-center items-center pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-28 lg:pb-16 bg-green-hero text-butter-cream overflow-hidden rounded-b-[28px] sm:rounded-b-[36px] shadow-2xl px-4 sm:px-8"
    >
      {/* Background Organic Butter Blobs (SponFy signature aesthetic) */}
      <div className="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-butter-cream/10 blur-3xl pointer-events-none blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-green-light/20 blur-3xl pointer-events-none" />

      {/* Decorative Vector Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-10 w-96 h-96 border border-butter-cream rounded-full" />
        <div className="absolute bottom-10 right-20 w-80 h-80 border border-green-sage rounded-full" />
      </div>

      {/* Main Container: 2-column layout */}
      <div className="relative max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center z-10 lg:flex-1 lg:my-auto">
        {/* LEFT COLUMN: Editorial Typography + Value Proposition */}
        <div className="lg:col-span-7 flex flex-col items-start text-left pr-0 lg:pr-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-butter-cream/10 border border-butter-cream/25 text-butter-cream text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-green-accent animate-pulse" />
            <span>OpenAPI 3.0 & 3.1 Contract Intelligence</span>
          </div>

          {/* Headline in SponFy slab-serif style */}
          <h1 className="font-slab text-[2.75rem] sm:text-7xl lg:text-[84px] leading-[1.04] font-light text-butter-cream tracking-tight mb-6">
            <span>API releases</span>
            <br />
            <span className="relative inline-block text-butter-cream font-light">
              worth trusting
              {/* Paper Plane flight accent */}
              <span className="absolute -top-3 left-[210px] sm:left-[320px] pointer-events-none select-none animate-plane-hero-loop z-20 hidden sm:inline-block">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 68 68"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
                >
                  <path
                    d="M10 34L58 14L40 54L30 38L10 34Z"
                    fill="#FFF0B3"
                    stroke="#0C382E"
                    strokeWidth="2"
                  />
                  <path d="M58 14L30 38" stroke="#0C382E" strokeWidth="2" />
                </svg>
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-text-hero-sub text-base sm:text-lg max-w-xl leading-relaxed mb-8 font-normal">
            Deterministic OpenAPI breaking change detection, blast radius impact analysis, and
            autonomous Gemini AI remediation dossiers. Zero unverified contracts shipped to production.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
            <Link href="/dashboard" className="btn-butter">
              <Terminal className="w-4 h-4" />
              <span>Launch Live Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/workflow" className="btn-hero-ghost">
              <Layers className="w-4 h-4" />
              <span>Explore 5-Step Workflow</span>
            </Link>
          </div>

          {/* Social Proof / Capability Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-butter-cream/15 w-full text-xs text-text-hero-sub/90">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-accent" />
              <span>100% Deterministic AST Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-accent" />
              <span>Gemini 3.8 Flash Remediation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-accent" />
              <span>Automated GitHub PR Gates</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Interactive Tilt Preview Card */}
        <div className="lg:col-span-5 w-full">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: tilt.active
                ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
              transition: tilt.active ? 'none' : 'transform 0.4s ease-out',
            }}
            className="w-full bg-butter-panel text-green-dark rounded-3xl p-6 sm:p-7 border border-butter-cream/40 shadow-hero-card backdrop-blur-sm relative overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-green-dark/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-dark text-butter-cream flex items-center justify-center font-mono text-xs font-bold">
                  IQ
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-green-dark">
                    Release Verdict Engine
                  </h3>
                  <p className="text-[11px] text-text-dim font-mono">
                    commit: c4f810a • branch: main
                  </p>
                </div>
              </div>

              {/* Interactive Sandbox Toggle */}
              <button
                onClick={() => setIsRemediated(!isRemediated)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-dark/10 text-green-dark hover:bg-green-dark hover:text-butter-cream text-xs font-semibold transition-all"
                title="Click to toggle simulated Gemini AI Remediation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isRemediated ? 'Show Breaking' : 'Apply AI Fix'}</span>
              </button>
            </div>

            {/* Verdict Status Banner */}
            <div
              className={`p-3.5 rounded-2xl border transition-all duration-300 mb-4 ${
                isRemediated
                  ? 'bg-green-50 border-green-300 text-green-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  {isRemediated ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>VERDICT: SAFE (RELEASE APPROVED)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span>VERDICT: BLOCKED (4 BREAKING CHANGES)</span>
                    </>
                  )}
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80">
                  {isRemediated ? 'Score: 98/100' : 'Score: 28/100'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {isRemediated
                  ? 'All consumer contracts preserved with backward-compatible deprecation strategy.'
                  : 'Critical breaking changes detected in Orders & Payments paths. 2 downstream services impacted.'}
              </p>
            </div>

            {/* Diff & AST Inspection View */}
            <div className="space-y-2.5 mb-4 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-butter-bg border border-green-dark/8">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRemediated ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-[11px] font-bold">DELETE /orders/&#123;id&#125;</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isRemediated
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isRemediated ? 'DEPRECATED (NON-BREAKING)' : 'REMOVED (BREAKING)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-butter-bg border border-green-dark/8">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRemediated ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-[11px] font-bold">POST /orders schema</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isRemediated
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isRemediated ? 'OPTIONAL FIELD ADDED' : 'REQUIRED FIELD ADDED'}
                </span>
              </div>
            </div>

            {/* Gemini AI Remediation Snippet */}
            <div className="p-3.5 bg-green-dark text-butter-cream rounded-2xl border border-butter-cream/20 font-mono text-[11px]">
              <div className="flex items-center justify-between text-butter-cream/80 text-[10px] pb-2 border-b border-butter-cream/15 mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-butter-cream" />
                  Gemini 3.8 Flash Remediation
                </span>
                <span className="text-green-sage">Synthesized in 240ms</span>
              </div>
              <p className="text-text-hero-sub font-sans text-xs mb-2">
                {isRemediated
                  ? '✓ Auto-generated non-breaking shim deployed. Existing iOS and Web clients continue uninterrupted.'
                  : 'Suggested: Preserve endpoint with `deprecated: true` and introduce `/api/v2/orders`.'}
              </p>
              <div className="bg-black/30 p-2 rounded-lg text-[10px] text-green-sage overflow-x-auto">
                <code>
                  {isRemediated
                    ? '+  /orders/{id}: { get: ..., delete: { deprecated: true } }'
                    : '-  /orders/{id}: { delete: ... } // BREAKS 2 CONSUMERS'}
                </code>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-green-dark/10 flex items-center justify-between text-xs">
              <span className="text-text-dim text-[11px]">Blast Radius: Mobile App, Checkout API</span>
              <Link
                href="/dashboard"
                className="font-bold text-green-dark hover:text-green-mid inline-flex items-center gap-1 group"
              >
                <span>Inspect in Console</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
