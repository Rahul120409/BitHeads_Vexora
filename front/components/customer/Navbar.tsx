'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { customerService } from '../../services/customerService';

interface NavbarProps {
  userLocation?: string;
  onChangeLocation?: (loc: string) => void;
  userName?: string;
  userRole?: string;
}

export default function Navbar({
  userLocation = 'Downtown, Metro Area',
  onChangeLocation,
  userName = 'Rahul Sharma',
  userRole = 'Privilège Member'
}: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, isLight } = useTheme();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    customerService.logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { label: 'Home', href: '/customer', icon: '🏠' },
    { label: 'Nearby Salons', href: '/customer#salons', icon: '📍' },
    { label: 'Appointments', href: '/customer/appointments', icon: '🎫' },
    { label: 'My Profile', href: '/customer/profile', icon: '👤' },
  ];

  const popularLocations = [
    'Downtown, Metro Area',
    'Indiranagar 100ft Road',
    'Koramangala 4th Block',
    'Bandra West, Mumbai',
    'Whitefield IT Corridor',
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-colors border-b backdrop-blur-md ${
        isLight
          ? 'bg-[#fff8f4]/90 border-[#e9e1dc] text-[#1e1b18]'
          : 'bg-[#0B0F17]/90 border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand & Location Chip */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/customer" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8c4a32] to-[#6f331d] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              ✂
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight font-serif ${
                isLight ? 'text-[#6f331d]' : 'text-amber-400'
              }`}>
                SalonPulse
              </span>
              <span className={`block text-[9px] uppercase tracking-widest font-semibold -mt-1 ${
                isLight ? 'text-[#86736d]' : 'text-slate-400'
              }`}>
                Live Salon Operations
              </span>
            </div>
          </Link>

          {/* Location Chip */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc]'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="text-sm text-[#8c4a32]">📍</span>
            <span className="max-w-[130px] truncate">{userLocation}</span>
            <span className="text-[10px]">▼</span>
          </button>
        </div>

        {/* Center Navigation Tabs */}
        <nav
          className={`hidden lg:flex items-center gap-1.5 p-1 rounded-full text-xs font-semibold ${
            isLight ? 'bg-[#f4ece7]' : 'bg-slate-900/90 border border-slate-800'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                  isActive
                    ? isLight
                      ? 'bg-[#6f331d] text-white font-bold shadow-sm'
                      : 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : isLight
                    ? 'text-[#53433e] hover:text-[#1e1b18] hover:bg-[#e9e1dc]/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Theme Switcher + Notifications + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Light / Dark Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 rounded-full border transition-colors flex items-center justify-center text-sm ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#6f331d] hover:bg-[#e9e1dc]'
                : 'bg-slate-900 border-slate-800 text-amber-400 hover:border-slate-700'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            <span>{isLight ? '🌙 Dark' : '☀️ Light'}</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2 rounded-full border text-base transition-colors ${
                isLight
                  ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#53433e] hover:text-[#6f331d]'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#8c4a32]"></span>
            </button>

            {notificationsOpen && (
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl p-4 border z-50 text-xs ${
                  isLight
                    ? 'bg-[#fff8f4] border-[#d9c2ba] text-[#1e1b18]'
                    : 'bg-[#121826] border-slate-800 text-slate-200'
                }`}
              >
                <div className="font-bold text-sm mb-2 pb-1 border-b border-inherit flex justify-between">
                  <span>Notifications</span>
                  <span className="text-[10px] text-[#8c4a32] font-semibold">1 New</span>
                </div>
                <div className="py-1">
                  <div className="font-bold text-xs">Live Queue Status</div>
                  <p className="text-[11px] opacity-80 mt-0.5">You are #3 in queue for Signature Haircut at Downtown Studio.</p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <Link
            href="/customer/profile"
            className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] hover:border-[#8c4a32]'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#6f331d] text-white font-bold text-xs flex items-center justify-center">
              {userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-bold leading-tight">{userName}</div>
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${
                isLight ? 'text-[#8c4a32]' : 'text-amber-400'
              }`}>
                {userRole}
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Log out"
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc] hover:text-rose-600'
                : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-rose-400'
            }`}
          >
            Logout
          </button>
        </div>

      </div>

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
              isLight
                ? 'bg-[#fff8f4] border-[#d9c2ba] text-[#1e1b18]'
                : 'bg-[#121826] border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="font-bold text-base">Select Your Location</h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="text-sm font-bold opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4">
              <button
                onClick={() => {
                  if (onChangeLocation) onChangeLocation('GPS: Current Location (Indiranagar)');
                  setLocationModalOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs font-bold mb-3 ${
                  isLight
                    ? 'bg-[#8c4a32] text-white hover:bg-[#6f331d]'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                <span>📍 Detect Current Location (GPS)</span>
              </button>

              <div className="text-[11px] font-bold uppercase opacity-60 mb-2">
                Or pick a popular area:
              </div>
              <div className="space-y-1.5">
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      if (onChangeLocation) onChangeLocation(loc);
                      setLocationModalOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      isLight
                        ? 'hover:bg-[#f4ece7] text-[#53433e]'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
