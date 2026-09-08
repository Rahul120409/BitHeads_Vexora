'use client';

import Link from 'next/link';
import { Scissors, CalendarCheck, Clock, Heart } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { label: 'Book Service', icon: Scissors, href: '/customer/book', primary: true },
    { label: 'My Appointments', icon: CalendarCheck, href: '/customer/appointments' },
    { label: 'Live Queue', icon: Clock, href: '/customer/queue' },
    { label: 'Favorite Stylists', icon: Heart, href: '#stylists' },
  ];

  return (
    <div className="bg-[#121826] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
        Quick Actions
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((act) => {
          const IconComp = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all text-center group ${
                act.primary
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 hover:scale-[1.02]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                act.primary ? 'bg-amber-500/20 text-amber-400 group-hover:text-slate-950' : 'bg-slate-800/80 text-slate-300'
              }`}>
                <IconComp className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span>{act.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

