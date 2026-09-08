'use client';

import Link from 'next/link';
import { SalonService } from '../../mock/customerMock';

interface QuickBookServicesProps {
  services?: SalonService[];
}

export default function QuickBookServices({ services = [] }: QuickBookServicesProps) {
  // Default popular services if not loaded
  const defaultServices = [
    {
      id: 1,
      name: 'Signature Haircut & Style',
      category: 'HAIR',
      durationMinutes: 30,
      price: 350,
      description: 'Personalized consultation and premium haircut.'
    },
    {
      id: 2,
      name: 'Beard Trim & Precision Shave',
      category: 'BEARD',
      durationMinutes: 20,
      price: 200,
      description: 'Sharp grooming and detailed finishing.'
    },
    {
      id: 3,
      name: 'Detox Scalp Massage & Hair Spa',
      category: 'SPA',
      durationMinutes: 45,
      price: 750,
      description: 'Relaxing treatment for your scalp and hair.'
    }
  ];

  const items = services.length > 0 ? services.slice(0, 3) : defaultServices;

  return (
    <section id="services" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Popular Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Book your favorite salon service in just a few clicks.
          </p>
        </div>

        <Link
          href="/customer/book"
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group self-start sm:self-auto"
        >
          <span>View All Services</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((service) => (
          <div
            key={service.id}
            className="bg-[#121826] border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-[#151c2d] hover:-translate-y-0.5 shadow-lg group"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {service.category.toUpperCase()}
              </span>

              <h3 className="text-base font-bold text-white mt-3 group-hover:text-amber-300 transition-colors leading-snug">
                {service.name}
              </h3>

              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {service.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-base font-extrabold text-white">₹{service.price}</div>
                <div className="text-[11px] text-slate-400">{service.durationMinutes} min</div>
              </div>

              <Link
                href={`/customer/book?serviceId=${service.id}`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

