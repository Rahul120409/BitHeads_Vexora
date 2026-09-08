'use client';

import React, { useEffect, useRef } from "react";

export default function SplashScreen() {
  const progressRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    function update() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const secondsLeft = (remaining / 1000).toFixed(1);

      if (countdownRef.current) {
        countdownRef.current.innerText = `${secondsLeft}s`;
        if (remaining === 0) {
          countdownRef.current.className =
            "font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md";
        }
      }

      if (remaining > 0) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative select-none"
      style={{ backgroundColor: "#060911", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] animate-pulse-glow"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, rgba(234,88,12,0.08) 60%, transparent 100%)" }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: "rgba(37,99,235,0.08)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: "rgba(245,158,11,0.08)" }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Top bar */}
      <header className="absolute top-6 left-0 right-0 px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-medium text-slate-400 backdrop-blur-md"
          style={{ background: "rgba(15,23,42,0.8)", borderColor: "rgba(51,65,85,1)" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Java API Engine <strong className="text-slate-200">v2.4 Connected</strong></span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg mx-auto">
        {/* Brand icon with spinning halo */}
        <div className="relative mb-8">
          <div className="absolute -inset-2.5 rounded-3xl opacity-75 blur-md animate-spin-slow"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24, #ea580c)" }} />
          <div className="relative w-28 h-28 rounded-2xl flex items-center justify-center animate-float"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 0 50px rgba(245,158,11,0.45)" }}>
            <div className="w-full h-full rounded-[14px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b, #f97316)" }}>
              <svg className="w-14 h-14 drop-shadow-md" style={{ color: "#020617" }} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-2 right-0 translate-x-1/4 border border-amber-500/50 text-[10px] uppercase font-bold text-amber-400 px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1.5"
            style={{ background: "#0f172a" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            2.0s SYNC
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Salon<span className="text-amber-500">Pulse</span>
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-amber-400/90">
            Live Salon Operations OS
          </p>
          <p className="text-xs text-slate-400 font-medium pt-2">
            Zero-wait seating &amp; real-time queue orchestration
          </p>
        </div>

        {/* Progress bar card */}
        <div className="w-full max-w-sm rounded-2xl p-5 shadow-2xl border"
          style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-center text-xs mb-2.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Booting Live Operations...
            </span>
            <span ref={countdownRef} className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
              2.0s
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(30,41,59,0.9)" }}>
            <div className="h-full rounded-full animate-progress-bar"
              style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f97316)", boxShadow: "0 0 12px rgba(245,158,11,0.6)" }} />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Chairs &amp; Stylists Synced
            </span>
            <span className="font-mono text-slate-400">1.4s latency</span>
          </div>
        </div>

        {/* Quick nav pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/login" className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-2 shadow-sm"
            style={{ background: "rgba(15,23,42,0.6)" }}>
            <span>Enter Customer Portal</span>
            <span className="text-amber-400 text-sm leading-none">→</span>
          </a>
          <a href="/admin" className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-2 shadow-sm"
            style={{ background: "rgba(15,23,42,0.6)" }}>
            <span>Admin Dashboard</span>
            <span className="text-amber-400 text-sm leading-none">→</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 px-8 flex items-center justify-between text-xs text-slate-500 z-20">
        <div className="flex items-center gap-4">
          <span>SalonPulse OS © 2025</span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:inline">14 Luxury Ateliers Live</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">All Systems Nominal</span>
        </div>
      </footer>
    </div>
  );
}
