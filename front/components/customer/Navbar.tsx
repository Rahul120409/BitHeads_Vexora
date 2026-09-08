'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scissors,
  MapPin,
  Home,
  Compass,
  CalendarCheck,
  User,
  SunMedium,
  MoonStar,
  Bell,
  LogOut,
  X,
  Menu,
  ChevronDown,
  Navigation,
  Loader2,
  Search
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { customerService } from '../../services/customerService';
import { locationService } from '../../services/locationService';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [customLocInput, setCustomLocInput] = useState('');

  const handleLogout = () => {
    customerService.logout();
    window.location.href = '/login';
  };

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setGpsError(null);
    try {
      const detected = await locationService.detectRealTimeLocation();
      if (onChangeLocation) onChangeLocation(detected.formatted);
      setLocationModalOpen(false);
    } catch (err: any) {
      try {
        const ipLoc = await locationService.detectLocationFromIp();
        if (onChangeLocation) onChangeLocation(ipLoc.formatted);
        setLocationModalOpen(false);
      } catch {
        setGpsError(err?.message || 'Could not detect location. Please select below.');
      }
    } finally {
      setIsDetectingGps(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/customer', icon: Home },
    { label: 'Nearby Salons', href: '/customer#salons', icon: Compass },
    { label: 'Appointments', href: '/customer/appointments', icon: CalendarCheck },
    { label: 'My Profile', href: '/customer/profile', icon: User },
  ];

  const popularLocations = [
    'Mumbai (Bandra West)',
    'Mumbai (South Mumbai / Colaba)',
    'Bengaluru (Indiranagar 100ft Rd)',
    'Bengaluru (Koramangala 4th Block)',
    'Delhi NCR (Connaught Place)',
    'Pune (Koregaon Park)',
    'Hyderabad (Jubilee Hills)',
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-colors border-b backdrop-blur-md ${
        isLight
          ? 'bg-[#fff8f4]/95 border-[#e9e1dc] text-[#1e1b18]'
          : 'bg-[#0B0F17]/95 border-slate-800 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand & Location Chip */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/customer" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8c4a32] to-[#6f331d] text-white flex items-center justify-center font-black text-xl shadow-md ring-2 ring-[#8c4a32]/20 group-hover:scale-105 transition-all">
              <Scissors className="w-5 h-5 stroke-[2.2]" />
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

          {/* Location Chip with Live Beacon */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc]'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MapPin className="w-3.5 h-3.5 text-[#8c4a32] dark:text-amber-400 stroke-[2.2]" />
            <span className="max-w-[130px] truncate">{userLocation}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </div>

        {/* Center Navigation Tabs (Visible on tablet & desktop) */}
        <nav
          className={`hidden md:flex items-center gap-1 p-1 rounded-full text-xs font-semibold shadow-xs ${
            isLight
              ? 'bg-[#f4ece7] border border-[#e2d5ce]'
              : 'bg-slate-900/90 border border-slate-800'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComp = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 group ${
                  isActive
                    ? isLight
                      ? 'bg-gradient-to-r from-[#6f331d] to-[#8c4a32] text-white font-bold shadow-sm'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold shadow-sm'
                    : isLight
                    ? 'text-[#53433e] hover:text-[#1e1b18] hover:bg-[#e9e1dc]/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isActive
                    ? isLight
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-950/20 text-slate-950'
                    : isLight
                    ? 'text-[#8c4a32]'
                    : 'text-amber-400'
                }`}>
                  <IconComp className="w-3.5 h-3.5 stroke-[2.4]" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Theme Switcher + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Light / Dark Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 sm:px-3 rounded-full border transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#6f331d] hover:bg-[#e9e1dc]'
                : 'bg-slate-900 border-slate-800 text-amber-400 hover:border-slate-700 hover:bg-slate-800'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <>
                <MoonStar className="w-4 h-4 stroke-[2.2]" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <SunMedium className="w-4 h-4 stroke-[2.2]" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`relative p-2 rounded-full border transition-colors ${
                isLight
                  ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#53433e] hover:text-[#6f331d] hover:bg-[#e9e1dc]'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <Bell className="w-4 h-4 stroke-[2.2]" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8c4a32] dark:bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8c4a32] dark:bg-amber-500"></span>
              </span>
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

          {/* User Profile Pill with Professional User Avatar Icon */}
          <Link
            href="/customer/profile"
            className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all duration-200 group shadow-xs ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] hover:border-[#8c4a32] hover:bg-[#ebdcd6]'
                : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80'
            }`}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
                isLight
                  ? 'bg-gradient-to-tr from-[#6f331d] to-[#8c4a32] text-white ring-2 ring-[#8c4a32]/20'
                  : 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 ring-2 ring-amber-400/20'
              }`}>
                <User className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0F17]" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-bold text-xs leading-tight group-hover:text-[#6f331d] dark:group-hover:text-amber-400 transition-colors">
                {userName}
              </div>
              <div className={`text-[9px] uppercase tracking-wider font-semibold ${
                isLight ? 'text-[#8c4a32]' : 'text-amber-400/90'
              }`}>
                {userRole}
              </div>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Log out"
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              isLight
                ? 'border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc] hover:text-rose-600'
                : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-rose-400'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Mobile Menu Toggle Button (Visible below md) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className={`md:hidden p-2 rounded-full border transition-colors flex items-center justify-center ${
              isLight
                ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#6f331d] hover:bg-[#e9e1dc]'
                : 'bg-slate-900 border-slate-800 text-slate-200 hover:text-white hover:border-slate-700'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 stroke-[2.4]" />
            ) : (
              <Menu className="w-4 h-4 stroke-[2.4]" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer (Expandable when hamburger is toggled) */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-4 py-3 space-y-1 transition-all ${
            isLight
              ? 'bg-[#fff8f4] border-[#e9e1dc]'
              : 'bg-[#0B0F17] border-slate-800'
          }`}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComp = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-[#6f331d] text-white shadow-sm'
                      : 'bg-amber-500 text-slate-950 shadow-sm'
                    : isLight
                    ? 'text-[#53433e] hover:bg-[#f4ece7]'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isActive
                    ? isLight ? 'bg-white/20' : 'bg-slate-950/20'
                    : isLight ? 'bg-[#f4ece7] text-[#6f331d]' : 'bg-slate-800 text-amber-400'
                }`}>
                  <IconComp className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

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
                className="p-1 rounded-full opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Real-time GPS detection button */}
              <button
                type="button"
                disabled={isDetectingGps}
                onClick={handleDetectGps}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md ${
                  isDetectingGps
                    ? 'opacity-80 cursor-wait'
                    : 'hover:scale-[1.01] active:scale-[0.99]'
                } ${
                  isLight
                    ? 'bg-gradient-to-r from-[#8c4a32] to-[#6f331d] text-white shadow-[#8c4a32]/25'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting Your Real-Time Location (GPS)...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 stroke-[2.2]" />
                    <span>Detect Current Location in Real-Time (GPS)</span>
                  </>
                )}
              </button>

              {gpsError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] leading-tight">
                  {gpsError}
                </div>
              )}

              {/* Custom manual city input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    placeholder="Enter city (e.g. Mumbai, Delhi, Pune)..."
                    value={customLocInput}
                    onChange={(e) => setCustomLocInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customLocInput.trim()) {
                        if (onChangeLocation) onChangeLocation(customLocInput.trim());
                        locationService.setStoredLocation(customLocInput.trim());
                        setLocationModalOpen(false);
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none transition-all ${
                      isLight
                        ? 'bg-[#f4ece7] border-[#d9c2ba] focus:border-[#6f331d] text-[#1e1b18]'
                        : 'bg-slate-900 border-slate-700 focus:border-amber-400 text-slate-100'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (customLocInput.trim()) {
                      if (onChangeLocation) onChangeLocation(customLocInput.trim());
                      locationService.setStoredLocation(customLocInput.trim());
                      setLocationModalOpen(false);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    isLight
                      ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  Apply
                </button>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase opacity-60 mb-2">
                  Or pick a popular metro:
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        if (onChangeLocation) onChangeLocation(loc);
                        locationService.setStoredLocation(loc);
                        setLocationModalOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 ${
                        isLight
                          ? 'hover:bg-[#f4ece7] text-[#53433e]'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{loc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
