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
  Check
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

  // Step 1: Live Queue & Next Available Token (GET /api/queue/next-available)
  const loadLiveQueue = async (salonId?: number) => {
    setIsLoadingQueue(true);
    try {
      const data = await customerService.getNextAvailableQueue(salonId || salon.id);
      setQueueInfo(data);
    } catch {
      setQueueInfo(defaultMockQueueInfo);
    } finally {
      setIsLoadingQueue(false);
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

    // Trigger real-time queue status & next available token fetch
    loadLiveQueue(parsedId);

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

    if (catParam) {
      setCategoryFilter(catParam);
    }

    // Auto-poll live queue status every 10 seconds
    const queueInterval = setInterval(() => {
      loadLiveQueue(parsedId);
    }, 10000);

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
      ? (queueInfo?.nextAvailableToken || 'T-003')
      : scheduledToken;
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
      token: bookedTicket.tokenNumber || chosenToken,
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
                className={`text-xs px-2.5 py-1 rounded-full font-sans font-medium border ${
                  isLight
                    ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#6f331d]'
                    : 'bg-slate-900 border-slate-800 text-amber-400'
                }`}
              >
                ★ {salon.rating} ({salon.reviews} reviews)
              </span>
            </h1>
            <p className="text-xs opacity-75 mt-1 flex items-center gap-2">
              <span>📍 {salon.address}</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold font-sans">
                ● {salon.chairsAvailable} Chairs Active Now
              </span>
            </p>
          </div>

          {/* Stepper Indicator Pills */}
          <div className="flex items-center gap-2 text-xs">
            {[
              { num: 1, label: 'Haircut' },
              { num: 2, label: 'Timing & Token' },
              { num: 3, label: 'Details' },
              { num: 4, label: 'Payment' }
            ].map((st) => (
              <div
                key={st.num}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
                  step === st.num
                    ? isLight
                      ? 'bg-[#6f331d] text-white shadow-sm'
                      : 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : step > st.num
                    ? isLight
                      ? 'bg-[#e9e1dc] text-[#6f331d]'
                      : 'bg-slate-800 text-slate-300'
                    : isLight
                    ? 'bg-[#f4ece7] text-[#85736d]'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {step > st.num ? '✓' : st.num}
                </span>
                <span className="hidden md:inline">{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Screen View */}
        {confirmationData ? (
          <div
            className={`rounded-3xl p-8 sm:p-10 border shadow-2xl text-center max-w-2xl mx-auto ${
              isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <span
              className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
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
                  ? 'bg-[#fff8f4] border-[#d9c2ba]'
                  : 'bg-[#0B0F17] border-amber-500/40 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1">
                {confirmationData.tokenType}
              </div>
              <div
                className={`text-5xl font-black font-serif my-2 tracking-tight ${
                  isLight ? 'text-[#6f331d]' : 'text-amber-400'
                }`}
              >
                {confirmationData.token}
              </div>

              {/* Queue Position & Estimated Wait Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 my-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Queue Position: #{confirmationData.queuePosition || 3}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
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
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs border transition-all ${
                  isLight
                    ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#1e1b18]'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-200'
                }`}
              >
                ← Back to Home & Live Queue
              </Link>
              <Link
                href="/customer/appointments"
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md ${
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
                  className={`rounded-3xl p-6 sm:p-8 border shadow-lg ${
                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  {/* Step Header with Real-Time API Status */}
                  <div className="flex flex-col gap-3 pb-5 border-b border-inherit mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shadow-sm">
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
                        className={`self-start sm:self-center px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isLight
                            ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#6f331d]'
                            : 'border-slate-700 hover:bg-slate-800 text-amber-400'
                        } ${isLoadingHaircuts ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Sync real-time haircut catalog from backend server"
                      >
                        <span className={isLoadingHaircuts ? 'animate-spin' : ''}>🔄</span>
                        <span>{isLoadingHaircuts ? 'Syncing...' : 'Refresh Live Styles'}</span>
                      </button>
                    </div>

                    {/* Gender Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold opacity-60 mr-1">Filter Gender:</span>
                      {[
                        { id: 'ALL', label: 'All Styles' },
                        { id: 'MALE', label: '👨 Men (MALE)' },
                        { id: 'FEMALE', label: '👩 Women (FEMALE)' },
                        { id: 'UNISEX', label: '✨ Unisex' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setGenderFilter(tab.id as any)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                            genderFilter === tab.id
                              ? isLight
                                ? 'bg-[#6f331d] text-white shadow-sm'
                                : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : isLight
                              ? 'bg-[#f4ece7] text-[#53433e] hover:bg-[#e9e1dc]'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
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
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                            categoryFilter === cat
                              ? isLight
                                ? 'bg-[#8c4a32] text-white'
                                : 'bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold'
                              : isLight
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isLight
                            ? 'border-[#d9c2ba] text-[#6f331d] hover:bg-[#f4ece7]'
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
                                  ? 'bg-[#fff8f4] border-[#6f331d] ring-2 ring-[#6f331d]/20 shadow-md'
                                  : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                                : isLight
                                ? 'border-[#e9e1dc] hover:border-[#d9c2ba] bg-white hover:shadow-sm'
                                : 'border-slate-800/80 hover:border-slate-700 bg-[#0B0F17]/40 hover:bg-[#121826]/80'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                              {/* Selection Indicator Checkbox */}
                              <div
                                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-1 sm:mt-0 transition-all ${
                                  isSelected
                                    ? isLight
                                      ? 'bg-[#6f331d] text-white border-[#6f331d]'
                                      : 'bg-amber-500 text-slate-950 border-amber-500'
                                    : 'border-slate-400 text-transparent'
                                }`}
                              >
                                ✓
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
                                  <h3 className="font-bold text-sm sm:text-base tracking-tight group-hover:text-amber-500 transition-colors">
                                    {service.name}
                                  </h3>
                                  
                                  {/* Gender Pill Badge */}
                                  <span
                                    className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${
                                      sGender === 'FEMALE'
                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                        : sGender === 'MALE'
                                        ? 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}
                                  >
                                    {sGender}
                                  </span>

                                  {service.cat && service.cat !== sGender && (
                                    <span
                                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                        isLight ? 'bg-[#f4ece7] text-[#6f331d]' : 'bg-slate-800 text-slate-300'
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
                                className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isSelected
                                    ? isLight
                                      ? 'bg-[#6f331d] text-white'
                                      : 'bg-amber-500 text-slate-950 font-black'
                                    : 'opacity-40'
                                }`}
                              >
                                {isSelected ? 'Selected ✓' : 'Click to Select'}
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
                          Selected: <strong className="text-amber-500">{selectedService.name}</strong> (₹{selectedService.price})
                        </span>
                      ) : (
                        <span>Please click a haircut style above to continue</span>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                        selectedService
                          ? isLight
                            ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'opacity-40 cursor-not-allowed bg-slate-500 text-white'
                      }`}
                    >
                      Continue to Timing & Token Selection →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TIMING & QUEUE TOKEN (REVAMPED ULTRA-PROPER UI) */}
              {step === 2 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-xl transition-all ${
                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  {/* Step Header */}
                  <div className="pb-5 border-b border-inherit mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        Step 2 of 4 • Timing & Queue Allocation
                      </span>
                      <span className="text-xs opacity-60 font-medium">
                        Branch #{salon.id} • {salon.name}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                      Select Timing & Queue Access
                    </h2>
                    <p className="text-xs sm:text-sm opacity-75 mt-1">
                      Choose an immediate Live Queue Token with real-time floor updates, or pre-book a scheduled appointment slot.
                    </p>
                  </div>

                  {/* Mode Selector: 2 Prominent Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {/* OPTION 1: LIVE QUEUE TOKEN */}
                    <div
                      onClick={() => setTimingMode('current_token')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                        timingMode === 'current_token'
                          ? isLight
                            ? 'bg-[#fff8f4] border-[#6f331d] shadow-md ring-2 ring-[#6f331d]/20'
                            : 'bg-gradient-to-br from-slate-900 to-[#161f33] border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/25'
                          : isLight
                          ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba] opacity-80 hover:opacity-100'
                          : 'bg-[#0B0F17]/50 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              timingMode === 'current_token'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : isLight
                                ? 'bg-[#f4ece7] text-[#6f331d]'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Zap className="w-5 h-5 fill-current" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm sm:text-base">Current Live Token</h3>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500 text-white animate-pulse">
                                LIVE
                              </span>
                            </div>
                            <span className="text-[11px] opacity-70">Immediate walk-in queue for today</span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            timingMode === 'current_token'
                              ? isLight
                                ? 'bg-[#6f331d] border-[#6f331d] text-white'
                                : 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'border-slate-400 opacity-40'
                          }`}
                        >
                          {timingMode === 'current_token' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div
                        className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                          isLight ? 'border-[#d9c2ba]/60' : 'border-slate-800'
                        }`}
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Next Token: {queueInfo?.nextAvailableToken || 'T-003'}
                        </span>
                        <span className="opacity-75">~{queueInfo?.estimatedWaitMinutesForNext ?? 35} mins wait</span>
                      </div>
                    </div>

                    {/* OPTION 2: ADVANCE APPOINTMENT */}
                    <div
                      onClick={() => setTimingMode('advance_slot')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                        timingMode === 'advance_slot'
                          ? isLight
                            ? 'bg-[#fff8f4] border-[#6f331d] shadow-md ring-2 ring-[#6f331d]/20'
                            : 'bg-gradient-to-br from-slate-900 to-[#161f33] border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/25'
                          : isLight
                          ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba] opacity-80 hover:opacity-100'
                          : 'bg-[#0B0F17]/50 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              timingMode === 'advance_slot'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : isLight
                                ? 'bg-[#f4ece7] text-[#6f331d]'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm sm:text-base">Advance Day & Slot</h3>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  isLight ? 'bg-[#d9c2ba] text-[#53433e]' : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                SCHEDULED
                              </span>
                            </div>
                            <span className="text-[11px] opacity-70">Book a guaranteed time in advance</span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            timingMode === 'advance_slot'
                              ? isLight
                                ? 'bg-[#6f331d] border-[#6f331d] text-white'
                                : 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'border-slate-400 opacity-40'
                          }`}
                        >
                          {timingMode === 'advance_slot' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div
                        className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                          isLight ? 'border-[#d9c2ba]/60' : 'border-slate-800'
                        }`}
                      >
                        <span className="opacity-75">Selected: {selectedDate}</span>
                        <span className="font-bold">{selectedTimeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* SECTION 1: CURRENT LIVE QUEUE TOKEN (REAL-TIME BACKEND INTEGRATED) */}
                  {/* ========================================================================= */}
                  {timingMode === 'current_token' && (
                    <div className="space-y-8">
                      {/* LUXURY DIGITAL TICKET PASS */}
                      <div
                        className={`rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
                          isLight
                            ? 'bg-gradient-to-br from-[#fff8f4] via-[#fdf2eb] to-[#f7e6dc] border-[#d9c2ba]'
                            : 'bg-gradient-to-br from-[#111726] via-[#0E1320] to-[#0A0D15] border-amber-500/40 shadow-amber-500/5'
                        }`}
                      >
                        {/* Ticket Top Ribbon */}
                        <div
                          className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isLight ? 'border-[#d9c2ba]/60 bg-white/50' : 'border-slate-800 bg-slate-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Real-Time Live Queue Counter
                            </span>
                            <span className="text-xs opacity-50">• Indiranagar Floor</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadLiveQueue(salon.id)}
                              disabled={isLoadingQueue}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                                isLight
                                  ? 'border-[#d9c2ba] bg-white text-[#6f331d] hover:bg-[#f4ece7]'
                                  : 'border-slate-700 bg-slate-900 text-amber-400 hover:bg-slate-800'
                              }`}
                              title="Refresh real-time queue status from backend"
                            >
                              <RefreshCw className={`w-3 h-3 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                              <span>{isLoadingQueue ? 'Syncing...' : 'Live Sync'}</span>
                            </button>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              ● Floor Active
                            </span>
                          </div>
                        </div>

                        {/* Main Ticket Pass Body */}
                        <div className="p-6 sm:p-8">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            {/* Left Column: Huge Token & Metrics (7 Cols) */}
                            <div className="lg:col-span-7 space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] uppercase tracking-widest font-black text-amber-500 flex items-center gap-1">
                                  <Ticket className="w-3.5 h-3.5" /> Next Available Token
                                </span>
                                <span className="text-xs opacity-40">•</span>
                                <span className="text-xs font-bold opacity-75">
                                  Position #{queueInfo?.nextQueuePosition || 3}
                                </span>
                              </div>

                              {/* Prominent Glowing Token */}
                              <div className="flex items-baseline gap-4">
                                <div
                                  className={`text-6xl sm:text-7xl font-mono font-black tracking-tight drop-shadow-sm ${
                                    isLight ? 'text-[#6f331d]' : 'text-amber-400'
                                  }`}
                                >
                                  {queueInfo?.nextAvailableToken || 'T-003'}
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                  Ready to Claim
                                </span>
                              </div>

                              {/* Metric Badges */}
                              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                <div
                                  className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                                  }`}
                                >
                                  <Clock className="w-4 h-4 text-amber-500" />
                                  <span>Est. Wait: ~{queueInfo?.estimatedWaitMinutesForNext ?? 35} mins</span>
                                </div>
                                <div
                                  className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                                  }`}
                                >
                                  <Users className="w-4 h-4 text-blue-500" />
                                  <span>{queueInfo?.totalWaiting ?? 2} ahead in line</span>
                                </div>
                              </div>

                              <p className="text-xs opacity-75 leading-relaxed pt-1">
                                💡 Arrive when your turn is called. Live SMS & in-app alerts will notify you as you approach the front of the queue.
                              </p>
                            </div>

                            {/* Right Column: Live Salon Floor Radar (5 Cols) */}
                            <div className="lg:col-span-5">
                              <div
                                className={`p-4 sm:p-5 rounded-2xl border ${
                                  isLight ? 'bg-white/90 border-[#d9c2ba]' : 'bg-slate-950/70 border-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3">
                                  <span className="text-[11px] uppercase font-bold tracking-wider opacity-70 flex items-center gap-1.5">
                                    <Radio className="w-3.5 h-3.5 text-emerald-500" /> Salon Floor Radar
                                  </span>
                                  <span className="text-[10px] font-bold opacity-60">2 in Queue</span>
                                </div>

                                <div className="space-y-2.5 text-xs">
                                  {/* Currently Serving Item */}
                                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-mono font-bold flex items-center justify-center text-xs shadow-sm">
                                        {queueInfo?.ongoingToken || 'T-001'}
                                      </div>
                                      <div>
                                        <div className="font-bold text-xs">{queueInfo?.ongoingCustomerName || 'Rahul Sharma'}</div>
                                        <div className="text-[10px] opacity-70">
                                          Stylist: {queueInfo?.ongoingStylistName || 'Alex Rivera'}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                                      In Chair
                                    </span>
                                  </div>

                                  {/* Waiting Queue Item */}
                                  <div
                                    className={`p-3 rounded-xl border flex items-center justify-between ${
                                      isLight ? 'bg-[#f4ece7] border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-200 font-mono font-bold flex items-center justify-center text-xs">
                                        T-002
                                      </div>
                                      <div>
                                        <div className="font-bold text-xs">Amit Verma</div>
                                        <div className="text-[10px] opacity-70">Beard Trim • ~15m wait</div>
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold opacity-60 uppercase">Waiting</span>
                                  </div>

                                  {/* Next Slot: Customer's Pass */}
                                  <div className="p-2.5 rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-amber-500 font-bold">★ Your Next Token</span>
                                    </div>
                                    <span className="font-mono font-bold text-amber-500 text-xs">
                                      {queueInfo?.nextAvailableToken || 'T-003'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* STYLIST PICKER FOR LIVE QUEUE */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs uppercase font-extrabold tracking-wider opacity-80 flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-amber-500" /> Choose Your Stylist for This Token
                          </label>
                          <span className="text-[11px] opacity-60">All stylists active on floor</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {salon.stylists.map((st) => {
                            const isStylistSelected = selectedStylist === st.name;
                            return (
                              <div
                                key={st.id}
                                onClick={() => setSelectedStylist(st.name)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                  isStylistSelected
                                    ? isLight
                                      ? 'bg-[#fff8f4] border-[#6f331d] shadow-md ring-2 ring-[#6f331d]/20'
                                      : 'bg-slate-900 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                                    : isLight
                                    ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba]'
                                    : 'bg-[#0B0F17]/40 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                        isStylistSelected
                                          ? 'bg-amber-500 text-slate-950'
                                          : isLight
                                          ? 'bg-[#f4ece7] text-[#6f331d]'
                                          : 'bg-slate-800 text-slate-300'
                                      }`}
                                    >
                                      {st.name.split(' ').map((n) => n[0]).join('')}
                                    </div>
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-amber-500" /> {st.rating}
                                    </span>
                                  </div>

                                  <div className="font-bold text-sm">{st.name}</div>
                                  <div className="text-[11px] opacity-60 mt-0.5">{st.role}</div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-inherit flex items-center justify-between text-[10px]">
                                  <span className="text-emerald-500 font-bold">● Active Now</span>
                                  {isStylistSelected && (
                                    <span className="font-bold text-amber-500 flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> Selected
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* SECTION 2: ADVANCE DAY & TIME SLOT SELECTION */}
                  {/* ========================================================================= */}
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
                                    ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba] text-[#1e1b18]'
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
                            <div key={period} className={`p-4 rounded-2xl border ${isLight ? 'bg-[#fff8f4] border-[#d9c2ba]' : 'bg-slate-900/60 border-slate-800'}`}>
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
                                          ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba] text-[#1e1b18]'
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
                          isLight ? 'bg-[#fff8f4] border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500">
                            Advance Slot Token Pre-Allocation
                          </span>
                          <div className="text-base font-bold mt-0.5">
                            Reserved Pass Token: <span className="font-mono text-amber-500">{scheduledToken}</span>
                          </div>
                          <p className="text-xs opacity-75 mt-0.5">
                            Guaranteed priority salon chair window for {selectedDate} at {selectedTimeSlot}.
                          </p>
                        </div>
                        <div
                          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-xl shadow-sm shrink-0 ${
                            isLight
                              ? 'bg-white border-[#d9c2ba] text-[#6f331d]'
                              : 'bg-[#0B0F17] border-amber-500/40 text-amber-400'
                          }`}
                        >
                          S14
                        </div>
                      </div>

                      {/* Stylist Selection for Advance Slot */}
                      <div>
                        <label className="block text-xs uppercase font-extrabold tracking-wider mb-2.5 opacity-80">
                          3. Select Preferred Stylist
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {salon.stylists.map((st) => {
                            const isStylistSelected = selectedStylist === st.name;
                            return (
                              <div
                                key={st.id}
                                onClick={() => setSelectedStylist(st.name)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                  isStylistSelected
                                    ? isLight
                                      ? 'bg-[#fff8f4] border-[#6f331d] shadow-md ring-2 ring-[#6f331d]/20'
                                      : 'bg-slate-900 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                                    : isLight
                                    ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba]'
                                    : 'bg-[#0B0F17]/40 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                        isStylistSelected
                                          ? 'bg-amber-500 text-slate-950'
                                          : isLight
                                          ? 'bg-[#f4ece7] text-[#6f331d]'
                                          : 'bg-slate-800 text-slate-300'
                                      }`}
                                    >
                                      {st.name.split(' ').map((n) => n[0]).join('')}
                                    </div>
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-amber-500" /> {st.rating}
                                    </span>
                                  </div>

                                  <div className="font-bold text-sm">{st.name}</div>
                                  <div className="text-[11px] opacity-60 mt-0.5">{st.role}</div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-inherit flex items-center justify-between text-[10px]">
                                  <span className="text-emerald-500 font-bold">● Guaranteed Slot</span>
                                  {isStylistSelected && (
                                    <span className="font-bold text-amber-500 flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> Selected
                                    </span>
                                  )}
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
                      isLight ? 'border-[#d9c2ba]' : 'border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => setStep(1)}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs border transition-all ${
                        isLight
                          ? 'border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Haircuts
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setStep(3)}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                          isLight
                            ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white shadow-[#6f331d]/20'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        {timingMode === 'current_token' ? (
                          <>
                            <span>Claim & Book Token {queueInfo?.nextAvailableToken || 'T-003'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Proceed to Details ({selectedTimeSlot})</span>
                            <ArrowRight className="w-4 h-4" />
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
                  className={`rounded-3xl p-6 sm:p-8 border shadow-lg ${
                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="pb-4 border-b border-inherit mb-6">
                    <h2 className="text-xl font-serif font-bold">Step 3: Confirm Customer Details</h2>
                    <p className="text-xs opacity-75 mt-0.5">
                      Enter the recipient name and contact details for live queue alerts and digital receipts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider mb-1.5 opacity-80">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                          isLight
                            ? 'bg-white border-[#d9c2ba] focus:border-[#6f331d] text-[#1e1b18]'
                            : 'bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-100'
                        }`}
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider mb-1.5 opacity-80">
                        Phone Number (for Live SMS & Queue Token Alerts)
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                          isLight
                            ? 'bg-white border-[#d9c2ba] focus:border-[#6f331d] text-[#1e1b18]'
                            : 'bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-100'
                        }`}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold tracking-wider mb-1.5 opacity-80">
                        Styling Instructions or Preferences (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. Skin fade with textured top, scissor trim only on sides..."
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                          isLight
                            ? 'bg-white border-[#d9c2ba] focus:border-[#6f331d] text-[#1e1b18]'
                            : 'bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-100'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Step 3 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex items-center justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        isLight
                          ? 'border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Timing
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                        isLight
                          ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
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
                  className={`rounded-3xl p-6 sm:p-8 border shadow-lg ${
                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="pb-4 border-b border-inherit mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-serif font-bold">Step 4: Mock Payment & Confirmation</h2>
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Demo Sandbox
                      </span>
                    </div>
                    <p className="text-xs opacity-75 mt-0.5">
                      Select your preferred dummy payment method. No real bank charges will be incurred.
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3 mb-6">
                    {[
                      {
                        id: 'upi',
                        name: 'Instant UPI / QR Code (Mock)',
                        desc: 'Pay using Google Pay, PhonePe, or Paytm demo QR',
                        icon: '📱'
                      },
                      {
                        id: 'card',
                        name: 'Test Credit / Debit Card',
                        desc: 'Simulated 1-click test card authorization (Visa / MC)',
                        icon: '💳'
                      },
                      {
                        id: 'counter',
                        name: 'Pay at Salon Counter',
                        desc: 'Reserve queue slot now and pay at salon reception upon arrival',
                        icon: '💵'
                      }
                    ].map((pm) => (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                          paymentMethod === pm.id
                            ? isLight
                              ? 'bg-[#fff8f4] border-[#6f331d] ring-2 ring-[#6f331d]/20 shadow-sm'
                              : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                            : isLight
                            ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba]'
                            : 'bg-[#0B0F17]/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{pm.icon}</span>
                          <div>
                            <div className="font-bold text-xs sm:text-sm">{pm.name}</div>
                            <div className="text-[11px] opacity-70">{pm.desc}</div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            paymentMethod === pm.id
                              ? isLight
                                ? 'bg-[#6f331d] text-white border-[#6f331d]'
                                : 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'border-slate-400 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Step 4 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex items-center justify-between">
                    <button
                      onClick={() => setStep(3)}
                      disabled={isProcessing}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        isLight
                          ? 'border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Details
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isProcessing}
                      className={`px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 ${
                        isProcessing
                          ? 'opacity-70 cursor-wait bg-slate-600 text-white'
                          : isLight
                          ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
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
                  isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-inherit mb-4">
                  <span className="text-xs uppercase font-bold tracking-wider opacity-60">
                    Booking Summary
                  </span>
                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      timingMode === 'current_token'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : isLight
                        ? 'bg-[#d9c2ba] text-[#6f331d]'
                        : 'bg-amber-500/15 text-amber-400'
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
                          <div className="font-bold text-emerald-500 flex items-center gap-1">
                            <span>● Live Token {queueInfo?.nextAvailableToken || 'T-003'}</span>
                          </div>
                          <div className="text-[10px] opacity-70">~{queueInfo?.estimatedWaitMinutesForNext ?? 35} mins estimated wait</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
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
                      ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#53433e]'
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
