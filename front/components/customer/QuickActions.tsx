'use client';

import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    { label: 'Book Service', icon: '✂️', href: '/customer/book', primary: true },
    { label: 'My Appointments', icon: '📅', href: '/customer/appointments' },
    { label: 'Live Queue', icon: '🎫', href: '/customer/queue' },
    { label: 'Favorite Stylists', icon: '❤️', href: '#stylists' },
  ];

  return (
    <div className="bg-[#121826] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
        Quick Actions
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
              act.primary
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 hover:scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <span className="text-base">{act.icon}</span>
            <span>{act.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

