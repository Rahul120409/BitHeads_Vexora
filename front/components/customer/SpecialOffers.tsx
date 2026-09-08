'use client';

import Link from 'next/link';

export default function SpecialOffers() {
  return (
    <div className="bg-gradient-to-br from-amber-500/15 via-[#121826] to-[#121826] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center justify-between pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
          Exclusive Offer
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
          20% OFF
        </span>
      </div>

      <h3 className="text-base font-bold text-white mt-1">
        Hair Spa + Haircut Combo
      </h3>

      <p className="text-xs text-slate-400 mt-1">
        Enjoy deep restorative scalp therapy paired with our signature precision cut.
      </p>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Valid until <strong className="text-slate-200">Sunday</strong>
        </div>

        <Link
          href="/customer/book?offer=combo20"
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          Claim Offer
        </Link>
      </div>
    </div>
  );
}

