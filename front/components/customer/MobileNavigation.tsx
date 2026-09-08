'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Plus, CalendarCheck, User } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function MobileNavigation() {
  const pathname = usePathname();
  const { isLight } = useTheme();

  const links = [
    { label: 'Home', href: '/customer', icon: Home },
    { label: 'Nearby', href: '/customer#salons', icon: Compass },
    { label: 'Book', href: '/customer/book', icon: Plus, highlight: true },
    { label: 'Bookings', href: '/customer/appointments', icon: CalendarCheck },
    { label: 'Profile', href: '/customer/profile', icon: User },
  ];

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t py-2 px-3 transition-colors ${
        isLight
          ? 'bg-[#fff8f4]/95 border-[#e9e1dc] text-[#1e1b18]'
          : 'bg-[#0B0F17]/95 border-slate-800/90 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const IconComp = link.icon;
          if (link.highlight) {
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 w-12 h-12 rounded-full shadow-lg shadow-amber-500/30 font-bold hover:scale-105 transition-transform"
                title={link.label}
              >
                <Plus className="w-6 h-6 stroke-[2.6]" />
              </Link>
            );
          }
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all gap-1 ${
                isActive
                  ? isLight
                    ? 'text-[#6f331d] font-black'
                    : 'text-amber-400 font-black'
                  : isLight
                  ? 'text-[#86736d] hover:text-[#1e1b18]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive
                    ? isLight
                      ? 'bg-[#ffede6] text-[#6f331d] scale-105'
                      : 'bg-amber-500/20 text-amber-400 scale-105'
                    : ''
                }`}
              >
                <IconComp
                  className={`w-5 h-5 ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

