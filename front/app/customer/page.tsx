'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '../../components/customer/ThemeContext';
import Navbar from '../../components/customer/Navbar';
import { customerService } from '../../services/customerService';
import {
  CustomerUser,
  CustomerQueueStatus,
  CustomerAppointment,
  mockCustomer
} from '../../mock/customerMock';

interface SalonLocation {
  id: number;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  address: string;
  chairsAvailable: number;
  estWait: string;
  image: string;
  badge?: string;
  services: { id: number; name: string; price: number; duration: number; cat: string }[];
  stylists: { id: number; name: string; role: string; rating: number }[];
}

function CustomerHomeContent() {
  const { isLight } = useTheme();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [queue, setQueue] = useState<CustomerQueueStatus | null>(null);
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [userLocation, setUserLocation] = useState<string>('Downtown, Metro Area');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoSimulatedPos, setDemoSimulatedPos] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking Modal State
  const [selectedSalon, setSelectedSalon] = useState<SalonLocation | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1); // 1: Haircut type, 2: Timing & Stylist, 3: Details, 4: Payment
  const [selectedHaircut, setSelectedHaircut] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedStylist, setSelectedStylist] = useState('Raj Malhotra');
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'counter'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  useEffect(() => {
    let currentUser = customerService.getCurrentUser();
    if (!currentUser) {
      currentUser = mockCustomer;
      customerService.setCurrentUser(mockCustomer);
    }
    setUser(currentUser);
    setCustomerName(currentUser.name);
    setCustomerPhone(currentUser.phone);

    customerService.getQueueStatus(currentUser.id).then(setQueue);
    customerService.getAppointments(currentUser.id).then(setAppointments);
  }, []);

  const handleDetectLocation = () => {
    setUserLocation('📍 Current GPS: Indiranagar 100ft Road');
    setToastMessage('Location detected: Indiranagar (0.4 km away)');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSimulateTurn = () => {
    const current = demoSimulatedPos ?? (queue ? queue.position : 3);
    if (current > 1) {
      const next = current - 1;
      setDemoSimulatedPos(next);
      if (next === 1) {
        setToastMessage('🔔 Ding! Your token is NOW SERVING at Chair 2 with Raj Malhotra!');
      } else {
        setToastMessage(`✨ Real-time update: Position #${next} (~${next * 10} mins wait remaining).`);
      }
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setDemoSimulatedPos(3);
      setToastMessage('🔄 Demo queue reset to Token #3.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const nearbySalons: SalonLocation[] = [
    {
      id: 1,
      name: 'SalonPulse Downtown Studio',
      distance: '0.8 km away',
      rating: 4.9,
      reviews: 340,
      address: '42 MG Road, Metro Promenade, Downtown',
      chairsAvailable: 3,
      estWait: '~15 mins',
      image: '✂️',
      badge: 'Nearest • Verified Partner',
      services: [
        { id: 101, name: 'Signature Precision Haircut & Styling', price: 350, duration: 30, cat: 'Haircut' },
        { id: 102, name: 'Fade & Textured Crop Style', price: 300, duration: 25, cat: 'Haircut' },
        { id: 103, name: 'Classic Executive Scissor Haircut', price: 400, duration: 35, cat: 'Haircut' },
        { id: 104, name: 'Haircut + Beard Sculpting Combo', price: 500, duration: 45, cat: 'Combo' },
        { id: 105, name: 'Beard Trim & Hot Towel Shave', price: 200, duration: 20, cat: 'Beard' }
      ],
      stylists: [
        { id: 1, name: 'Raj Malhotra', role: 'Master Stylist', rating: 4.9 },
        { id: 2, name: 'Amit Verma', role: 'Senior Barber', rating: 4.8 },
        { id: 3, name: 'Priya Kapoor', role: 'Hair Specialist', rating: 4.9 }
      ]
    },
    {
      id: 2,
      name: 'Atelier Éthéré Luxury Sanctuary',
      distance: '1.4 km away',
      rating: 4.95,
      reviews: 210,
      address: '18 Rue de Haute, Galleria Arcade',
      chairsAvailable: 2,
      estWait: '~25 mins',
      image: '🌸',
      badge: 'Haute Beauté',
      services: [
        { id: 201, name: 'Signature Precision Haircut & Styling', price: 450, duration: 35, cat: 'Haircut' },
        { id: 202, name: 'Rose Petal Hydration Facial & Haircut', price: 850, duration: 60, cat: 'Combo' },
        { id: 203, name: 'Japanese Scalp Detox & Head Spa', price: 750, duration: 45, cat: 'Spa' }
      ],
      stylists: [
        { id: 4, name: 'Camille Laurent', role: 'Master Aesthetician', rating: 5.0 },
        { id: 5, name: 'Elena Vance', role: 'Master Hair Colorist', rating: 4.9 }
      ]
    },
    {
      id: 3,
      name: 'The Urban Barber & Grooming Club',
      distance: '2.1 km away',
      rating: 4.8,
      reviews: 180,
      address: '77 Heritage Boulevard, 2nd Floor',
      chairsAvailable: 1,
      estWait: '~30 mins',
      image: '🧔',
      badge: 'Traditional Shaves',
      services: [
        { id: 301, name: 'Vintage Barber Haircut & Clean Neck Shave', price: 320, duration: 30, cat: 'Haircut' },
        { id: 302, name: 'Royal Hot Towel Shave & Beard Trim', price: 220, duration: 25, cat: 'Beard' },
        { id: 303, name: 'Full Grooming Overhaul (Hair + Beard + Pack)', price: 650, duration: 55, cat: 'Combo' }
      ],
      stylists: [
        { id: 6, name: 'Kenji Sato', role: 'Grooming Master', rating: 4.9 },
        { id: 7, name: 'Sophie Chen', role: 'Stylist & Detailer', rating: 4.8 }
      ]
    }
  ];

  const availableTimeSlots = [
    '10:30 AM', '11:15 AM', '12:00 PM', '01:30 PM', '02:45 PM', '04:00 PM', '05:30 PM', '06:45 PM'
  ];

  const filteredSalons = nearbySalons.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.services.some(srv => srv.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open booking modal
  const handleStartBooking = (salon: SalonLocation) => {
    setSelectedSalon(salon);
    setSelectedHaircut(salon.services[0]);
    setSelectedStylist(salon.stylists[0].name);
    setBookingStep(1);
    setPaymentSuccessData(null);
  };

  // Complete Dummy Payment
  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate payment gateway delay

    const newAptId = 100 + appointments.length + 1;
    const newQueueToken = 3;

    const newAppointment: CustomerAppointment = {
      id: newAptId,
      serviceId: selectedHaircut.id,
      serviceName: selectedHaircut.name,
      staffId: 101,
      staffName: selectedStylist,
      appointmentTime: selectedTimeSlot,
      appointmentDate: selectedDate,
      price: selectedHaircut.price,
      status: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      refundStatus: 'NOT_REQUESTED',
      queuePosition: newQueueToken,
      estimatedWaitMinutes: 20
    };

    const updatedApts = [newAppointment, ...appointments];
    setAppointments(updatedApts);

    // Save to service
    const newQueueStatus: CustomerQueueStatus = {
      queueId: 300 + newAptId,
      appointmentId: newAptId,
      customerId: user ? user.id : 1,
      customerName: customerName,
      serviceName: selectedHaircut.name,
      staffName: selectedStylist,
      position: newQueueToken,
      peopleAhead: 2,
      estimatedWaitMinutes: 20,
      status: 'WAITING',
      joinedAt: selectedTimeSlot
    };
    setQueue(newQueueStatus);

    setPaymentSuccessData({
      appointmentId: newAptId,
      queueToken: newQueueToken,
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      salonName: selectedSalon?.name,
      serviceName: selectedHaircut.name,
      price: selectedHaircut.price,
      time: selectedTimeSlot,
      stylist: selectedStylist,
      paymentMethod: paymentMethod.toUpperCase()
    });

    setIsProcessingPayment(false);
    setToastMessage(`Payment Successful! Your Queue Token is #${newQueueToken}`);
  };

  const currentToken = demoSimulatedPos ?? (queue ? queue.position : 3);
  const isServing = currentToken === 1;
  const activeAppointment = appointments.find(a => a.status === 'CONFIRMED');

  return (
    <div
      className={`min-h-screen transition-colors font-sans ${
        isLight ? 'bg-[#fff8f4] text-[#1e1b18]' : 'bg-[#0B0F17] text-slate-100'
      }`}
    >
      <Navbar userLocation={userLocation} onChangeLocation={setUserLocation} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold animate-bounce bg-[#121826] border-amber-500 text-amber-300">
          <span className="text-base">⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ======================================================== */}
        {/* 1. LOCATION & SALON SEARCH HERO BANNER */}
        {/* ======================================================== */}
        <section
          className={`rounded-3xl p-6 sm:p-10 border relative overflow-hidden shadow-xl ${
            isLight
              ? 'bg-gradient-to-br from-[#f4ece7] via-[#fff8f4] to-[#f4ece7] border-[#d9c2ba]'
              : 'bg-gradient-to-br from-[#121826] via-[#0e1420] to-[#0B0F17] border-slate-800'
          }`}
        >
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
              <span>📍 Live Salon Discovery</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
              isLight ? 'text-[#6f331d] font-serif' : 'text-white'
            }`}>
              Find & Book Salons in Real-Time
            </h1>

            <p className={`text-sm sm:text-base max-w-2xl ${
              isLight ? 'text-[#53433e]' : 'text-slate-300'
            }`}>
              Search top-rated salons, choose haircut styles, pick your timing, and pay securely with instant queue placement.
            </p>

            {/* Interactive Search Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-3 max-w-2xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search salon name, haircut type, fade, beard, or address..."
                  className={`w-full pl-10 pr-4 py-3.5 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-[#d9c2ba] text-[#1e1b18] placeholder:text-slate-400 focus:border-[#8c4a32]'
                      : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-400'
                  }`}
                />
              </div>

              <button
                onClick={handleDetectLocation}
                className={`px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 ${
                  isLight
                    ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <span>📍 Detect Location</span>
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. ACTIVE BOOKING & LIVE QUEUE STRIP */}
        {/* ======================================================== */}
        {activeAppointment && (
          <section
            className={`rounded-2xl p-6 border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                isLight ? 'bg-[#ffdbce] text-[#6f331d]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                #{currentToken}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Active Booking • Live Queue
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isServing ? 'bg-blue-500 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {isServing ? 'Now Serving' : 'Waiting in Line'}
                  </span>
                </div>

                <h2 className="text-lg font-bold mt-0.5">
                  {activeAppointment.serviceName}
                </h2>

                <p className="text-xs opacity-75 mt-0.5">
                  Stylist: <strong>{activeAppointment.staffName}</strong> • {activeAppointment.appointmentDate} at {activeAppointment.appointmentTime} • Chair 2
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right mr-2 hidden sm:block">
                <div className="text-[10px] uppercase font-bold opacity-60">Estimated Wait</div>
                <div className={`text-base font-extrabold ${isLight ? 'text-[#8c4a32]' : 'text-emerald-400'}`}>
                  {isServing ? '0 mins' : `~${currentToken * 10} mins`}
                </div>
              </div>

              <Link
                href="/customer/queue"
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                  isLight ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                Track Live Queue (#{currentToken}) →
              </Link>

              <button
                onClick={handleSimulateTurn}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  isLight ? 'border-[#d9c2ba] hover:bg-[#f4ece7] text-[#6f331d]' : 'border-slate-700 hover:bg-slate-800 text-purple-300'
                }`}
                title="Simulate queue turn advancement"
              >
                ⚡ Advance
              </button>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 3. SEARCHED SALONS & BOOKING OPTIONS */}
        {/* ======================================================== */}
        <section id="salons" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isLight ? 'text-[#6f331d] font-serif' : 'text-white'
              }`}>
                {searchQuery ? `Search Results for "${searchQuery}"` : `Nearby Salons in ${userLocation.split(',')[0]}`}
              </h2>
              <p className="text-xs opacity-75 mt-0.5">
                Click <strong>&quot;Book Appointment&quot;</strong> on any salon card to choose your haircut, slot & pay
              </p>
            </div>

            <span className="text-xs font-bold text-amber-500">
              {filteredSalons.length} Salons Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <div
                key={salon.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between shadow-md transition-all hover:shadow-xl ${
                  isLight
                    ? 'bg-white border-[#e9e1dc] hover:border-[#8c4a32]'
                    : 'bg-[#121826] border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-xl flex items-center justify-center">
                      {salon.image}
                    </span>
                    {salon.badge && (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isLight ? 'bg-[#ffdbce] text-[#6f331d]' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {salon.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold leading-snug">
                    {salon.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-1">
                    <span>★ {salon.rating}</span>
                    <span className="opacity-60 font-normal">({salon.reviews} reviews)</span>
                    <span className="opacity-40">•</span>
                    <span className="text-emerald-500 font-semibold">{salon.distance}</span>
                  </div>

                  <p className="text-xs opacity-70 mt-2 line-clamp-2">
                    📍 {salon.address}
                  </p>

                  <div className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
                    isLight ? 'bg-[#f4ece7]' : 'bg-slate-950/60 border border-slate-800'
                  }`}>
                    <div>
                      <div className="text-[10px] uppercase font-bold opacity-60">Chairs Available</div>
                      <div className="font-bold text-emerald-500">{salon.chairsAvailable} Open Now</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold opacity-60">Queue Wait</div>
                      <div className="font-bold">{salon.estWait}</div>
                    </div>
                  </div>

                  {/* Available Services Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {salon.services.slice(0, 3).map((srv) => (
                      <span key={srv.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-500/10 opacity-80">
                        {srv.name.split(' ')[0]} (₹{srv.price})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-inherit flex items-center gap-2">
                  <Link
                    href={`/customer/book?salonId=${salon.id}`}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs text-center transition-all shadow-md block ${
                      isLight
                        ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    📅 Book Appointment Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. HOW IT WORKS / HOW TO USE */}
        {/* ======================================================== */}
        <section
          className={`rounded-3xl p-8 border shadow-lg ${
            isLight
              ? 'bg-[#f4ece7] border-[#d9c2ba]'
              : 'bg-[#121826] border-slate-800'
          }`}
        >
          <div className="max-w-xl mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
              Zero Waiting Rooms
            </span>
            <h2 className={`text-2xl font-bold tracking-tight mt-1 ${
              isLight ? 'text-[#6f331d] font-serif' : 'text-white'
            }`}>
              How to Use SalonPulse
            </h2>
            <p className="text-xs opacity-75 mt-1">
              Select your salon, choose your haircut, pick your slot, and pay dummy online:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'}`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-bold text-sm">Select Nearby Salon & Haircut</h3>
              <p className="text-xs opacity-70 mt-1">
                Pick your preferred salon, choose fade, classic cut, or beard styling.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'}`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-bold text-sm">Choose Timing & Dummy Pay</h3>
              <p className="text-xs opacity-70 mt-1">
                Select your time slot, enter details, and pay dummy mock payment via UPI or Card.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'}`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 font-black flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-bold text-sm">Live Token Assigned (#3)</h3>
              <p className="text-xs opacity-70 mt-1">
                Get your live token instantly. Walk in when Chair 2 is ready with zero queue waiting.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ======================================================== */}
      {/* 5. MULTI-STEP BOOKING & DUMMY PAYMENT MODAL */}
      {/* ======================================================== */}
      {selectedSalon && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border relative my-8 ${
              isLight
                ? 'bg-[#fff8f4] border-[#d9c2ba] text-[#1e1b18]'
                : 'bg-[#121826] border-slate-800 text-slate-100'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-inherit">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  {selectedSalon.name}
                </span>
                <h3 className="text-xl font-bold">
                  {bookingStep === 1 && 'Step 1: Select Type of Haircut / Service'}
                  {bookingStep === 2 && 'Step 2: Select Appointment Timing & Stylist'}
                  {bookingStep === 3 && 'Step 3: Confirm Customer Details'}
                  {bookingStep === 4 && (paymentSuccessData ? 'Booking & Payment Confirmed!' : 'Step 4: Dummy Mock Payment')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSalon(null)}
                className="w-8 h-8 rounded-full border flex items-center justify-center opacity-60 hover:opacity-100 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Step Progress Pills */}
            {!paymentSuccessData && (
              <div className="flex items-center justify-between gap-2 py-4 text-xs font-bold border-b border-inherit">
                <span className={bookingStep >= 1 ? 'text-amber-500' : 'opacity-40'}>1. Haircut</span>
                <span>→</span>
                <span className={bookingStep >= 2 ? 'text-amber-500' : 'opacity-40'}>2. Timing</span>
                <span>→</span>
                <span className={bookingStep >= 3 ? 'text-amber-500' : 'opacity-40'}>3. Details</span>
                <span>→</span>
                <span className={bookingStep >= 4 ? 'text-amber-500' : 'opacity-40'}>4. Payment</span>
              </div>
            )}

            {/* STEP 1: SELECT TYPE OF HAIRCUT */}
            {bookingStep === 1 && (
              <div className="py-5 space-y-4">
                <div className="text-xs opacity-75">
                  Choose the haircut or grooming treatment you desire:
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {selectedSalon.services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedHaircut(srv)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedHaircut?.id === srv.id
                          ? isLight
                            ? 'bg-[#ffdbce] border-[#6f331d] shadow-sm'
                            : 'bg-amber-500/15 border-amber-500 text-white'
                          : isLight
                          ? 'bg-white border-[#e9e1dc] hover:border-[#8c4a32]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-500">
                          {srv.cat}
                        </span>
                        <div className="font-bold text-sm mt-0.5">{srv.name}</div>
                        <div className="text-xs opacity-60">{srv.duration} mins duration</div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-amber-500">₹{srv.price}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedHaircut?.id === srv.id ? 'bg-amber-500 text-slate-950' : 'opacity-60'
                        }`}>
                          {selectedHaircut?.id === srv.id ? 'Selected ✓' : 'Select'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-inherit flex justify-end">
                  <button
                    onClick={() => setBookingStep(2)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                      isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Continue to Timing →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT TIMING & STYLIST */}
            {bookingStep === 2 && (
              <div className="py-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase opacity-70 mb-2">
                    Select Date
                  </label>
                  <div className="flex gap-2">
                    {['Today', 'Tomorrow', 'This Saturday'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedDate === d
                            ? isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                            : 'opacity-70 hover:opacity-100 border-inherit'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase opacity-70 mb-2">
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          selectedTimeSlot === slot
                            ? isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase opacity-70 mb-2">
                    Select Stylist / Barber
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedSalon.stylists.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStylist(st.name)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          selectedStylist === st.name
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs">{st.name}</div>
                        <div className="text-[10px] opacity-60">{st.role}</div>
                        <div className="text-[10px] text-amber-500 font-bold mt-1">★ {st.rating}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-inherit flex justify-between">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setBookingStep(3)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                      isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Enter Customer Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER DETAILS */}
            {bookingStep === 3 && (
              <div className="py-5 space-y-4">
                <div className="text-xs opacity-75">
                  Confirm your contact information for appointment SMS & token notifications:
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                        isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase opacity-70 mb-1">
                      Phone Number (For Live Token SMS)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                        isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  </div>
                </div>

                {/* Booking Summary Box */}
                <div className={`p-4 rounded-2xl border text-xs space-y-2 mt-4 ${
                  isLight ? 'bg-[#f4ece7] border-[#d9c2ba]' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="font-bold text-sm mb-1 pb-1 border-b border-inherit">
                    Booking Summary
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Salon:</span>
                    <strong className="font-bold">{selectedSalon.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Haircut:</span>
                    <strong className="font-bold">{selectedHaircut?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Stylist:</span>
                    <strong>{selectedStylist}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Timing:</span>
                    <strong>{selectedDate} at {selectedTimeSlot}</strong>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-inherit">
                    <span>Total To Pay:</span>
                    <span className="text-amber-500">₹{selectedHaircut?.price}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-inherit flex justify-between">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setBookingStep(4)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md ${
                      isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DUMMY PAYMENT & CONFIRMATION */}
            {bookingStep === 4 && (
              <div className="py-5 space-y-4">
                {paymentSuccessData ? (
                  /* PAYMENT SUCCESS CARD */
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-3xl flex items-center justify-center mx-auto shadow-lg">
                      ✓
                    </div>

                    <h4 className="text-2xl font-black">
                      Payment & Booking Confirmed!
                    </h4>

                    <p className="text-xs opacity-75 max-w-sm mx-auto">
                      Your appointment is booked at <strong>{paymentSuccessData.salonName}</strong> with token:
                    </p>

                    <div className={`p-5 rounded-2xl border inline-block min-w-[200px] shadow-lg ${
                      isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-950 border-amber-500/40'
                    }`}>
                      <div className="text-[10px] font-bold uppercase opacity-60">Live Queue Token</div>
                      <div className="text-5xl font-black text-amber-500 mt-1">
                        #{paymentSuccessData.queueToken}
                      </div>
                      <div className="text-xs font-semibold text-emerald-500 mt-1">
                        Chair 2 • ~20 mins wait
                      </div>
                    </div>

                    <div className="text-xs opacity-70">
                      Transaction Ref: <strong>{paymentSuccessData.transactionId}</strong> ({paymentSuccessData.paymentMethod})
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href="/customer/queue"
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs shadow-md ${
                          isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        Track Live Queue (#{paymentSuccessData.queueToken}) →
                      </Link>
                      <button
                        onClick={() => setSelectedSalon(null)}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl border text-xs font-bold opacity-75 hover:opacity-100"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>
                ) : (
                  /* MOCK PAYMENT SELECTION */
                  <div className="space-y-4">
                    <div className="text-xs opacity-75">
                      Select mock payment method (Simulation Mode):
                    </div>

                    <div className="space-y-2.5">
                      <div
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'upi'
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📱</span>
                          <div>
                            <div className="font-bold text-sm">UPI / QR Code (GPay, PhonePe, Paytm)</div>
                            <div className="text-[11px] opacity-60">Instant mock payment confirmation</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">₹{selectedHaircut?.price}</span>
                      </div>

                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'card'
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💳</span>
                          <div>
                            <div className="font-bold text-sm">Credit / Debit Card</div>
                            <div className="text-[11px] opacity-60">Dummy Card ending in **** 4242</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">₹{selectedHaircut?.price}</span>
                      </div>

                      <div
                        onClick={() => setPaymentMethod('counter')}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${
                          paymentMethod === 'counter'
                            ? isLight ? 'bg-[#ffdbce] border-[#6f331d]' : 'bg-amber-500/15 border-amber-500 text-white'
                            : isLight ? 'bg-white border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💵</span>
                          <div>
                            <div className="font-bold text-sm">Pay at Salon Counter</div>
                            <div className="text-[11px] opacity-60">Pay cash or card upon arrival</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-500">Pay Later</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-inherit flex justify-between items-center">
                      <button
                        onClick={() => setBookingStep(3)}
                        disabled={isProcessingPayment}
                        className="px-4 py-2 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                      >
                        ← Back
                      </button>

                      <button
                        onClick={handleProcessPayment}
                        disabled={isProcessingPayment}
                        className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 ${
                          isLight
                            ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isProcessingPayment ? (
                          <>
                            <span className="animate-spin">🔄</span>
                            <span>Processing Dummy Payment...</span>
                          </>
                        ) : (
                          <>
                            <span>Pay ₹{selectedHaircut?.price} & Enter Queue</span>
                            <span>→</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className={`border-t py-8 text-center text-xs opacity-60 ${
        isLight ? 'border-[#e9e1dc] bg-[#fff8f4]' : 'border-slate-900 bg-[#0B0F17]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 SalonPulse — Real-Time Salon Operations & Smart Queue.</span>
          <div className="flex gap-4">
            <Link href="/customer/appointments" className="hover:underline">Appointments</Link>
            <Link href="/customer/profile" className="hover:underline">My Profile</Link>
            <Link href="/customer/queue" className="hover:underline">Live Queue</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CustomerHomePage() {
  return (
    <ThemeProvider>
      <CustomerHomeContent />
    </ThemeProvider>
  );
}
