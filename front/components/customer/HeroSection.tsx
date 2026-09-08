'use client';

import Link from 'next/link';

interface HeroSectionProps {
  userName?: string;
}

export default function HeroSection({ userName = 'Rahul' }: HeroSectionProps) {
  const firstName = userName ? userName.split(' ')[0] : 'Rahul';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121826] via-[#0e1420] to-[#0B0F17] border border-slate-800/90 p-8 sm:p-10 shadow-2xl">
      {/* Background ambient gold aura */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left: Text & Action Buttons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>SalonPulse • Downtown Studio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Good morning, {firstName} 👋
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Book your next look, manage your appointments, and skip the waiting with SalonPulse.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/customer/book"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>+ Book an Appointment</span>
            </Link>

            <Link
              href="#services"
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-semibold transition-all hover:border-slate-600"
            >
              <span>Explore Services</span>
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-3 flex items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">●</span>
              <span>Open today until 9:00 PM</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span>
              <span>4.9 / 5 Client Rating</span>
            </div>
          </div>
        </div>

        {/* Right: Elegant Modern Salon & Barber Chair Illustration */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800 p-6 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden group">
            {/* Ambient circle glow */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60"></div>
            
            {/* SVG Luxury Barber Chair & Grooming Station Graphic */}
            <svg className="w-28 h-28 text-amber-400/90 mb-3 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              {/* Headrest */}
              <rect x="42" y="10" width="16" height="6" rx="3" strokeWidth="2.5" fill="#f59e0b" fillOpacity="0.2" />
              {/* Backrest */}
              <path d="M34 20 C34 16, 66 16, 66 20 L68 45 C68 47, 65 49, 62 49 L38 49 C35 49, 32 47, 32 45 Z" strokeWidth="2.5" fill="#1e293b" />
              {/* Cushioned Seat */}
              <rect x="26" y="52" width="48" height="12" rx="4" strokeWidth="2.5" fill="#f59e0b" fillOpacity="0.25" />
              {/* Armrests */}
              <path d="M26 38 L22 38 C20 38, 19 40, 19 42 L19 50 C19 52, 21 54, 23 54 L26 54" strokeWidth="2.5" />
              <path d="M74 38 L78 38 C80 38, 81 40, 81 42 L81 50 C81 52, 79 54, 77 54 L74 54" strokeWidth="2.5" />
              {/* Hydraulic Pump Cylinder */}
              <rect x="46" y="64" width="8" height="16" strokeWidth="2.5" fill="#334155" />
              {/* Heavy Base Plate */}
              <ellipse cx="50" cy="83" rx="28" ry="6" strokeWidth="2.5" fill="#0f172a" />
              {/* Footrest */}
              <path d="M32 72 L68 72 L64 77 L36 77 Z" strokeWidth="2" fill="#f59e0b" fillOpacity="0.15" />
            </svg>

            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Premium Grooming Chair
              </span>
              <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                Master Barbers • Hygiene First • Zero Wait
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

