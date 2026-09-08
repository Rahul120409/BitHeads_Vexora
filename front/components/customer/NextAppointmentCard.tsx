'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scissors, Calendar, CreditCard, MapPin, Star, ArrowRight } from 'lucide-react';
import { CustomerAppointment } from '../../mock/customerMock';

interface NextAppointmentCardProps {
  appointment?: CustomerAppointment | null;
  onCancel?: (appointmentId: number) => void;
}

export default function NextAppointmentCard({ appointment, onCancel }: NextAppointmentCardProps) {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Friendly Empty State when there is no active booking
  if (!appointment || appointment.status !== 'CONFIRMED') {
    return (
      <div className="bg-[#121826] border border-slate-800/80 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mx-auto mb-3">
          <Scissors className="w-5 h-5 stroke-[2.2]" />
        </div>
        <h3 className="text-lg font-bold text-white">Ready for your next look?</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          You don&apos;t have any upcoming visits right now. Book your preferred barber or spa treatment in seconds.
        </p>
        <Link
          href="/customer/book"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
        >
          <span>+ Book Service</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#121826] border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden transition-all">
      {/* Accent corner bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>

      {/* Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            YOUR NEXT APPOINTMENT
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
          {appointment.status}
        </span>
      </div>

      {/* Main Info */}
      <div className="pt-5 pb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">
          {appointment.serviceName}
        </h2>

        <div className="mt-2 text-sm text-slate-300 flex items-center gap-2">
          <span className="text-slate-400">with</span>
          <strong className="text-white font-bold">{appointment.staffName}</strong>
          <span className="text-amber-400 text-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>4.9 (Master Stylist)</span>
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Schedule:</span>
            </span>
            <strong className="text-white">{appointment.appointmentDate} • {appointment.appointmentTime}</strong>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Price:</span>
            </span>
            <strong className="text-amber-400 font-bold">₹{appointment.price}</strong>
            <span className="text-[10px] text-slate-400">({appointment.paymentStatus})</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio:</span>
            </span>
            <span className="text-white font-medium">Chair 2 (Downtown)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDetailsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
          >
            View Details
          </button>

          <Link
            href="/customer/queue"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>Track Queue</span>
            <span>→</span>
          </Link>
        </div>

        {onCancel && (
          <button
            onClick={() => onCancel(appointment.id)}
            className="px-3 py-2 rounded-xl hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121826] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Appointment Details</h3>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="font-bold text-white">{appointment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Barber:</span>
                <span className="font-bold text-white">{appointment.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-white">{appointment.appointmentDate} at {appointment.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-bold text-amber-400">₹{appointment.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-emerald-400">{appointment.status}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

