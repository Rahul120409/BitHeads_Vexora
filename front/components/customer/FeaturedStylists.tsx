'use client';

import Link from 'next/link';
import { StaffMember } from '../../mock/customerMock';

interface FeaturedStylistsProps {
  stylists?: StaffMember[];
}

export default function FeaturedStylists({ stylists = [] }: FeaturedStylistsProps) {
  const defaultStylists: StaffMember[] = [
    {
      id: 101,
      name: 'Raj Malhotra',
      role: 'Senior Hair Stylist',
      rating: 4.9,
      status: 'AVAILABLE'
    },
    {
      id: 102,
      name: 'Amit Verma',
      role: 'Master Barber',
      rating: 4.8,
      status: 'AVAILABLE'
    },
    {
      id: 103,
      name: 'Priya Kapoor',
      role: 'Skin & Spa Specialist',
      rating: 4.9,
      status: 'AVAILABLE'
    }
  ];

  const items = stylists.length > 0 ? stylists : defaultStylists;
  const reviewCounts: Record<number, number> = { 101: 128, 102: 94, 103: 112 };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Meet Our Stylists
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Choose your preferred specialist for today&apos;s session.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.slice(0, 3).map((stylist) => (
          <div
            key={stylist.id}
            className="bg-[#121826] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 text-center flex flex-col justify-between shadow-lg transition-all hover:bg-[#151c2d]"
          >
            <div>
              {/* Stylist Avatar with initials & glowing border */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/30 border border-amber-500/30 text-amber-300 font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/10">
                {stylist.name.charAt(0)}
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Available Today</span>
              </div>

              <h3 className="text-base font-bold text-white leading-tight">
                {stylist.name}
              </h3>

              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {stylist.role}
              </p>

              {/* Rating & Reviews */}
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-400 font-bold">
                <span>⭐</span>
                <span>{stylist.rating}</span>
                <span className="text-slate-400 font-normal">
                  ({reviewCounts[stylist.id] || 120} reviews)
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <Link
                href={`/customer/book?staffId=${stylist.id}`}
                className="block w-full py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
              >
                View Profile & Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

