'use client';

import Link from 'next/link';

interface LiveQueueCardProps {
  tokenNumber?: number;
  status?: string;
  estimatedWaitMinutes?: number;
  peopleAhead?: number;
  chair?: string;
  onSimulateTurn?: () => void;
}

export default function LiveQueueCard({
  tokenNumber = 3,
  status = 'WAITING',
  estimatedWaitMinutes = 30,
  peopleAhead = 2,
  chair = 'Chair 2',
  onSimulateTurn
}: LiveQueueCardProps) {
  const isServing = status === 'SERVING' || tokenNumber === 1;

  return (
    <div className="bg-[#121826] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
            LIVE QUEUE
          </span>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
          isServing
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        }`}>
          {isServing ? 'NOW SERVING' : status}
        </span>
      </div>

      {/* Main Token Display Box */}
      <div className="my-5 py-5 px-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Your Token
        </div>
        <div className="text-5xl font-black text-amber-400 tracking-tight mt-1">
          #{tokenNumber}
        </div>
        <div className="text-xs text-slate-300 mt-2">
          Estimated Wait: <strong className="text-emerald-400">~{isServing ? 0 : estimatedWaitMinutes} mins</strong>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs mb-5">
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-semibold text-slate-400">People Ahead</div>
          <div className="text-lg font-extrabold text-white mt-0.5">{Math.max(0, peopleAhead)}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Your Chair</div>
          <div className="text-lg font-extrabold text-amber-400 mt-0.5">{chair}</div>
        </div>
      </div>

      {/* Visual Queue Progress (The exact 4 steps required) */}
      <div className="space-y-2.5 py-3 border-t border-slate-800/80 text-xs">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
          Queue Progress
        </div>

        <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold">✓</span>
          <span>Appointment Confirmed</span>
        </div>

        <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold">✓</span>
          <span>Checked In</span>
        </div>

        <div className={`flex items-center gap-2.5 font-bold ${
          !isServing ? 'text-amber-300 animate-pulse' : 'text-emerald-400'
        }`}>
          <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px]">●</span>
          <span>Waiting in Queue</span>
        </div>

        <div className={`flex items-center gap-2.5 ${
          isServing ? 'text-blue-300 font-bold animate-pulse' : 'text-slate-500'
        }`}>
          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">○</span>
          <span>Service Starts</span>
        </div>
      </div>

      {/* Bottom Link & Demo Button */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link
          href="/customer/queue"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
        >
          <span>View Live Queue</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        {onSimulateTurn && (
          <button
            onClick={onSimulateTurn}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-purple-300 border border-slate-700 text-[10px] font-bold transition-colors"
            title="Simulate prior customer completion"
          >
            ⚡ Advance
          </button>
        )}
      </div>
    </div>
  );
}

