'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '../../../components/customer/ThemeContext';
import Navbar from '../../../components/customer/Navbar';
import MobileNavigation from '../../../components/customer/MobileNavigation';
import { customerService } from '../../../services/customerService';
import { CustomerQueueStatus, mockCustomer } from '../../../mock/customerMock';
import { Clock, Scissors, User, Phone, MapPin, CheckCircle, Bell, RefreshCw, AlertCircle, Sparkles, ChevronRight, FastForward } from 'lucide-react';

function LiveQueueContent() {
  const { isLight } = useTheme();
  const [queueData, setQueueData] = useState<CustomerQueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [demoPosition, setDemoPosition] = useState<number | null>(null);

  const activeUser = customerService.getCurrentUser() || mockCustomer;

  const fetchLiveQueue = async () => {
    try {
      const data = await customerService.getQueueStatus(activeUser.id);
      if (data) {
        setQueueData(data);
        setLastRefreshed(new Date());

        // Check if customer's turn has arrived
        if (data.status === 'SERVING' || data.position === 1) {
          triggerDingNotification();
        }
      }
    } catch (err) {
      console.warn('[QueuePage] Polling failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDingNotification = () => {
    setToastMessage(`🔔 Ding! Your token is NOW SERVING with ${queueData?.staffName || 'Alex Rivera'} at Chair 2!`);
    try {
      // Browser audio chime fallback
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext not permitted without user gesture
    }
  };

  // Step 3: Auto-polling (every 8-10 seconds)
  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentPos = demoPosition ?? (queueData?.position ?? 3);
  const isServing = currentPos === 1 || queueData?.status === 'SERVING';
  const tokenNumber = queueData?.tokenNumber || (queueData?.position ? `T-${String(queueData.position).padStart(3, '0')}` : 'T-003');
  const waitMinutes = isServing ? 0 : (queueData?.estimatedWaitMinutes ?? currentPos * 10);
  const peopleAhead = Math.max(0, currentPos - 1);

  const handleSimulateAdvance = () => {
    if (currentPos > 1) {
      const next = currentPos - 1;
      setDemoPosition(next);
      if (next === 1) {
        triggerDingNotification();
      } else {
        setToastMessage(`✨ Real-time update: Position #${next} (~${next * 10} mins wait remaining).`);
      }
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setDemoPosition(3);
      setToastMessage(`🔄 Demo reset to Token ${tokenNumber} (Position #3).`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors pb-24 md:pb-12 ${
        isLight ? 'bg-[#fff8f4] text-[#1e1b18]' : 'bg-[#0B0F17] text-slate-100'
      }`}
    >
      <Navbar userName={activeUser.name} />

      {/* Real-time Toast / Ding Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-amber-500 text-slate-950 font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-400 animate-bounce">
          <Bell className="w-5 h-5 shrink-0" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-auto text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-70">
              <Link href="/customer" className="hover:underline text-amber-500">
                ← Home
              </Link>
              <span>•</span>
              <Link href="/customer/appointments" className="hover:underline text-amber-500">
                My Appointments
              </Link>
              <span>•</span>
              <span>Step 3: Live Queue Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight flex items-center gap-3">
              <span>Live Salon Queue Tracker</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync (8s)
              </span>
            </h1>
            <p className="text-xs opacity-75 mt-1">
              Tracking token for {activeUser.name} • Last synchronized at {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateAdvance}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLight ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#6f331d]' : 'border-slate-800 hover:bg-slate-800 text-purple-300'
              }`}
              title="Test queue countdown"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Simulate Turn</span>
            </button>
            <button
              onClick={() => { setLoading(true); fetchLiveQueue(); }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLight ? 'border-[#d9c2ba] hover:bg-[#f4ece7]' : 'border-slate-800 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PROMINENT LIVE TOKEN DISPLAY HERO */}
        <div
          className={`rounded-3xl p-6 sm:p-10 border shadow-xl relative overflow-hidden mb-8 ${
            isLight
              ? 'bg-white border-[#d9c2ba]'
              : 'bg-[#121826] border-slate-800'
          }`}
        >
          {/* Subtle Glow Background */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
            isServing ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          }`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    isServing
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {isServing ? '🔔 NOW SERVING — PROCEED TO CHAIR' : 'WAITING IN LINE'}
                </span>
                <span className="text-xs opacity-60">
                  {queueData?.service || 'Classic Fade Haircut'}
                </span>
              </div>

              <div className="text-xs uppercase tracking-wider opacity-60 font-bold">
                Your Confirmed Token
              </div>
              <div
                className={`text-6xl sm:text-7xl font-mono font-black tracking-tight my-2 ${
                  isLight ? 'text-[#6f331d]' : 'text-amber-400'
                }`}
              >
                {tokenNumber}
              </div>

              <p className="text-sm font-medium opacity-90 mt-2">
                {isServing ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Please step up to Chair 2. Alex Rivera is ready for you!
                  </span>
                ) : (
                  <span>
                    You are <strong className="text-amber-500 font-bold">#{currentPos}</strong> in line. {peopleAhead === 0 ? 'You are next in queue!' : `${peopleAhead} customer${peopleAhead > 1 ? 's' : ''} ahead of you.`}
                  </span>
                )}
              </p>
            </div>

            {/* Waiting Metric Gauges */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 bg-slate-500/5 p-5 rounded-2xl border border-inherit">
              <div className="text-center p-3">
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-60 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Wait Time
                </span>
                <div className={`text-3xl font-black mt-1 ${isServing ? 'text-emerald-500' : isLight ? 'text-[#6f331d]' : 'text-amber-400'}`}>
                  {isServing ? '0m' : `~${waitMinutes}m`}
                </div>
                <div className="text-[10px] opacity-60 mt-0.5 font-medium">
                  {isServing ? 'Turn Ready' : 'Estimated Time'}
                </div>
              </div>

              <div className="text-center p-3 border-l border-inherit">
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-60 flex items-center justify-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Queue Pos
                </span>
                <div className="text-3xl font-black mt-1">
                  #{currentPos}
                </div>
                <div className="text-[10px] opacity-60 mt-0.5 font-medium">
                  {peopleAhead} ahead
                </div>
              </div>
            </div>
          </div>

          {/* Queue Progress Visualizer */}
          <div className="mt-8 pt-6 border-t border-inherit">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span>Queue Status</span>
              <span className="opacity-70">
                {isServing ? '100% Ready' : `${Math.round(((4 - currentPos) / 3) * 100)}% Progress`}
              </span>
            </div>
            <div className="w-full bg-slate-500/20 h-3 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-700 ${
                  isServing ? 'bg-emerald-500 w-full' : currentPos === 2 ? 'bg-amber-500 w-2/3' : 'bg-amber-500 w-1/3'
                }`}
              />
            </div>
            <div className="flex justify-between text-[11px] opacity-60 mt-2 font-medium">
              <span>Token Issued</span>
              <span className={currentPos <= 2 ? 'font-bold text-amber-500' : ''}>Next in Line</span>
              <span className={isServing ? 'font-bold text-emerald-500' : ''}>Now Serving (Chair 2)</span>
            </div>
          </div>
        </div>

        {/* DETAILED APPOINTMENT & SALON DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Stylist & Service Details */}
          <div
            className={`rounded-2xl p-6 border shadow-sm ${
              isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
            }`}
          >
            <h3 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-500" />
              <span>Assigned Stylist & Service</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Stylist</span>
                <span className="font-bold text-sm">{queueData?.staffName || 'Alex Rivera'} (Fade Master)</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Station</span>
                <span className="font-bold text-emerald-500">Chair 2 (Main Floor)</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Haircut Service</span>
                <span className="font-bold">{queueData?.service || 'Classic Fade Haircut'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Estimated Service Duration</span>
                <span className="font-bold">{queueData?.durationMinutes || 30} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Queue Joined At</span>
                <span className="font-mono">{queueData?.joinedAt || '14:35:00'}</span>
              </div>
            </div>
          </div>

          {/* Customer & Notification Contact */}
          <div
            className={`rounded-2xl p-6 border shadow-sm ${
              isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
            }`}
          >
            <h3 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Customer & Notification Info</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Customer Name</span>
                <span className="font-bold">{queueData?.customerName || activeUser.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Phone (SMS Alerts)</span>
                <span className="font-mono font-bold">{queueData?.customerPhone || activeUser.phone || '9876543210'}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">SMS Updates</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  ✓ Active (Token & Turn SMS)
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <span className="opacity-70">Salon Location</span>
                <span className="font-medium">101 100ft Road, Indiranagar</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Queue Ticket ID</span>
                <span className="font-mono font-bold text-amber-500">#{queueData?.queueId || 3}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/customer"
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs border text-center transition-all ${
              isLight
                ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#1e1b18]'
                : 'border-slate-800 hover:bg-slate-800 text-slate-200'
            }`}
          >
            ← Back to Salons
          </Link>
          <Link
            href="/customer/appointments"
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white text-center transition-all shadow-md ${
              isLight
                ? 'bg-[#6f331d] hover:bg-[#5a2816]'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
            }`}
          >
            View All Appointments →
          </Link>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}

export default function LiveQueuePage() {
  return (
    <ThemeProvider>
      <LiveQueueContent />
    </ThemeProvider>
  );
}

