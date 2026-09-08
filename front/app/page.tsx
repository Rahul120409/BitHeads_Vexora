import Link from "next/link";
import { Sparkles, ShieldCheck, Users, Calendar, ArrowRight, Activity, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header */}
      <header className="w-full border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SalonPulse
              </span>
              <span className="text-xs text-slate-400 font-medium block">
                Real-Time Salon Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5" />
            <span>System Online</span>
          </div>
        </div>
      </header>

      {/* Main Hero & Portal Options */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Live Hackathon Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Streamlined Salon Queues & Real-time Operations
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Select your portal to access live monitoring, queue management, or customer bookings.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Admin Portal Card */}
          <Link
            href="/admin"
            className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Person 3 Role
                </span>
                <h2 className="text-xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                  Admin Dashboard
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Monitor live KPI metrics, queue activity, staff statuses, and revenue insights.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              Open Admin Portal <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Staff Portal Card */}
          <Link
            href="/staff"
            className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Person 2 Role
                </span>
                <h2 className="text-xl font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                  Staff Dashboard
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Manage live queue controls, start/complete services, handle walk-ins, and no-shows.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
              Open Staff Portal <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Customer Booking Card */}
          <Link
            href="/customer"
            className="group relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Person 1 Role
                </span>
                <h2 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                  Customer Booking
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Book appointments, track live queue positions, and view estimated wait times.
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              Open Customer Portal <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Feature Highlights */}
        <div className="pt-6 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Next.js App Router
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Java Spring Boot REST API
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Supabase Realtime Engine
          </span>
        </div>

      </main>

    </div>
  );
}
