'use client';

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import MobileNavigation from './MobileNavigation';
import { CustomerUser } from '../../mock/customerMock';
import { customerService } from '../../services/customerService';

interface AppLayoutProps {
  children: React.ReactNode;
  user?: CustomerUser | null;
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(user || null);

  useEffect(() => {
    if (!user) {
      const u = customerService.getCurrentUser();
      setCurrentUser(u);
    }
  }, [user]);

  const activeUser = user || currentUser;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans pb-16 lg:pb-0">
      <Navbar userName={activeUser?.name} userRole={activeUser?.role || 'Customer'} />
      <div className="flex-1 w-full">{children}</div>
      <MobileNavigation />
      
      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 SalonPulse — Real-Time Salon Operations & Booking.</span>
          <span className="text-slate-400 font-medium">Live Operations Active</span>
        </div>
      </footer>
    </div>
  );
}
