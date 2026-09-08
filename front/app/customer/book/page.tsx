'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '../../../components/customer/ThemeContext';
import Navbar from '../../../components/customer/Navbar';
import { customerService } from '../../../services/customerService';
import {
  SalonLocation,
  mockNearbySalons,
  CustomerUser,
  mockCustomer,
  HaircutStyle,
  mockHaircutStyles,
  NextAvailableQueueInfo,
  defaultMockQueueInfo
} from '../../../mock/customerMock';
import {
  Zap,
  Calendar,
  Clock,
  Users,
  Ticket,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Scissors,
  Star,
  Info,
  ChevronRight,
  ShieldCheck,
  Radio,
  ArrowRight,
  Check,
  User,
  Phone,
  FileText,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  Lock
} from 'lucide-react';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLight } = useTheme();

  const salonIdParam = searchParams.get('salonId');
  const serviceIdParam = searchParams.get('serviceId');
  const catParam = searchParams.get('cat');

  const [salon, setSalon] = useState<SalonLocation>(mockNearbySalons[0]);
  const [currentUser, setCurrentUser] = useState<CustomerUser>(mockCustomer);

  // Stepper state: 1: Haircut, 2: Timing & Token, 3: Details, 4: Payment
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Real-Time Haircut Styles & Service Selection
  const [haircutStyles, setHaircutStyles] = useState<HaircutStyle[]>([]);
  const [isLoadingHaircuts, setIsLoadingHaircuts] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE' | 'UNISEX'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<any>(null);

  // Step 2: Timing & Token Selection (2 Sections: Current Token vs Advance Slot)
  const [timingMode, setTimingMode] = useState<'current_token' | 'advance_slot'>('current_token');
  
  // Section 1: Real-Time Live Queue & Next Available Token state
  const [queueInfo, setQueueInfo] = useState<NextAvailableQueueInfo | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);

  // Section 2: Advance Slot state
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:15 AM');
  const [scheduledToken] = useState<string>('#S-14');

  // Common Stylist selection
  const [selectedStylist, setSelectedStylist] = useState<string>('Alex Rivera');

  // Step 3: Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Step 4: Payment state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Fetch real-time haircut styles for salon
  const fetchHaircutsForSalon = async (salonId: number) => {
    setIsLoadingHaircuts(true);
    try {
      const styles = await customerService.getHaircutStyles(salonId);
      if (styles && styles.length > 0) {
        setHaircutStyles(styles);
        setIsLiveConnected(true);
        if (serviceIdParam) {
          const match = styles.find((s) => s.id === parseInt(serviceIdParam, 10));
          setSelectedService(match || styles[0]);
        } else {
          setSelectedService((prev: any) => {
            if (prev && styles.some((s) => s.id === prev.id)) return prev;
            return styles[0];
          });
        }
      } else {
        setHaircutStyles(mockHaircutStyles);
        setSelectedService(mockHaircutStyles[0]);
      }
    } catch (e) {
      console.warn('Real-time haircut style fetch error, falling back to mock catalog:', e);
      setHaircutStyles(mockHaircutStyles);
      setSelectedService(mockHaircutStyles[0]);
    } finally {
      setIsLoadingHaircuts(false);
    }
  };

  const formatTokenDisplay = (token?: string | null) => {
    if (!token || token === 'None' || String(token).toLowerCase().includes('none')) return 'None';
    const digits = String(token).match(/\d+/);
    if (digits) {
      return `#${parseInt(digits[0], 10)}`;
    }
    return String(token);
  };

  // Step 1: Live Queue & Next Available Token (GET /api/queue/summary)
  const loadLiveQueue = async (salonId?: number, silent: boolean = false) => {
    if (!silent) setIsLoadingQueue(true);
    try {
      const data = await customerService.getNextAvailableQueue(salonId || salon.id);
      setQueueInfo(data);
    } catch {
      setQueueInfo(defaultMockQueueInfo);
    } finally {
      if (!silent) setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    // Load current user
    const user = customerService.getCurrentUser() || mockCustomer;
    setCurrentUser(user);
    setCustomerName(user.name);
    setCustomerPhone(user.phone);

    // Determine salon (from real-time API or local cache)
    const parsedId = salonIdParam ? parseInt(salonIdParam, 10) : 1;

    // Trigger real-time haircut styles fetch
    fetchHaircutsForSalon(parsedId);

    // Trigger initial queue status fetch
    loadLiveQueue(parsedId, false);

    customerService.getSalonById(parsedId).then((foundSalon) => {
      setSalon(foundSalon);
      if (foundSalon.stylists && foundSalon.stylists.length > 0) {
        setSelectedStylist(foundSalon.stylists[0].name);
      }
    }).catch(() => {
      const foundSalon = mockNearbySalons.find((s) => s.id === parsedId) || mockNearbySalons[0];
      setSalon(foundSalon);
      if (foundSalon.stylists && foundSalon.stylists.length > 0) {
        setSelectedStylist(foundSalon.stylists[0].name);
      }
    });

    // Fetch real-time stylists directly from backend /api/staff
    customerService.getStylistsForSalon(parsedId).then((realStylists) => {
      if (realStylists && realStylists.length > 0) {
        setSalon((prev) => ({
          ...prev,
          stylists: realStylists
        }));
        setSelectedStylist((curr) => {
          if (realStylists.some((st: any) => st.name === curr)) return curr;
          return realStylists[0].name;
        });
      }
    }).catch((err) => {
      console.warn('Real-time /api/staff fetch error:', err);
    });

    if (catParam) {
      setCategoryFilter(catParam);
    }

    // Silent background auto-poll every 3 seconds (real-time synchronization with salon panel)
    const queueInterval = setInterval(() => {
      loadLiveQueue(parsedId, true);
    }, 3000);

    return () => clearInterval(queueInterval);
  }, [salonIdParam, serviceIdParam, catParam]);

  const categories = ['All', 'Haircut', 'Fade', 'Beard', 'Combo', 'Spa'];

  const displayHaircuts = haircutStyles.length > 0 ? haircutStyles : (salon.services as any[] || mockHaircutStyles);

  const filteredServices = displayHaircuts.filter((s: any) => {
    // Gender Filter
    if (genderFilter !== 'ALL') {
      const sGender = String(s.gender || 'UNISEX').toUpperCase();
      if (genderFilter === 'MALE' && sGender !== 'MALE') return false;
      if (genderFilter === 'FEMALE' && sGender !== 'FEMALE') return false;
      if (genderFilter === 'UNISEX' && sGender !== 'UNISEX') return false;
    }
    // Category Filter
    if (categoryFilter !== 'All') {
      const catVal = String(s.cat || s.category || '').toLowerCase();
      const nameVal = String(s.name || '').toLowerCase();
      const target = categoryFilter.toLowerCase();
      if (!catVal.includes(target) && !nameVal.includes(target)) {
        return false;
      }
    }
    return true;
  });

  const availableDates = [
    { label: 'Today', sub: 'Sep 8' },
    { label: 'Tomorrow', sub: 'Sep 9' },
    { label: 'Wed', sub: 'Sep 10' },
    { label: 'Thu', sub: 'Sep 11' },
    { label: 'Fri', sub: 'Sep 12' }
  ];

  const timeSlots = {
    Morning: ['10:00 AM', '10:45 AM', '11:30 AM'],
    Afternoon: ['01:00 PM', '02:15 PM', '03:30 PM', '04:15 PM'],
    Evening: ['05:30 PM', '06:15 PM', '07:30 PM']
  };

  // Step 2: Customer Picks That Token & Books Appointment (POST /api/appointments)
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1100)); // realistic gateway simulation

    const generatedTxn = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const chosenToken = timingMode === 'current_token'
      ? formatTokenDisplay(queueInfo?.nextAvailableToken)
      : (scheduledToken.startsWith('#') ? scheduledToken : `#${scheduledToken}`);
    const tokenType = timingMode === 'current_token' ? 'Live Queue Token' : 'Advance Scheduled Slot';

    const matchedStylist = salon.stylists.find((s) => s.name === selectedStylist);
    const staffId = matchedStylist ? matchedStylist.id : 2;

    // POST /api/appointments
    const bookedTicket = await customerService.bookAppointment({
      customerId: currentUser.id,
      serviceId: selectedService ? selectedService.id : 1,
      staffId: staffId,
      appointmentTime: timingMode === 'current_token' ? new Date().toISOString() : `${selectedDate} ${selectedTimeSlot}`,
      appointmentDate: timingMode === 'current_token' ? 'Today' : selectedDate,
      salonId: salon.id,
      selectedToken: chosenToken,
      serviceName: selectedService ? selectedService.name : 'Classic Fade Haircut',
      staffName: selectedStylist,
      price: selectedService ? selectedService.price : 350
    });

    setConfirmationData({
      txnId: generatedTxn,
      token: formatTokenDisplay(bookedTicket.tokenNumber || chosenToken),
      queuePosition: bookedTicket.queuePosition || (queueInfo?.nextQueuePosition ?? 3),
      estimatedWaitMinutes: bookedTicket.estimatedWaitMinutes || (queueInfo?.estimatedWaitMinutesForNext ?? 35),
      tokenType,
      salonName: salon.name,
      salonAddress: salon.address,
      serviceName: selectedService ? selectedService.name : 'Classic Fade Haircut',
      price: selectedService ? selectedService.price : 350,
      stylist: selectedStylist,
      date: timingMode === 'current_token' ? 'Today (Now)' : selectedDate,
      time: timingMode === 'current_token' ? `~${bookedTicket.estimatedWaitMinutes || 35} mins wait` : selectedTimeSlot,
      customerName: customerName || currentUser.name,
      customerPhone: customerPhone || currentUser.phone,
      method: paymentMethod.toUpperCase()
    });

    setIsProcessing(false);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors ${
        isLight ? 'bg-[#fff8f4] text-[#1e1b18]' : 'bg-[#0B0F17] text-slate-100'
      }`}
    >
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Breadcrumb & Salon Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Link
                href="/customer"
                className={`hover:underline ${isLight ? 'text-[#8c4a32]' : 'text-amber-400'}`}
              >
                ← Back to Nearby Salons
              </Link>
              <span className="opacity-40">•</span>
              <span className="opacity-70">Booking Flow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight flex items-center gap-3">
              <span>{salon.name}</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-sans font-semibold border ${
                  isLight
                    ? 'bg-[#faf6f3] border-[#e9e1dc] text-[#6f331d]'
                    : 'bg-slate-900 border-slate-800 text-amber-400'
                }`}
              >
                ★ {salon.rating} ({salon.reviews} reviews)
              </span>
            </h1>
            <p className="text-xs opacity-75 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {salon.address}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
                ● {salon.chairsAvailable} Chairs Active Now
              </span>
            </p>
          </div>

          {/* Stepper Indicator with Connected Progress */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { num: 1, label: 'Haircut' },
              { num: 2, label: 'Timing & Token' },
              { num: 3, label: 'Details' },
              { num: 4, label: 'Payment' }
            ].map((st, idx, arr) => (
              <div key={st.num} className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    if (step > st.num) setStep(st.num as any);
                  }}
                  disabled={step < st.num}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    step === st.num
                      ? isLight
                        ? 'bg-[#6f331d] text-white shadow-md ring-2 ring-[#6f331d]/20'
                        : 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : step > st.num
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100'
                        : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 cursor-pointer'
                      : isLight
                      ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      step > st.num
                        ? 'bg-emerald-500 text-white'
                        : step === st.num
                        ? 'bg-white/20'
                        : 'bg-stone-200 dark:bg-slate-800'
                    }`}
                  >
                    {step > st.num ? '✓' : st.num}
                  </span>
                  <span className="hidden sm:inline">{st.label}</span>
                </button>
                {idx < arr.length - 1 && (
                  <div
                    className={`w-2.5 sm:w-4 h-0.5 rounded-full transition-all ${
                      step > st.num
                        ? 'bg-emerald-500'
                        : isLight
                        ? 'bg-stone-200'
                        : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Screen View */}
        {confirmationData ? (
          <div
            className={`rounded-3xl p-8 sm:p-10 border shadow-2xl text-center max-w-2xl mx-auto ${
              isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <span
              className={`text-xs uppercase tracking-widest font-extrabold px-3.5 py-1.5 rounded-full ${
                isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/60 text-emerald-400'
              }`}
            >
              Booking & Payment Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-3">
              You're In Line at {confirmationData.salonName}!
            </h2>
            <p className="text-xs opacity-75 mt-1">
              Transaction ID: <span className="font-mono font-semibold">{confirmationData.txnId}</span> • Paid via{' '}
              {confirmationData.method}
            </p>

            {/* Prominent Live Token Card */}
            <div
              className={`my-8 p-6 rounded-2xl border ${
                isLight
                  ? 'bg-[#faf6f3] border-[#e9e1dc] shadow-sm'
                  : 'bg-[#0B0F17] border-amber-500/40 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1">
                {confirmationData.tokenType}
              </div>
              <div
                className={`text-5xl sm:text-6xl font-black font-mono my-2 tracking-tight whitespace-nowrap ${
                  isLight ? 'text-[#6f331d]' : 'text-amber-400'
                }`}
              >
                {confirmationData.token}
              </div>

              {/* Queue Position & Estimated Wait Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 my-3">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  Queue Position: #{confirmationData.queuePosition || 3}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Est. Wait: ~{confirmationData.estimatedWaitMinutes || 35} mins
                </span>
              </div>

              <div className="text-sm font-semibold">{confirmationData.serviceName}</div>
              <div className="text-xs opacity-75 mt-1">
                Stylist: <span className="font-bold">{confirmationData.stylist}</span> • Time:{' '}
                <span className="font-bold">{confirmationData.time}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-inherit text-xs flex justify-center items-center gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
                <span>● Status: Confirmed</span>
                <span>•</span>
                <span>🔔 SMS & Push Notification Sent</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/customer"
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs border transition-all ${
                  isLight
                    ? 'border-[#e9e1dc] hover:bg-[#faf6f3] text-[#1e1b18]'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-200'
                }`}
              >
                ← Back to Home & Live Queue
              </Link>
              <Link
                href="/customer/appointments"
                className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs text-white transition-all shadow-md ${
                  isLight
                    ? 'bg-[#6f331d] hover:bg-[#5a2816]'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                View in My Appointments →
              </Link>
            </div>
          </div>
        ) : (
          /* Main Multi-Step Booking Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Active Step Details (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* STEP 1: SELECT TYPE OF HAIRCUT / SERVICE (REAL-TIME BACKEND INTEGRATED) */}
              {step === 1 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
                    isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  {/* Step Header with Real-Time API Status */}
                  <div className="flex flex-col gap-3 pb-5 border-b border-inherit mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {isLiveConnected ? 'Live Salon Catalog' : 'Real-Time Haircut Menu'}
                          </span>
                          <span className="text-[11px] opacity-60">• Branch #{salon.id}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                          Step 1: Select Type of Haircut
                        </h2>
                        <p className="text-xs opacity-75 mt-0.5">
                          Choose your style from {salon.name}’s live real-time service menu.
                        </p>
                      </div>

                      {/* Live Sync / Refresh Action */}
                      <button
                        onClick={() => fetchHaircutsForSalon(salon.id)}
                        disabled={isLoadingHaircuts}
                        className={`self-start sm:self-center px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isLight
                            ? 'border-[#e9e1dc] hover:bg-[#faf6f3] text-[#6f331d]'
                            : 'border-slate-700 hover:bg-slate-800 text-amber-400'
                        } ${isLoadingHaircuts ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Sync real-time haircut catalog from backend server"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHaircuts ? 'animate-spin' : ''}`} />
                        <span>{isLoadingHaircuts ? 'Syncing...' : 'Refresh Live Styles'}</span>
                      </button>
                    </div>

                    {/* Gender Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold opacity-60 mr-1">Filter Gender:</span>
                      {[
                        { id: 'ALL', label: 'All Styles' },
                        { id: 'MALE', label: '👨 Men' },
                        { id: 'FEMALE', label: '👩 Women' },
                        { id: 'UNISEX', label: '✨ Unisex' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setGenderFilter(tab.id as any)}
                          className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            genderFilter === tab.id
                              ? isLight
                                ? 'bg-[#6f331d] text-white shadow-sm ring-2 ring-[#6f331d]/20'
                                : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : isLight
                              ? 'bg-[#faf6f3] text-stone-700 hover:bg-stone-200/70 border border-[#e9e1dc]'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
                      <span className="text-xs font-bold opacity-60 mr-1 shrink-0">Category:</span>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                            categoryFilter === cat
                              ? isLight
                                ? 'bg-[#6f331d] text-white font-bold shadow-sm'
                                : 'bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold'
                              : isLight
                              ? 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200/60'
                              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Haircut Services List */}
                  {isLoadingHaircuts ? (
                    /* Loading Skeleton */
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border animate-pulse flex items-center justify-between gap-4 ${
                            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-400/20 shrink-0" />
                            <div className="space-y-2">
                              <div className="h-4 w-40 bg-slate-400/20 rounded" />
                              <div className="h-3 w-64 bg-slate-400/15 rounded" />
                            </div>
                          </div>
                          <div className="h-6 w-16 bg-slate-400/20 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="text-3xl">✂️</div>
                      <div className="text-sm font-bold">No haircut styles found for this filter</div>
                      <p className="text-xs opacity-60 max-w-sm mx-auto">
                        Try switching to "All Styles" or resetting your category filter to browse the full salon catalog.
                      </p>
                      <button
                        onClick={() => {
                          setGenderFilter('ALL');
                          setCategoryFilter('All');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isLight
                            ? 'border-[#e9e1dc] text-[#6f331d] hover:bg-[#faf6f3]'
                            : 'border-slate-700 text-amber-400 hover:bg-slate-800'
                        }`}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredServices.map((service: any) => {
                        const isSelected = selectedService && selectedService.id === service.id;
                        const durationMins = service.durationMinutes || service.duration || 30;
                        const sGender = String(service.gender || 'UNISEX').toUpperCase();

                        return (
                          <div
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                              isSelected
                                ? isLight
                                  ? 'bg-white border-[#6f331d] ring-2 ring-[#6f331d]/15 shadow-md'
                                  : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                                : isLight
                                ? 'border-[#e9e1dc] hover:border-[#6f331d]/30 bg-white hover:shadow-sm'
                                : 'border-slate-800/80 hover:border-slate-700 bg-[#0B0F17]/40 hover:bg-[#121826]/80'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                              {/* Selection Indicator Checkbox */}
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-1 sm:mt-0 transition-all ${
                                  isSelected
                                    ? isLight
                                      ? 'bg-[#6f331d] text-white border-[#6f331d]'
                                      : 'bg-amber-500 text-slate-950 border-amber-500'
                                    : 'border-stone-300 dark:border-slate-600 text-transparent'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>

                              {/* Haircut Image Thumbnail */}
                              {service.imageUrl && (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-inherit bg-slate-800/40 shadow-sm relative">
                                  <img
                                    src={service.imageUrl}
                                    alt={service.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e: any) => {
                                      e.currentTarget.src =
                                        sGender === 'FEMALE'
                                          ? 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500'
                                          : 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500';
                                    }}
                                  />
                                </div>
                              )}

                              {/* Haircut Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-bold text-sm sm:text-base tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {service.name}
                                  </h3>
                                  
                                  {/* Gender Pill Badge */}
                                  <span
                                    className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                                      sGender === 'FEMALE'
                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                        : sGender === 'MALE'
                                        ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    }`}
                                  >
                                    {sGender}
                                  </span>

                                  {service.cat && service.cat !== sGender && (
                                    <span
                                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                        isLight ? 'bg-[#faf6f3] text-[#6f331d] border-[#e9e1dc]' : 'bg-slate-800 text-slate-300 border-slate-700'
                                      }`}
                                    >
                                      {service.cat}
                                    </span>
                                  )}
                                </div>

                                {service.description && (
                                  <p className="text-xs opacity-75 mt-1 line-clamp-2 leading-relaxed">
                                    {service.description}
                                  </p>
                                )}

                                <div className="text-xs opacity-60 mt-1.5 flex items-center gap-2">
                                  <span>⏱ {durationMins} mins</span>
                                  <span>•</span>
                                  <span>Includes precision consultation & styling</span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Selection Callout */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-inherit shrink-0">
                              <div
                                className={`text-lg sm:text-xl font-black font-serif ${
                                  isLight ? 'text-[#6f331d]' : 'text-amber-400'
                                }`}
                              >
                                ₹{service.price}
                              </div>
                              <span className="text-[10px] opacity-60">Inclusive of taxes</span>
                              <span
                                className={`mt-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                                  isSelected
                                    ? isLight
                                      ? 'bg-[#6f331d] text-white shadow-sm'
                                      : 'bg-amber-500 text-slate-950 font-black'
                                    : isLight
                                    ? 'bg-stone-100 text-stone-600 border border-stone-200 group-hover:border-[#6f331d]/30'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {isSelected ? 'Selected ✓' : 'Select Style'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 1 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs opacity-70">
                      {selectedService ? (
                        <span>
                          Selected: <strong className="text-amber-600 dark:text-amber-400 font-bold">{selectedService.name}</strong> • <span className="font-serif font-bold text-stone-900 dark:text-white">₹{selectedService.price}</span>
                        </span>
                      ) : (
                        <span>Please select a haircut style above to continue</span>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                        selectedService
                          ? isLight
                            ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white shadow-[#6f331d]/20'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'opacity-40 cursor-not-allowed bg-slate-500 text-white'
                      }`}
                    >
                      Continue to Timing & Token Selection →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TIMING & QUEUE ACCESS (CLEAN LUXURY REDESIGN) */}
              {step === 2 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
                    isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  {/* Step Header */}
                  <div className="pb-5 border-b border-inherit mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        Step 2 of 4 • Timing & Live Queue
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Live Sync (3s)
                        </span>
                        <button
                          onClick={() => loadLiveQueue(salon.id, false)}
                          disabled={isLoadingQueue}
                          className={`text-[11px] font-bold p-1.5 rounded-lg border flex items-center transition-all cursor-pointer ${
                            isLight
                              ? 'border-[#e9e1dc] bg-white text-[#6f331d] hover:bg-[#faf6f3]'
                              : 'border-slate-700 bg-slate-900 text-amber-400 hover:bg-slate-800'
                          }`}
                          title="Refresh live queue status"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                      How would you like to visit {salon.name}?
                    </h2>
                    <p className="text-xs opacity-75 mt-0.5">
                      Join today's live queue with real-time updates, or reserve a scheduled time slot.
                    </p>
                  </div>

                  {/* Segmented Mode Selector */}
                  <div
                    className={`p-1.5 rounded-2xl border transition-all mb-6 ${
                      isLight
                        ? 'bg-stone-100/90 border-stone-200/90 shadow-inner'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTimingMode('current_token')}
                        className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          timingMode === 'current_token'
                            ? isLight
                              ? 'bg-white text-[#6f331d] shadow-sm ring-1 ring-stone-900/5'
                              : 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : isLight
                            ? 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current text-amber-500 shrink-0" />
                        <span className="whitespace-nowrap">Join Live Queue (Walk-In)</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shrink-0 shadow-xs">
                          LIVE
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTimingMode('advance_slot')}
                        className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          timingMode === 'advance_slot'
                            ? isLight
                              ? 'bg-white text-[#6f331d] shadow-sm ring-1 ring-stone-900/5'
                              : 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : isLight
                            ? 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="whitespace-nowrap">Schedule for Later</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                            isLight ? 'bg-stone-200/80 text-stone-700' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          RESERVE
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* OPTION 1: LIVE WALK-IN QUEUE */}
                  {timingMode === 'current_token' && (
                    <div className="space-y-5">
                      {/* 3 Live Key Status Metric Cards (Now Serving, Next Available, Estimated Wait) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card 1: Now Serving */}
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[165px] ${
                            isLight
                              ? 'bg-white border-stone-200/90 shadow-xs'
                              : 'bg-slate-900 border-slate-800 shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                              <Scissors className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>Now Serving (Ongoing)</span>
                            </div>

                            <div className="flex items-baseline justify-between gap-2 mt-1">
                              <div className="text-4xl font-mono font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                                {formatTokenDisplay(queueInfo?.ongoingToken || '6')}
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                                Chair 1 • Active
                              </span>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-slate-800/80">
                            <div className="text-xs font-bold text-stone-900 dark:text-white truncate">
                              {queueInfo?.ongoingCustomerName || 'Current Guest'}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                              <span className="truncate">Stylist: {queueInfo?.ongoingStylistName || 'Alex Rivera'}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                In Chair
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Next Available Token (HERO) */}
                        <div
                          className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[165px] relative overflow-hidden ${
                            isLight
                              ? 'bg-gradient-to-b from-[#faf6f3] to-white border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                              : 'bg-gradient-to-b from-[#182030] to-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2">
                              <Ticket className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Next Available Token</span>
                            </div>

                            <div className="flex items-baseline justify-between gap-2 mt-1">
                              <div
                                className={`text-4xl font-mono font-black tracking-tight ${
                                  isLight ? 'text-[#6f331d]' : 'text-amber-400'
                                }`}
                              >
                                {formatTokenDisplay(queueInfo?.nextAvailableToken || '11')}
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 shadow-xs shrink-0">
                                ★ Your Pass
                              </span>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-amber-200/60 dark:border-amber-500/20">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                              <span>Position #{queueInfo?.nextQueuePosition || 5} in queue</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Live Sync
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-800/80 dark:text-amber-400/80 truncate mt-0.5">
                              Sequential floor counter
                            </div>
                          </div>
                        </div>

                        {/* Card 3: Estimated Wait Time */}
                        <div
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[165px] ${
                            isLight
                              ? 'bg-white border-stone-200/90 shadow-xs'
                              : 'bg-slate-900 border-slate-800 shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-slate-300 mb-2">
                              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Estimated Wait Time</span>
                            </div>

                            <div className="flex items-baseline justify-between gap-2 mt-1">
                              <div className="text-4xl font-mono font-bold tracking-tight text-stone-900 dark:text-white flex items-baseline gap-1">
                                <span>~{queueInfo?.estimatedWaitMinutesForNext ?? 25}</span>
                                <span className="text-sm font-sans font-semibold text-stone-400 dark:text-slate-400">mins</span>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase shrink-0 border ${
                                  isLight
                                    ? 'bg-stone-100 text-stone-600 border-stone-200/80'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                Real-Time
                              </span>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-slate-200">
                              <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{queueInfo?.totalWaiting ?? 4} clients ahead of you</span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-slate-400 truncate mt-0.5">
                              Arrive ~5 mins before your turn
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prominent Callout Banner */}
                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isLight
                            ? 'bg-amber-50/70 border-amber-200/80 text-[#6f331d]'
                            : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {formatTokenDisplay(queueInfo?.nextAvailableToken || '7')}
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                              <span>Guaranteed Sequential Token</span>
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 normal-case">Shared Floor Counter</span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-slate-300 mt-0.5 leading-snug">
                              Book now to secure <strong>Token {formatTokenDisplay(queueInfo?.nextAvailableToken || '7')}</strong>. Both salon desk walk-ins and online bookings pull strictly in order.
                            </p>
                          </div>
                        </div>
                        <div className="sm:self-center shrink-0">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" /> No Waiting Outside
                          </span>
                        </div>
                      </div>

                      {/* Live Queue Progression Step Visualizer */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border ${
                          isLight ? 'bg-white border-stone-200/90 shadow-xs' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 text-[11px] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5 text-stone-700 dark:text-slate-300">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            Live Queue Sequence Tracker
                          </span>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Current: {formatTokenDisplay(queueInfo?.ongoingToken || '3')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                          {/* Serving */}
                          <div
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 ${
                              isLight
                                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                                : 'bg-emerald-950/40 border-emerald-800 text-emerald-100'
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-xs shadow-2xs">
                              {formatTokenDisplay(queueInfo?.ongoingToken || '3')}
                            </span>
                            <div className="text-left">
                              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                In Chair ({queueInfo?.ongoingCustomerName ? queueInfo.ongoingCustomerName.split(' ')[0] : 'Guest'})
                              </div>
                              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400">Now Cutting</div>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 shrink-0" />

                          {/* Waiting Queue Items or fallback */}
                          {queueInfo?.waitingQueue && queueInfo.waitingQueue.length > 0 ? (
                            queueInfo.waitingQueue.slice(0, 6).map((w, i) => (
                              <div key={w.queueId || i} className="flex items-center gap-2 shrink-0">
                                <div
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 ${
                                    isLight
                                      ? 'bg-stone-50 border-stone-200 text-stone-800'
                                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                                      isLight ? 'bg-stone-200/90 text-stone-800' : 'bg-slate-700 text-slate-200'
                                    }`}
                                  >
                                    {formatTokenDisplay(w.tokenNumber || String(i + 4))}
                                  </span>
                                  <div className="text-left">
                                    <div className="text-xs font-medium text-stone-800 dark:text-slate-200">
                                      Waiting ({w.customerName ? w.customerName.split(' ')[0] : `Guest ${i + 1}`})
                                    </div>
                                    <div className="text-[10px] text-stone-400 dark:text-slate-400">
                                      ~{w.estimatedWaitMinutes || (i + 1) * 10}m
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 shrink-0" />
                              </div>
                            ))
                          ) : (
                            <>
                              <div
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 ${
                                  isLight
                                    ? 'bg-stone-50 border-stone-200 text-stone-800'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                                }`}
                              >
                                <span
                                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                                    isLight ? 'bg-stone-200/90 text-stone-800' : 'bg-slate-700 text-slate-200'
                                  }`}
                                >
                                  #7
                                </span>
                                <div className="text-left">
                                  <div className="text-xs font-medium text-stone-800 dark:text-slate-200">Waiting (Amit)</div>
                                  <div className="text-[10px] text-stone-400 dark:text-slate-400">~10m</div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 shrink-0" />
                              <div
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 ${
                                  isLight
                                    ? 'bg-stone-50 border-stone-200 text-stone-800'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                                }`}
                              >
                                <span
                                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                                    isLight ? 'bg-stone-200/90 text-stone-800' : 'bg-slate-700 text-slate-200'
                                  }`}
                                >
                                  #8
                                </span>
                                <div className="text-left">
                                  <div className="text-xs font-medium text-stone-800 dark:text-slate-200">Waiting (Sneha)</div>
                                  <div className="text-[10px] text-stone-400 dark:text-slate-400">~20m</div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 shrink-0" />
                            </>
                          )}

                          {/* Your Target Pass Token */}
                          <div
                            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 shrink-0 shadow-xs ring-2 ${
                              isLight
                                ? 'bg-amber-50 border-amber-500/80 text-amber-950 ring-amber-500/15'
                                : 'bg-amber-950/40 border-amber-500 text-amber-100 ring-amber-500/20'
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-2xs">
                              ★ {formatTokenDisplay(queueInfo?.nextAvailableToken || '7')}
                            </span>
                            <div className="text-left">
                              <div className="text-xs font-black text-amber-800 dark:text-amber-300">
                                Your Spot
                              </div>
                              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Next Bookable</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stylist Selector for Live Queue */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div>
                            <label className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 text-stone-900 dark:text-white">
                              <Scissors className="w-3.5 h-3.5 text-amber-500" /> Choose Stylist for Your Turn
                            </label>
                            <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                              Select your preferred specialist for your token.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            ● {salon.stylists.length} Active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {salon.stylists.map((st: any) => {
                            const isStylistSelected = selectedStylist === st.name;
                            const initials = st.name ? st.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'ST';

                            return (
                              <div
                                key={st.id}
                                onClick={() => setSelectedStylist(st.name)}
                                className={`group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                                  isStylistSelected
                                    ? isLight
                                      ? 'bg-[#6f331d]/5 border-[#6f331d] shadow-sm ring-2 ring-[#6f331d]/20 -translate-y-0.5'
                                      : 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/25 -translate-y-0.5'
                                    : isLight
                                    ? 'bg-white border-stone-200/90 hover:border-[#6f331d]/40 hover:shadow-xs'
                                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="relative shrink-0">
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tracking-wider transition-colors ${
                                          isStylistSelected
                                            ? isLight
                                              ? 'bg-[#6f331d] text-white'
                                              : 'bg-amber-500 text-slate-950 font-black'
                                            : isLight
                                            ? 'bg-stone-100 text-stone-700 border border-stone-200 group-hover:bg-amber-50 group-hover:text-amber-900'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 group-hover:bg-slate-700'
                                        }`}
                                      >
                                        {initials}
                                      </div>
                                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                    </div>

                                    <div className="min-w-0">
                                      <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                                        {st.name}
                                      </div>
                                      <div className="text-[10px] text-stone-500 dark:text-slate-400 truncate">
                                        {st.role || 'Hair Stylist'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center">
                                    {isStylistSelected ? (
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                          isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950 font-black'
                                        }`}
                                      >
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </span>
                                    ) : (
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-0.5 ${
                                          isLight ? 'bg-stone-100 text-stone-600' : 'bg-slate-800 text-slate-300'
                                        }`}
                                      >
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {st.rating || 4.9}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-stone-100 dark:border-slate-800/80 mt-1">
                                  <span className="text-stone-500 dark:text-slate-400 font-medium truncate max-w-[110px]">
                                    {st.specialties?.[0] ? `#${st.specialties[0]}` : (st.experience || 'Master Stylist')}
                                  </span>
                                  <span
                                    className={`font-semibold flex items-center gap-1 text-[10px] ${
                                      isStylistSelected
                                        ? isLight
                                          ? 'text-[#6f331d] font-bold'
                                          : 'text-amber-400 font-bold'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${isStylistSelected ? (isLight ? 'bg-[#6f331d]' : 'bg-amber-400') : 'bg-emerald-500 animate-pulse'}`} />
                                    {isStylistSelected ? 'Assigned' : 'Active'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OPTION 2: ADVANCE DAY & TIME SLOT SELECTION */}
                  {timingMode === 'advance_slot' && (
                    <div className="space-y-6">
                      {/* Day Selection */}
                      <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider mb-2.5 opacity-80">
                          1. Select Date
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {availableDates.map((d) => {
                            const isDateSelected = selectedDate === d.label;
                            return (
                              <button
                                key={d.label}
                                onClick={() => setSelectedDate(d.label)}
                                className={`py-3.5 px-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                                  isDateSelected
                                    ? isLight
                                      ? 'bg-[#6f331d] text-white border-[#6f331d] shadow-md'
                                      : 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                                    : isLight
                                    ? 'bg-white border-[#e9e1dc] hover:border-[#6f331d]/30 text-[#1e1b18] shadow-sm'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                }`}
                              >
                                <div className="text-xs font-extrabold">{d.label}</div>
                                <div className="text-[11px] opacity-75 mt-0.5">{d.sub}</div>
                                <span className={`inline-block mt-1.5 text-[9px] px-2 py-0.2 rounded-full font-bold ${
                                  isDateSelected
                                    ? isLight ? 'bg-white/20 text-white' : 'bg-slate-950/20 text-slate-950'
                                    : 'opacity-50'
                                }`}>
                                  Available
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slot Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <label className="text-xs uppercase font-extrabold tracking-wider opacity-80">
                            2. Select Preferred Time Slot
                          </label>
                          <span className="text-[11px] opacity-60">Slots available every 45 mins</span>
                        </div>

                        <div className="space-y-4">
                          {Object.entries(timeSlots).map(([period, slots]) => (
                            <div key={period} className={`p-4 rounded-2xl border ${isLight ? 'bg-[#faf6f3] border-[#e9e1dc]' : 'bg-slate-900/60 border-slate-800'}`}>
                              <span className="text-[11px] uppercase font-bold opacity-70 tracking-wider block mb-2.5">
                                {period}
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {slots.map((slot) => {
                                  const isSlotSelected = selectedTimeSlot === slot;
                                  return (
                                    <button
                                      key={slot}
                                      onClick={() => setSelectedTimeSlot(slot)}
                                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                        isSlotSelected
                                          ? isLight
                                            ? 'bg-[#6f331d] text-white border-[#6f331d] shadow-sm'
                                            : 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                                          : isLight
                                          ? 'bg-white border-[#e9e1dc] hover:border-[#6f331d]/30 text-[#1e1b18]'
                                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                                      }`}
                                    >
                                      {isSlotSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                      <span>{slot}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pre-allocated Advance Token Card */}
                      <div
                        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                          isLight ? 'bg-white border-[#e9e1dc] shadow-sm' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400">
                            Advance Slot Token Pre-Allocation
                          </span>
                          <div className="text-base font-bold mt-0.5">
                            Reserved Pass Token: <span className="font-mono text-amber-600 dark:text-amber-400 font-black">{scheduledToken}</span>
                          </div>
                          <p className="text-xs opacity-75 mt-0.5">
                            Guaranteed priority salon chair window for {selectedDate} at {selectedTimeSlot}.
                          </p>
                        </div>
                        <div
                          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-xl shadow-sm shrink-0 ${
                            isLight
                              ? 'bg-[#faf6f3] border-[#e9e1dc] text-[#6f331d]'
                              : 'bg-[#0B0F17] border-amber-500/40 text-amber-400'
                          }`}
                        >
                          S14
                        </div>
                      </div>

                      {/* Stylist Selection */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div>
                            <label className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 text-stone-900 dark:text-white">
                              <Scissors className="w-3.5 h-3.5 text-amber-500" /> 3. Select Preferred Stylist
                            </label>
                            <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                              Book in advance with your preferred stylist for your reserved time slot.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            ● Guaranteed Slot
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {salon.stylists.map((st: any) => {
                            const isStylistSelected = selectedStylist === st.name;
                            const initials = st.name ? st.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'ST';

                            return (
                              <div
                                key={st.id}
                                onClick={() => setSelectedStylist(st.name)}
                                className={`group relative rounded-xl border p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                                  isStylistSelected
                                    ? isLight
                                      ? 'bg-[#6f331d]/5 border-[#6f331d] shadow-sm ring-2 ring-[#6f331d]/20 -translate-y-0.5'
                                      : 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/25 -translate-y-0.5'
                                    : isLight
                                    ? 'bg-white border-stone-200/90 hover:border-[#6f331d]/40 hover:shadow-xs'
                                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="relative shrink-0">
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tracking-wider transition-colors ${
                                          isStylistSelected
                                            ? isLight
                                              ? 'bg-[#6f331d] text-white'
                                              : 'bg-amber-500 text-slate-950 font-black'
                                            : isLight
                                            ? 'bg-stone-100 text-stone-700 border border-stone-200 group-hover:bg-amber-50 group-hover:text-amber-900'
                                            : 'bg-slate-800 text-slate-200 border border-slate-700 group-hover:bg-slate-700'
                                        }`}
                                      >
                                        {initials}
                                      </div>
                                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                    </div>

                                    <div className="min-w-0">
                                      <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate">
                                        {st.name}
                                      </div>
                                      <div className="text-[10px] text-stone-500 dark:text-slate-400 truncate">
                                        {st.role || 'Hair Stylist'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center">
                                    {isStylistSelected ? (
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                                          isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950 font-black'
                                        }`}
                                      >
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </span>
                                    ) : (
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-0.5 ${
                                          isLight ? 'bg-stone-100 text-stone-600' : 'bg-slate-800 text-slate-300'
                                        }`}
                                      >
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {st.rating || 4.9}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-stone-100 dark:border-slate-800/80 mt-1">
                                  <span className="text-stone-500 dark:text-slate-400 font-medium truncate max-w-[110px]">
                                    {st.specialties?.[0] ? `#${st.specialties[0]}` : (st.experience || 'Master Stylist')}
                                  </span>
                                  <span
                                    className={`font-semibold flex items-center gap-1 text-[10px] ${
                                      isStylistSelected
                                        ? isLight
                                          ? 'text-[#6f331d] font-bold'
                                          : 'text-amber-400 font-bold'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${isStylistSelected ? (isLight ? 'bg-[#6f331d]' : 'bg-amber-400') : 'bg-emerald-500 animate-pulse'}`} />
                                    {isStylistSelected ? 'Reserved' : 'Available'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2 Bottom Actions Bar & Summary */}
                  <div
                    className={`pt-6 mt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      isLight ? 'border-[#e9e1dc]' : 'border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => setStep(1)}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        isLight
                          ? 'border-[#e9e1dc] text-[#53433e] hover:bg-[#faf6f3]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Haircuts
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setStep(3)}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          isLight
                            ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white shadow-[#6f331d]/20'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        {timingMode === 'current_token' ? (
                          <>
                            <span>Join Live Queue with Token {formatTokenDisplay(queueInfo?.nextAvailableToken || '7')} →</span>
                          </>
                        ) : (
                          <>
                            <span>Proceed with Slot ({selectedTimeSlot}) →</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CUSTOMER DETAILS */}
              {step === 3 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
                    isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="pb-4 border-b border-inherit mb-6">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Step 3: Confirm Customer Details</h2>
                    <p className="text-xs opacity-75 mt-0.5">
                      Enter your contact information for real-time live queue SMS alerts and digital invoice receipts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-extrabold tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-500" /> Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                            isLight
                              ? 'bg-white border-[#e9e1dc] focus:border-[#6f331d] focus:ring-2 focus:ring-[#6f331d]/15 text-[#1e1b18]'
                              : 'bg-slate-900 border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-100'
                          }`}
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-extrabold tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" /> Phone Number (for Live SMS & Queue Token Alerts)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                            isLight
                              ? 'bg-white border-[#e9e1dc] focus:border-[#6f331d] focus:ring-2 focus:ring-[#6f331d]/15 text-[#1e1b18]'
                              : 'bg-slate-900 border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-100'
                          }`}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <span className="text-[11px] opacity-60 mt-1 block">
                        We send SMS notifications when 1-2 customers remain ahead of you in line.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-extrabold tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-500" /> Styling Instructions or Preferences (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. Skin fade with textured scissor top, beard edging..."
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                          isLight
                            ? 'bg-white border-[#e9e1dc] focus:border-[#6f331d] focus:ring-2 focus:ring-[#6f331d]/15 text-[#1e1b18]'
                            : 'bg-slate-900 border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-100'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Step 3 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex items-center justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className={`px-6 py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        isLight
                          ? 'border-[#e9e1dc] text-[#53433e] hover:bg-[#faf6f3]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Timing
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className={`px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                        isLight
                          ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white shadow-[#6f331d]/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DUMMY MOCK PAYMENT */}
              {step === 4 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-sm ${
                    isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="pb-4 border-b border-inherit mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Step 4: Mock Payment & Confirmation</h2>
                      <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Demo Sandbox
                      </span>
                    </div>
                    <p className="text-xs opacity-75 mt-0.5">
                      Select your preferred dummy payment method. No real charges will be made.
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3 mb-6">
                    {[
                      {
                        id: 'upi',
                        name: 'Instant UPI / QR Code (Mock)',
                        desc: 'Simulated 1-click test UPI gateway (Google Pay, PhonePe, Paytm)',
                        icon: Smartphone,
                        iconColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      },
                      {
                        id: 'card',
                        name: 'Test Credit / Debit Card',
                        desc: 'Simulated test card authorization (Visa, Mastercard, RuPay)',
                        icon: CreditCard,
                        iconColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      },
                      {
                        id: 'counter',
                        name: 'Pay at Salon Counter',
                        desc: 'Reserve queue token now and settle at salon reception upon arrival',
                        icon: Banknote,
                        iconColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }
                    ].map((pm) => {
                      const isSelected = paymentMethod === pm.id;
                      const IconComp = pm.icon;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                            isSelected
                              ? isLight
                                ? 'bg-white border-[#6f331d] ring-2 ring-[#6f331d]/15 shadow-md'
                                : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                              : isLight
                              ? 'bg-white border-[#e9e1dc] hover:border-[#6f331d]/30 shadow-sm'
                              : 'bg-[#0B0F17]/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pm.iconColor}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs sm:text-sm">{pm.name}</div>
                              <div className="text-[11px] opacity-70">{pm.desc}</div>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                              isSelected
                                ? isLight
                                  ? 'bg-[#6f331d] text-white border-[#6f331d]'
                                  : 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'border-stone-300 dark:border-slate-600 text-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 4 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex items-center justify-between">
                    <button
                      onClick={() => setStep(3)}
                      disabled={isProcessing}
                      className={`px-6 py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        isLight
                          ? 'border-[#e9e1dc] text-[#53433e] hover:bg-[#faf6f3]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Details
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isProcessing}
                      className={`px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                        isProcessing
                          ? 'opacity-70 cursor-wait bg-slate-600 text-white'
                          : isLight
                          ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white shadow-[#6f331d]/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-500/20'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Processing Mock Payment...</span>
                        </>
                      ) : (
                        <span>
                          Pay ₹{selectedService ? selectedService.price : 350} & Confirm Booking →
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Live Booking Summary Card (4 Cols) */}
            <div className="lg:col-span-4">
              <div
                className={`sticky top-28 rounded-3xl p-6 border shadow-xl ${
                  isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-4">
                  <span className="text-xs uppercase font-bold tracking-wider opacity-60">
                    Booking Summary
                  </span>
                  <span
                    className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                      timingMode === 'current_token'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : isLight
                        ? 'bg-[#faf6f3] text-[#6f331d] border border-[#e9e1dc]'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {timingMode === 'current_token' ? '⚡ Live Queue' : '📅 Scheduled Slot'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Salon Info */}
                  <div>
                    <div className="font-bold text-sm font-serif">{salon.name}</div>
                    <div className="text-[11px] opacity-70 mt-0.5">{salon.address}</div>
                  </div>

                  {/* Selected Service / Haircut */}
                  <div className="pt-3 border-t border-inherit flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {selectedService?.imageUrl && (
                        <img
                          src={selectedService.imageUrl}
                          alt={selectedService.name}
                          className="w-10 h-10 rounded-lg object-cover border border-inherit shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold truncate text-xs sm:text-sm">
                          {selectedService ? selectedService.name : 'Select a haircut style'}
                        </div>
                        <div className="text-[10px] opacity-60">
                          {selectedService
                            ? `${selectedService.durationMinutes || selectedService.duration || 30} mins • ${
                                selectedService.gender ? `${selectedService.gender} • ` : ''
                              }${selectedService.cat || 'Haircut'}`
                            : '—'}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-bold font-serif shrink-0 ${
                        isLight ? 'text-[#6f331d]' : 'text-amber-400'
                      }`}
                    >
                      ₹{selectedService ? selectedService.price : 0}
                    </div>
                  </div>

                  {/* Timing & Token */}
                  <div className="pt-3 border-t border-inherit">
                    <div className="text-[10px] uppercase tracking-wider opacity-60 font-semibold mb-1">
                      Timing & Token
                    </div>
                    {timingMode === 'current_token' ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                            <span>● Live Token {formatTokenDisplay(queueInfo?.nextAvailableToken || '7')}</span>
                          </div>
                          <div className="text-[10px] opacity-70 font-mono">~{queueInfo?.estimatedWaitMinutesForNext ?? 25} mins estimated wait</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                          Today
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">
                            {selectedDate} at {selectedTimeSlot}
                          </div>
                          <div className="text-[10px] opacity-70">Pre-allocated Token {scheduledToken}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                          Scheduled
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Stylist */}
                  <div className="pt-3 border-t border-inherit flex justify-between items-center">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                        Master Stylist
                      </div>
                      <div className="font-bold">{selectedStylist}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 font-bold">
                      Requested
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="pt-3 border-t border-inherit">
                    <div className="text-[10px] uppercase tracking-wider opacity-60 font-semibold mb-0.5">
                      Guest
                    </div>
                    <div className="font-bold">{customerName}</div>
                    <div className="text-[10px] opacity-70">{customerPhone}</div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="pt-4 border-t border-inherit space-y-1.5">
                    <div className="flex justify-between text-xs opacity-75">
                      <span>Service Fee</span>
                      <span>₹{selectedService ? selectedService.price : 0}</span>
                    </div>
                    <div className="flex justify-between text-xs opacity-75">
                      <span>Live Token Allocation</span>
                      <span className="text-emerald-500 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-xs opacity-75">
                      <span>Platform & Sanitization</span>
                      <span>₹0</span>
                    </div>
                    <div className="pt-2 border-t border-inherit flex justify-between text-sm sm:text-base font-bold">
                      <span>Total Amount</span>
                      <span className={isLight ? 'text-[#6f331d]' : 'text-amber-400'}>
                        ₹{selectedService ? selectedService.price : 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Notice */}
                <div
                  className={`mt-4 p-3 rounded-xl text-[11px] border leading-relaxed ${
                    isLight
                      ? 'bg-[#faf6f3] border-[#e9e1dc] text-[#6f331d]'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  🔒 Free cancellation anytime before token call. 100% money-back guarantee in case of delay.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <ThemeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center text-sm font-sans">
            Loading booking flow...
          </div>
        }
      >
        <BookingContent />
      </Suspense>
    </ThemeProvider>
  );
}
