'use client';

import Link from 'next/link';
import { CustomerAppointment } from '../../mock/customerMock';

interface AppointmentsListProps {
  appointments?: CustomerAppointment[];
}

export default function AppointmentsList({ appointments = [] }: AppointmentsListProps) {
  const defaultList: CustomerAppointment[] = [
    {
      id: 105,
      serviceId: 1,
      serviceName: 'Signature Haircut & Style',
      staffId: 101,
      staffName: 'Raj Malhotra',
      appointmentTime: '10:30 AM',
      appointmentDate: 'Today',
      price: 350,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING'
    },
    {
      id: 104,
      serviceId: 2,
      serviceName: 'Beard Trim & Precision Shave',
      staffId: 102,
      staffName: 'Amit Verma',
      appointmentTime: '04:00 PM',
      appointmentDate: 'Last Week',
      price: 200,
      status: 'COMPLETED',
      paymentStatus: 'SUCCESS'
    }
  ];

  const items = appointments.length > 0 ? appointments.slice(0, 3) : defaultList;

  return (
    <section className="bg-[#121826] border border-slate-800/90 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            My Appointments
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Your recent bookings and service history.
          </p>
        </div>

        <Link
          href="/customer/appointments"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
        >
          <span>View All Appointments</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="divide-y divide-slate-800/80 mt-1">
        {items.map((apt) => (
          <div key={apt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-sm">
                {apt.serviceName}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2.5">
                <span className="text-slate-300 font-medium">{apt.staffName}</span>
                <span>•</span>
                <span>{apt.appointmentDate} • {apt.appointmentTime}</span>
                <span>•</span>
                <span className="font-bold text-amber-400">₹{apt.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                apt.status === 'CONFIRMED'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : apt.status === 'COMPLETED'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {apt.status}
              </span>

              {apt.status === 'CONFIRMED' && (
                <Link
                  href="/customer/queue"
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Queue #3
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

