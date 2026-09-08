'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scissors, Home, CalendarCheck, Clock, User, LogOut } from 'lucide-react';
import { CustomerUser, CustomerQueueStatus } from '../../mock/customerMock';
import { customerService } from '../../services/customerService';

interface NavbarProps {
  user?: CustomerUser | null;
  queue?: CustomerQueueStatus | null;
}

export default function CustomerNavbar({ user, queue }: NavbarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(user || null);

  useEffect(() => {
    if (!user) {
      const u = customerService.getCurrentUser();
      setCurrentUser(u);
    }
  }, [user]);

  const activeUser = user || currentUser;
  const displayName = activeUser?.name || 'Customer';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    customerService.logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Overview', href: '/customer', icon: Home },
    { name: 'Book Service', href: '/customer/book', icon: Scissors },
    { name: 'Live Queue', href: '/customer/queue', icon: Clock },
    { name: 'Appointments', href: '/customer/appointments', icon: CalendarCheck },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-8">
          <Link href="/customer" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
                SalonPulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-l border-slate-800 pl-2">
                Client Dashboard
              </span>
            </div>
          </Link>

          {/* Clean Segmented Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 text-xs font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const IconComp = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status & Account */}
        <div className="flex items-center gap-3">
          {queue && (
            <Link
              href="/customer/queue"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold transition-all group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">Live Token:</span>
              <span className="text-amber-400 font-bold">#{queue.position}</span>
            </Link>
          )}

          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

          {/* User Profile Pill with Professional Avatar */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/customer/profile"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                  {initials || <User className="w-4 h-4 stroke-[2.4]" />}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-500">{activeUser?.role || 'Customer'}</div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="ml-1 text-slate-400 hover:text-rose-400 text-xs font-medium px-2 py-1 rounded hover:bg-slate-900 transition-colors flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
