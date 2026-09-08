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
  mockCustomer
} from '../../../mock/customerMock';

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

  // Step 1: Haircut / Service Selection
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<any>(null);

  // Step 2: Timing & Token Selection (2 Sections: Current Token vs Advance Slot)
  const [timingMode, setTimingMode] = useState<'current_token' | 'advance_slot'>('current_token');
  
  // Section 1: Current Token state
  const [liveQueueToken] = useState<number>(3);
  const [liveQueueServing] = useState<number>(2);
  const [liveQueueWait] = useState<number>(15);

  // Section 2: Advance Slot state
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:15 AM');
  const [scheduledToken] = useState<string>('#S-14');

  // Common Stylist selection
  const [selectedStylist, setSelectedStylist] = useState<string>('Raj Malhotra');

  // Step 3: Customer Details
  const [customerName, setCustomerName] = useState<string>('Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 43210');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Step 4: Payment state
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  useEffect(() => {
    // Load current user
    const user = customerService.getCurrentUser() || mockCustomer;
    setCurrentUser(user);
    setCustomerName(user.name);
    setCustomerPhone(user.phone);

    // Determine salon
    const parsedId = salonIdParam ? parseInt(salonIdParam, 10) : 1;
    const foundSalon = mockNearbySalons.find((s) => s.id === parsedId) || mockNearbySalons[0];
    setSalon(foundSalon);

    // Initial service selection
    if (serviceIdParam) {
      const srv = foundSalon.services.find((s) => s.id === parseInt(serviceIdParam, 10));
      if (srv) {
        setSelectedService(srv);
      } else {
        setSelectedService(foundSalon.services[0]);
      }
    } else {
      setSelectedService(foundSalon.services[0]);
    }

    // Default stylist
    if (foundSalon.stylists && foundSalon.stylists.length > 0) {
      setSelectedStylist(foundSalon.stylists[0].name);
    }

    if (catParam) {
      setCategoryFilter(catParam);
    }
  }, [salonIdParam, serviceIdParam, catParam]);

  const categories = ['All', 'Haircut', 'Beard', 'Combo', 'Spa'];

  const filteredServices = salon.services.filter((s) => {
    if (categoryFilter === 'All') return true;
    return s.cat.toLowerCase() === categoryFilter.toLowerCase();
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

  // Process Dummy Mock Payment
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1300)); // realistic gateway simulation

    const generatedTxn = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const assignedTokenNumber = timingMode === 'current_token' ? `#${liveQueueToken}` : scheduledToken;
    const tokenType = timingMode === 'current_token' ? 'Live Walk-in Queue' : 'Advance Scheduled Slot';

    // Save to customerService appointments
    await customerService.bookAppointment({
      customerId: currentUser.id,
      serviceId: selectedService ? selectedService.id : 1,
      staffId: 101,
      appointmentTime: timingMode === 'current_token' ? 'Immediate (Live)' : selectedTimeSlot,
      appointmentDate: timingMode === 'current_token' ? 'Today' : selectedDate
    });

    setConfirmationData({
      txnId: generatedTxn,
      token: assignedTokenNumber,
      tokenType,
      salonName: salon.name,
      salonAddress: salon.address,
      serviceName: selectedService ? selectedService.name : 'Signature Haircut',
      price: selectedService ? selectedService.price : 350,
      stylist: selectedStylist,
      date: timingMode === 'current_token' ? 'Today (Now)' : selectedDate,
      time: timingMode === 'current_token' ? '~15 mins wait' : selectedTimeSlot,
      customerName,
      customerPhone,
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

              {/* STEP 1: SELECT TYPE OF HAIRCUT / SERVICE */}
              {step === 1 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-lg ${
                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit mb-6">
                    <div>
                      <h2 className="text-xl font-serif font-bold">Step 1: Select Type of Haircut</h2>
                      <p className="text-xs opacity-75 mt-0.5">
                        Choose your desired cut or grooming treatment for today.
                      </p>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                            categoryFilter === cat
                              ? isLight
                                ? 'bg-[#6f331d] text-white'
                                : 'bg-amber-500 text-slate-950 font-bold'
                              : isLight
                              ? 'bg-[#f4ece7] text-[#53433e] hover:bg-[#e9e1dc]'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Haircut Services Grid */}
                  <div className="space-y-3">
                    {filteredServices.map((service) => {
                      const isSelected = selectedService && selectedService.id === service.id;
                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                            isSelected
                              ? isLight
                                ? 'bg-[#fff8f4] border-[#6f331d] ring-2 ring-[#6f331d]/20 shadow-md'
                                : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                              : isLight
                              ? 'border-[#e9e1dc] hover:border-[#d9c2ba] bg-white'
                              : 'border-slate-800/80 hover:border-slate-700 bg-[#0B0F17]/40'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                                isSelected
                                  ? isLight
                                    ? 'bg-[#6f331d] text-white border-[#6f331d]'
                                    : 'bg-amber-500 text-slate-950 border-amber-500'
                                  : 'border-slate-400 text-transparent'
                              }`}
                            >
                              ✓
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm sm:text-base">{service.name}</h3>
                                <span
                                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    isLight
                                      ? 'bg-[#f4ece7] text-[#6f331d]'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {service.cat}
                                </span>
                              </div>
                              <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                                <span>⏱ {service.duration} mins</span>
                                <span>•</span>
                                <span>Includes consultation, precision scissor cut & styling</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`text-base sm:text-lg font-bold font-serif ${
                                isLight ? 'text-[#6f331d]' : 'text-amber-400'
                              }`}
                            >
                              ₹{service.price}
                            </div>
                            <span className="text-[10px] opacity-60">Inclusive of taxes</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                        selectedService
                          ? isLight
                            ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'opacity-40 cursor-not-allowed bg-slate-500 text-white'
                      }`}
                    >
                      Continue to Timing & Token Selection →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TIMING (SECTION 1: CURRENT TOKEN vs SECTION 2: ADVANCE SLOT) */}
              {step === 2 && (
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-lg ${
                    isLight ? 'bg-white border-[#d9c2ba]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="pb-4 border-b border-inherit mb-6">
                    <h2 className="text-xl font-serif font-bold">Step 2: Select Timing & Queue Token</h2>
                    <p className="text-xs opacity-75 mt-0.5">
                      Choose whether you want an immediate Live Queue Token today, or an advance scheduled slot.
                    </p>
                  </div>

                  {/* Mode Tabs / Toggle */}
                  <div
                    className={`grid grid-cols-2 p-1.5 rounded-2xl border mb-6 ${
                      isLight ? 'bg-[#f4ece7] border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => setTimingMode('current_token')}
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        timingMode === 'current_token'
                          ? isLight
                            ? 'bg-white text-[#6f331d] shadow-md border border-[#d9c2ba]'
                            : 'bg-slate-800 text-amber-400 shadow-md border border-slate-700'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>⚡ Current Live Token</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold animate-pulse">
                        LIVE
                      </span>
                    </button>

                    <button
                      onClick={() => setTimingMode('advance_slot')}
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                        timingMode === 'advance_slot'
                          ? isLight
                            ? 'bg-white text-[#6f331d] shadow-md border border-[#d9c2ba]'
                            : 'bg-slate-800 text-amber-400 shadow-md border border-slate-700'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span>📅 Advance Day & Time</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isLight ? 'bg-[#d9c2ba] text-[#53433e]' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        SCHEDULE
                      </span>
                    </button>
                  </div>

                  {/* SECTION 1: CURRENT LIVE QUEUE TOKEN */}
                  {timingMode === 'current_token' && (
                    <div className="space-y-6">
                      <div
                        className={`p-6 rounded-2xl border relative overflow-hidden ${
                          isLight
                            ? 'bg-gradient-to-br from-[#fff8f4] to-[#f4ece7] border-[#6f331d]/40 ring-2 ring-[#6f331d]/20'
                            : 'bg-gradient-to-br from-slate-900 to-[#0B0F17] border-amber-500/50 ring-2 ring-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="text-xs uppercase tracking-widest font-bold text-emerald-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Live Queue Slot • Open Now
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              isLight ? 'bg-white border text-[#6f331d]' : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            Immediate Walk-in
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center my-4">
                          {/* Currently Serving */}
                          <div
                            className={`p-4 rounded-xl border ${
                              isLight ? 'bg-white/80 border-[#d9c2ba]' : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <span className="text-[11px] uppercase tracking-wider opacity-60 font-semibold block">
                              Currently Serving
                            </span>
                            <div className="text-3xl font-serif font-black mt-1">
                              Token #{liveQueueServing}
                            </div>
                            <span className="text-[10px] text-emerald-500 font-semibold">Chairs 1 & 2 Active</span>
                          </div>

                          {/* Your Assigned Token */}
                          <div
                            className={`p-4 rounded-xl border relative shadow-md ${
                              isLight
                                ? 'bg-white border-[#6f331d] ring-2 ring-[#6f331d]/15'
                                : 'bg-slate-950 border-amber-500 ring-2 ring-amber-500/30'
                            }`}
                          >
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm">
                              Your Live Token
                            </div>
                            <span className="text-[11px] uppercase tracking-wider opacity-60 font-semibold block mt-1">
                              Next Available Slot
                            </span>
                            <div
                              className={`text-4xl font-serif font-black mt-0.5 ${
                                isLight ? 'text-[#6f331d]' : 'text-amber-400'
                              }`}
                            >
                              #{liveQueueToken}
                            </div>
                            <span className="text-[10px] opacity-75 font-semibold">Ready for You</span>
                          </div>

                          {/* Est Wait */}
                          <div
                            className={`p-4 rounded-xl border ${
                              isLight ? 'bg-white/80 border-[#d9c2ba]' : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <span className="text-[11px] uppercase tracking-wider opacity-60 font-semibold block">
                              Est. Wait Time
                            </span>
                            <div className="text-3xl font-serif font-black mt-1">
                              ~{liveQueueWait}m
                            </div>
                            <span className="text-[10px] opacity-70">2 Guests ahead</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-inherit text-xs opacity-80 flex items-center gap-2">
                          <span>💡</span>
                          <span>
                            Selecting <strong>Current Live Token #{liveQueueToken}</strong> reserves your immediate turn today. You will receive live alerts when your turn approaches!
                          </span>
                        </div>
                      </div>

                      {/* Stylist Picker for Live Queue */}
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider mb-2 opacity-80">
                          Select Available Stylist
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {salon.stylists.map((st) => (
                            <div
                              key={st.id}
                              onClick={() => setSelectedStylist(st.name)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                selectedStylist === st.name
                                  ? isLight
                                    ? 'bg-[#fff8f4] border-[#6f331d] ring-2 ring-[#6f331d]/20'
                                    : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20'
                                  : isLight
                                  ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba]'
                                  : 'bg-[#0B0F17]/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-xs">{st.name}</div>
                                <div className="text-[10px] opacity-60">{st.role}</div>
                              </div>
                              <span className="text-xs font-bold text-amber-500">★ {st.rating}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTION 2: ADVANCE DAY, TIME & TOKEN SELECTION */}
                  {timingMode === 'advance_slot' && (
                    <div className="space-y-6">
                      {/* Day Selection */}
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider mb-2 opacity-80">
                          1. Select Day
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {availableDates.map((d) => {
                            const isDateSelected = selectedDate === d.label;
                            return (
                              <button
                                key={d.label}
                                onClick={() => setSelectedDate(d.label)}
                                className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                                  isDateSelected
                                    ? isLight
                                      ? 'bg-[#6f331d] text-white border-[#6f331d] shadow-md'
                                      : 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-md'
                                    : isLight
                                    ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba] text-[#1e1b18]'
                                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                }`}
                              >
                                <div className="text-xs font-bold">{d.label}</div>
                                <div className="text-[10px] opacity-75">{d.sub}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slot Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs uppercase font-bold tracking-wider opacity-80">
                            2. Select Time Slot
                          </label>
                          <span className="text-[11px] opacity-60">Slots every 45 mins</span>
                        </div>

                        <div className="space-y-3">
                          {Object.entries(timeSlots).map(([period, slots]) => (
                            <div key={period}>
                              <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider block mb-1.5">
                                {period}
                              </span>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {slots.map((slot) => {
                                  const isSlotSelected = selectedTimeSlot === slot;
                                  return (
                                    <button
                                      key={slot}
                                      onClick={() => setSelectedTimeSlot(slot)}
                                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                                        isSlotSelected
                                          ? isLight
                                            ? 'bg-[#6f331d] text-white border-[#6f331d] shadow-sm font-bold'
                                            : 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-bold'
                                          : isLight
                                          ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba] text-[#1e1b18]'
                                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                      }`}
                                    >
                                      {slot}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pre-allocated Advance Token Display */}
                      <div
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                          isLight ? 'bg-[#fff8f4] border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                            Advance Slot Token Pre-Allocation
                          </span>
                          <div className="text-sm font-bold mt-0.5">
                            Reserved Slot Token: <span className="font-mono text-amber-500">{scheduledToken}</span>
                          </div>
                          <p className="text-[11px] opacity-70 mt-0.5">
                            Guaranteed priority window for {selectedDate} at {selectedTimeSlot}.
                          </p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-black text-lg ${
                            isLight
                              ? 'bg-white border-[#d9c2ba] text-[#6f331d]'
                              : 'bg-[#0B0F17] border-amber-500/30 text-amber-400'
                          }`}
                        >
                          S14
                        </div>
                      </div>

                      {/* Stylist Selection for Advance Slot */}
                      <div>
                        <label className="block text-xs uppercase font-bold tracking-wider mb-2 opacity-80">
                          3. Select Preferred Stylist
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {salon.stylists.map((st) => (
                            <div
                              key={st.id}
                              onClick={() => setSelectedStylist(st.name)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                selectedStylist === st.name
                                  ? isLight
                                    ? 'bg-[#fff8f4] border-[#6f331d] ring-2 ring-[#6f331d]/20'
                                    : 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20'
                                  : isLight
                                  ? 'bg-white border-[#e9e1dc] hover:border-[#d9c2ba]'
                                  : 'bg-[#0B0F17]/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-xs">{st.name}</div>
                                <div className="text-[10px] opacity-60">{st.role}</div>
                              </div>
                              <span className="text-xs font-bold text-amber-500">★ {st.rating}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2 Actions */}
                  <div className="pt-6 mt-6 border-t border-inherit flex items-center justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        isLight
                          ? 'border-[#d9c2ba] text-[#53433e] hover:bg-[#e9e1dc]'
                          : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ← Back to Haircuts
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                        isLight
                          ? 'bg-[#6f331d] hover:bg-[#5a2816] text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      Proceed to Details →
                    </button>
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

                  {/* Selected Service */}
                  <div className="pt-3 border-t border-inherit flex justify-between items-start">
                    <div>
                      <div className="font-bold">
                        {selectedService ? selectedService.name : 'Select a service'}
                      </div>
                      <div className="text-[10px] opacity-60">
                        {selectedService ? `${selectedService.duration} mins • ${selectedService.cat}` : '—'}
                      </div>
                    </div>
                    <div
                      className={`font-bold font-serif ${
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
                            <span>● Live Token #{liveQueueToken}</span>
                          </div>
                          <div className="text-[10px] opacity-70">~{liveQueueWait} mins estimated wait</div>
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
