'use client';

import Link from "next/link";
import { Sparkles, ShieldCheck, Users, Calendar, ArrowRight, CheckCircle2, UserPlus, LogIn, Clock, Scissors, Star, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import { useTheme } from "@/hooks/useTheme";

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);
  const { isDark, toggle, mounted } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  // Use isDark only after mount to avoid hydration mismatch
  const d = mounted ? isDark : true;

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative transition-colors duration-300"
      style={{
        backgroundColor: d ? '#020617' : '#f9fafb',
        color: d ? '#f1f5f9' : '#0f172a'
      }}
    >
      {/* Ambient background glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[450px] ${d ? 'bg-amber-500/10' : 'bg-amber-400/15'} blur-[140px] pointer-events-none rounded-full`}></div>

      {/* Top Header */}
      <header className={`w-full border-b ${d ? 'border-slate-800/80 bg-slate-950/80' : 'border-amber-200/60 bg-white/80'} backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-40 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              ✂
            </div>
            <div>
              <span className={`font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r ${d ? 'from-white via-slate-200 to-amber-400' : 'from-slate-900 via-slate-700 to-amber-500'} bg-clip-text text-transparent`}>
                SalonPulse
              </span>
              <span className="text-[10px] sm:text-[11px] text-amber-500 uppercase tracking-widest font-semibold block -mt-1">
                Live Operations
              </span>
            </div>
          </Link>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <button
              onClick={toggle}
              title={d ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2 rounded-xl border transition-all duration-200 hover:scale-105 ${d ? 'border-slate-700 bg-slate-800/60 text-amber-400 hover:bg-slate-700' : 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
            >
              {d ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16 relative z-10">

        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-8">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${d ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-300'} border text-amber-500 text-xs font-semibold uppercase tracking-wider`}>
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Operational Salon System
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${d ? 'text-white' : 'text-slate-900'} leading-tight`}>
            Zero Waiting Rooms. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Real-Time Salon Booking &amp; Queue
            </span>
          </h1>

          <p className={`${d ? 'text-slate-300' : 'text-slate-600'} text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto`}>
            Welcome to SalonPulse! Register or Sign In to explore nearby salons, pick haircut styles, book slots, and track live queue positions without waiting in line.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account →</span>
            </Link>

            <Link
              href="/login"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl ${d ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-white' : 'bg-white border-amber-300 hover:border-amber-500 text-slate-700 hover:text-slate-900'} border font-extrabold text-sm sm:text-base transition-all hover:scale-105 flex items-center justify-center gap-2`}
            >
              <LogIn className="w-4 h-4 text-amber-500" />
              <span>Sign In to Your Account</span>
            </Link>
          </div>

          <p className={`text-xs ${d ? 'text-slate-400' : 'text-slate-500'}`}>
            Already registered? Simply click <strong className="text-amber-500 font-semibold">Sign In</strong> above to access your dashboard.
          </p>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {[
            { icon: Clock, title: 'Live Queue Tracking', desc: 'Track your exact queue position (Token #1, #2, #3) in real-time on your mobile or desktop screen. Walk in when your stylist chair is ready.' },
            { icon: Scissors, title: 'Haircut & Stylist Selection', desc: 'Browse precision haircuts, beard grooming, and facial treatments. Pick your preferred master stylist and book timing slots.' },
            { icon: Star, title: 'Multi-Role Portals', desc: 'Dedicated interfaces for Customers, Salon Staff barbers, and Salon Owners to manage appointments, operational queues, and revenue.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className={`p-6 rounded-3xl ${d ? 'bg-slate-900/80 border-slate-800/80 hover:border-amber-500/30' : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-amber-100'} border transition-all space-y-4`}>
              <div className={`w-12 h-12 rounded-2xl ${d ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-300'} border flex items-center justify-center text-amber-500`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-bold ${d ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <p className={`text-xs ${d ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>{desc}</p>
            </div>
          ))}
        </section>

        {/* Portal Selection Section */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${d ? 'text-white' : 'text-slate-900'}`}>
              Explore Live System Portals
            </h2>
            <p className={`text-xs sm:text-sm ${d ? 'text-slate-400' : 'text-slate-500'}`}>
              Choose your user role to enter the dashboard:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer */}
            <Link href="/login" className={`group relative p-6 rounded-3xl ${d ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:shadow-amber-500/10' : 'bg-white border-amber-200 hover:border-amber-500 hover:shadow-amber-100'} border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between space-y-6`}>
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${d ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-300'} border flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Customer Role</span>
                  <h3 className={`text-xl font-bold ${d ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-600'} mt-1 transition-colors`}>Customer Booking &amp; Queue</h3>
                  <p className={`text-xs ${d ? 'text-slate-400' : 'text-slate-500'} mt-2 leading-relaxed`}>Sign in to book appointments, manage queue tokens, and view estimated wait times.</p>
                </div>
              </div>
              <div className={`flex items-center text-xs font-semibold ${d ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-600 group-hover:text-amber-700'}`}>
                Register / Sign In <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Staff */}
            <Link href="/staff" className={`group relative p-6 rounded-3xl ${d ? 'bg-slate-900/90 border-slate-800 hover:border-sky-500/50 hover:shadow-sky-500/10' : 'bg-white border-sky-200 hover:border-sky-400 hover:shadow-sky-100'} border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between space-y-6`}>
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${d ? 'bg-sky-500/10 border-sky-500/20' : 'bg-sky-100 border-sky-300'} border flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform`}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">Staff Barber Role</span>
                  <h3 className={`text-xl font-bold ${d ? 'text-white group-hover:text-sky-300' : 'text-slate-900 group-hover:text-sky-600'} mt-1 transition-colors`}>Staff Dashboard</h3>
                  <p className={`text-xs ${d ? 'text-slate-400' : 'text-slate-500'} mt-2 leading-relaxed`}>Manage live queue controls, start/complete haircut services, handle walk-ins.</p>
                </div>
              </div>
              <div className={`flex items-center text-xs font-semibold ${d ? 'text-sky-400 group-hover:text-sky-300' : 'text-sky-600 group-hover:text-sky-700'}`}>
                Open Staff Dashboard <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Admin */}
            <Link href="/admin" className={`group relative p-6 rounded-3xl ${d ? 'bg-slate-900/90 border-slate-800 hover:border-purple-500/50 hover:shadow-purple-500/10' : 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-purple-100'} border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between space-y-6`}>
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${d ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-100 border-purple-300'} border flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Admin Manager Role</span>
                  <h3 className={`text-xl font-bold ${d ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-600'} mt-1 transition-colors`}>Admin Analytics</h3>
                  <p className={`text-xs ${d ? 'text-slate-400' : 'text-slate-500'} mt-2 leading-relaxed`}>Monitor live KPI metrics, salon revenue, chair utilization, and staff roster.</p>
                </div>
              </div>
              <div className={`flex items-center text-xs font-semibold ${d ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-700'}`}>
                Open Admin Analytics <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Footer bar */}
        <div className={`pt-8 border-t ${d ? 'border-slate-800/80 text-slate-400' : 'border-amber-200 text-slate-500'} w-full flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs`}>
          {['Next.js App Router', 'Java Spring Boot Backend', 'Real-time Queue Engine'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500" /> {t}
            </span>
          ))}
        </div>

      </main>
    </div>
  );
}
