"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronDown,
  User,
  ShieldCheck,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { customerService } from "../../../services/customerService";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function AdminNavbar({ onToggleSidebar, isSidebarOpen }: AdminNavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationsCount] = useState(3);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF6F0] border-b border-[#EADFD7] text-[#381E11] px-4 lg:px-6 py-3 transition-all duration-200 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Brand Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#381E11]/70 hover:text-[#381E11] hover:bg-[#6B3820]/15 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-[#6B3820]" /> : <Menu className="w-5 h-5 text-[#6B3820]" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#6B3820] p-0.5 shadow-md shadow-[#6B3820]/30 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#381E11] group-hover:text-[#6B3820] transition-colors">
                  SalonPulse
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-[#6B3820] text-white shadow-xs">
                  ADMIN
                </span>
              </div>
              <span className="text-[11px] text-[#381E11]/60 font-semibold hidden sm:inline-block">
                Operations & Live Monitoring
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Quick Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#6B3820]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appointments, staff, customers..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#EADFD7] rounded-xl text-[#381E11] placeholder-[#381E11]/40 focus:outline-none focus:ring-2 focus:ring-[#6B3820] focus:border-[#6B3820] transition-all duration-200 shadow-xs"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#381E11]/60 bg-[#FAF6F0] rounded border border-[#EADFD7]">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side: Status Pills & Admin Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Real-time Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6B3820]/15 border border-[#6B3820]/30 text-[#6B3820] text-xs font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B3820] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B3820]"></span>
            </span>
            <Activity className="w-3.5 h-3.5" />
            <span>Live Sync</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            title="Refresh Dashboard Data"
            className="p-2 rounded-xl text-[#381E11]/70 hover:text-[#6B3820] hover:bg-white border border-transparent hover:border-[#6B3820]/30 transition-all duration-150 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#6B3820]" : ""}`} />
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              title="Notifications"
              className="p-2 rounded-xl text-[#381E11]/70 hover:text-[#6B3820] hover:bg-white border border-transparent hover:border-[#6B3820]/30 transition-all duration-150 shadow-xs relative"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6B3820] rounded-full ring-2 ring-[#FAF6F0]" />
              )}
            </button>
          </div>

          <div className="h-6 w-px bg-[#EADFD7] hidden sm:block" />

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl hover:bg-white border border-transparent hover:border-[#EADFD7] transition-all duration-150 shadow-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-[#6B3820] flex items-center justify-center font-extrabold text-xs text-white shadow-sm">
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#381E11] leading-tight">Admin Manager</p>
                <p className="text-[10px] text-[#6B3820] flex items-center gap-1 font-extrabold">
                  <ShieldCheck className="w-2.5 h-2.5" /> Super Admin
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#381E11]/60 transition-transform duration-200 ${showProfileMenu ? "rotate-180 text-[#6B3820]" : ""}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EADFD7] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#FAF6F0]">
                  <p className="text-sm font-bold text-[#381E11]">Admin Account</p>
                  <p className="text-xs text-[#6B3820] font-semibold truncate">admin@salonpulse.com</p>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#381E11]/80 hover:text-[#6B3820] hover:bg-[#FAF6F0] transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B3820]" />
                    Salon Settings
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#381E11]/80 hover:text-[#6B3820] hover:bg-[#FAF6F0] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#6B3820]" />
                    Profile Details
                  </Link>
                </div>

                <div className="border-t border-[#FAF6F0] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      customerService.logout();
                      window.location.href = '/';
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
