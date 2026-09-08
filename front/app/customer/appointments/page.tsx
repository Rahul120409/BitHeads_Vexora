'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeProvider, useTheme } from '../../../components/customer/ThemeContext';
import Navbar from '../../../components/customer/Navbar';
import MobileNavigation from '../../../components/customer/MobileNavigation';
import { customerService } from '../../../services/customerService';
import { CustomerAppointment } from '../../../mock/customerMock';

function AppointmentsContent() {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    customerService.getAppointments(1).then(setAppointments);
  }, []);

  const handleCancel = async (aptId: number) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await customerService.cancelAppointment(aptId);
      const updated = await customerService.getAppointments(1);
      setAppointments(updated);
      setToastMessage('Appointment cancelled and refund processed.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const upcomingList = appointments.filter(a => a.status === 'CONFIRMED');
  const pastList = [
    {
      id: 1,
      title: 'Rose Petal Hydration Facial & Eye Lifting',
      artisan: 'Camille Laurent',
      artisanRole: 'Master Aesthetician',
      rating: 5.0,
      date: 'Sep 18, 2024',
      time: '14:30 – 16:00',
      duration: '90 mins',
      price: 165,
      status: 'Completed',
      notes: 'Focused on micro-circulation with Damask rose mist and lymphatic contour massage.'
    },
    {
      id: 2,
      title: 'Japanese Head Spa & Scalp Detox Ritual',
      artisan: 'Kenji Sato',
      artisanRole: 'Holistic Scalp Specialist',
      rating: 4.9,
      date: 'Aug 02, 2024',
      time: '11:00 – 12:15',
      duration: '75 mins',
      price: 140,
      status: 'Completed',
      notes: 'Personalized hair follicle analysis recorded to profile. Purchased: Revitalizing Serum.'
    },
    {
      id: 3,
      title: 'Luxe Gel Manicure & Warm Almond Hand Mask',
      artisan: 'Elena Vance',
      artisanRole: 'Nail Couturier',
      rating: 4.8,
      date: 'Jul 19, 2024',
      time: '16:00 – 17:00',
      duration: '60 mins',
      price: 95,
      status: 'Completed',
      notes: 'Organic milk bath soak with custom chrome powder top coat finish.'
    },
    {
      id: 4,
      title: 'Balayage Glow Hair Painting & Glossing Glaze',
      artisan: 'Raj Malhotra',
      artisanRole: 'Master Colorist',
      rating: 4.95,
      date: 'Jun 11, 2024',
      time: '13:00 – 15:30',
      duration: '150 mins',
      price: 220,
      status: 'Completed',
      notes: 'Includes botanical bond-builder and deep scalp massage with balayage amber tones.'
    }
  ];

  return (
    <div
      className={`min-h-screen transition-colors font-sans pb-16 md:pb-0 ${
        isLight ? 'bg-[#fff8f4] text-[#1e1b18]' : 'bg-[#0B0F17] text-slate-100'
      }`}
    >
      <Navbar />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold animate-bounce bg-[#121826] border-amber-500 text-amber-300">
          <span>⚡ {toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Identity & Stat Ribbon (from user design reference) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-inherit">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
              <span>Sanctuary Log</span>
              <span>•</span>
              <span>Client Ledger #SP-8841</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 ${
              isLight ? 'text-[#6f331d] font-serif' : 'text-white'
            }`}>
              Ritual History & Bookings
            </h1>
            <p className="text-xs sm:text-sm opacity-75 mt-1 max-w-2xl">
              Review your upcoming and historical salon treatments, track live queue status, or instantly re-summon your favored practitioners.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className={`flex items-center gap-4 p-3 rounded-2xl border shadow-sm ${
            isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
          }`}>
            <div className="px-3 text-left">
              <span className="text-[10px] uppercase font-bold opacity-60 block">Cumulative Spent</span>
              <span className={`text-base font-bold ${isLight ? 'text-[#6f331d]' : 'text-amber-400'}`}>$600.00</span>
            </div>
            <div className="w-px h-8 bg-slate-400/20"></div>
            <div className="px-3 text-left">
              <span className="text-[10px] uppercase font-bold opacity-60 block">Sanctuary Hours</span>
              <span className="text-base font-bold">8.5 hrs</span>
            </div>
            <div className="w-px h-8 bg-slate-400/20"></div>
            <div className="px-3 text-left">
              <span className="text-[10px] uppercase font-bold opacity-60 block">Tier</span>
              <span className="text-base font-bold text-amber-500">Étoile d&apos;Or</span>
            </div>
          </div>
        </div>

        {/* Segmented View Toggle (Upcoming vs Past) */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className={`inline-flex p-1 rounded-full border shadow-sm ${
            isLight ? 'bg-[#f4ece7] border-[#d9c2ba]' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'upcoming'
                  ? isLight
                    ? 'bg-[#6f331d] text-white shadow'
                    : 'bg-amber-500 text-slate-950 shadow'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Upcoming ({upcomingList.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'past'
                  ? isLight
                    ? 'bg-[#6f331d] text-white shadow'
                    : 'bg-amber-500 text-slate-950 shadow'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Past Appointments ({pastList.length})
            </button>
          </div>

          <Link
            href="/customer/book"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
            }`}
          >
            + Book New Appointment
          </Link>
        </div>

        {/* TAB 1: UPCOMING APPOINTMENT (With Live Queue Token) */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingList.length === 0 ? (
              <div className={`p-10 rounded-2xl border text-center ${isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'}`}>
                <div className="text-2xl mb-2">✂️</div>
                <h3 className="font-bold text-base">No upcoming appointments scheduled</h3>
                <p className="text-xs opacity-70 mt-1">Book your next visit to receive your live digital token.</p>
                <Link href="/customer/book" className="inline-block mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">
                  Book an Appointment
                </Link>
              </div>
            ) : (
              upcomingList.map((apt) => (
                <div
                  key={apt.id}
                  className={`rounded-2xl border p-6 shadow-md ${
                    isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isLight ? 'bg-[#ffdbce] text-[#6f331d]' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {apt.appointmentDate} • {apt.appointmentTime}
                      </span>
                      <h2 className="text-xl font-bold mt-2">{apt.serviceName}</h2>
                      <div className="text-xs opacity-75 mt-1">
                        Artisan: <strong>{apt.staffName}</strong> (Master Stylist) • Studio Chair 2
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center">
                      <div className="text-xl font-black text-amber-500">₹{apt.price}</div>
                      <span className="text-[10px] font-bold uppercase text-emerald-500">● {apt.status}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-500">Live Token #3</span>
                      <span className="opacity-60">• Estimated Wait: ~20 mins</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href="/customer/queue"
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-center font-bold ${
                          isLight ? 'bg-[#6f331d] text-white' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        Track Live Queue →
                      </Link>

                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-semibold"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PAST APPOINTMENTS (The Exact Luxury Ledger from Reference Mockup) */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastList.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      isLight ? 'bg-[#ffdbce]' : 'bg-slate-900 border border-slate-800'
                    }`}>
                      💆‍♂️
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isLight ? 'bg-[#f4ece7] text-[#6f331d]' : 'bg-slate-900 text-amber-300'
                        }`}>
                          {item.date}
                        </span>
                        <span className="text-[11px] opacity-60">{item.time}</span>
                        <span>•</span>
                        <span className="text-[11px] opacity-60 font-semibold">{item.duration}</span>
                      </div>

                      <h3 className={`text-lg font-bold ${isLight ? 'text-[#6f331d] font-serif' : 'text-white'}`}>
                        {item.title}
                      </h3>

                      <div className="text-xs flex items-center gap-2 pt-0.5">
                        <span>Artisan: <strong>{item.artisan}</strong></span>
                        <span className="opacity-40">•</span>
                        <span className="text-amber-500 font-bold">★ {item.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg font-bold">${item.price}.00</div>
                    <span className="text-[10px] font-bold uppercase text-emerald-500">
                      ✓ {item.status}
                    </span>
                  </div>
                </div>

                <div className="my-4 h-px bg-slate-400/10"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <p className="italic opacity-70 max-w-xl">
                    &quot;{item.notes}&quot;
                  </p>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => alert(`Receipt for ${item.title} downloaded.`)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                        isLight ? 'border-[#d9c2ba] hover:bg-[#f4ece7]' : 'border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      View Receipt
                    </button>

                    <Link
                      href="/customer/book"
                      className={`px-4 py-1.5 rounded-xl font-bold text-xs ${
                        isLight ? 'bg-[#6f331d] text-white hover:bg-[#8c4a32]' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      }`}
                    >
                      Rebook Treatment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
      <MobileNavigation />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <ThemeProvider>
      <AppointmentsContent />
    </ThemeProvider>
  );
}
