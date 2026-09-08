'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNavigation() {
  const pathname = usePathname();

  const links = [
    { label: 'Home', href: '/customer', icon: '🏠' },
    { label: 'Services', href: '#services', icon: '✂️' },
    { label: 'Book', href: '/customer/book', icon: '📅', highlight: true },
    { label: 'Appointments', href: '/customer/appointments', icon: '🎫' },
    { label: 'Live Queue', href: '/customer/queue', icon: '⏱️' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800/90 py-2 px-3">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.href;
          if (link.highlight) {
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 w-12 h-12 rounded-full shadow-lg shadow-amber-500/30 font-bold"
              >
                <span className="text-lg">＋</span>
              </Link>
            );
          }
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base leading-none mb-1">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

