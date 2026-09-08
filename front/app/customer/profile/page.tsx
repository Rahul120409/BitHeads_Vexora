'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '../../../components/customer/ThemeContext';
import Navbar from '../../../components/customer/Navbar';
import MobileNavigation from '../../../components/customer/MobileNavigation';
import { customerService } from '../../../services/customerService';
import { CustomerUser, mockCustomer } from '../../../mock/customerMock';

function ProfileContent() {
  const { isLight } = useTheme();
  const [user, setUser] = useState<CustomerUser>(mockCustomer);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredStylist, setPreferredStylist] = useState('Raj Malhotra');
  const [preferredSalon, setPreferredSalon] = useState('SalonPulse Downtown Studio');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = customerService.getCurrentUser() || mockCustomer;
    setUser(current);
    setName(current.name);
    setEmail(current.email);
    setPhone(current.phone);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerUser = {
      ...user,
      name,
      email,
      phone
    };
    customerService.setCurrentUser(updated);
    setUser(updated);
    setToastMessage('✨ Profile updated successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div
      className={`min-h-screen transition-colors font-sans pb-16 md:pb-0 ${
        isLight ? 'bg-[#fff8f4] text-[#1e1b18]' : 'bg-[#0B0F17] text-slate-100'
      }`}
    >
      <Navbar userName={name || user.name} userRole="Privilège Member" />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold animate-bounce bg-[#121826] border-amber-500 text-amber-300">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-inherit">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
            Account & Membership
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight mt-1 ${
            isLight ? 'text-[#6f331d] font-serif' : 'text-white'
          }`}>
            Client Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm opacity-75 mt-1">
            Manage your contact information, preferred salon branches, and booking diagnostics.
          </p>
        </div>

        {/* Profile Card & Edit Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Membership Card */}
          <div className={`p-6 rounded-2xl border flex flex-col items-center text-center shadow-md h-fit ${
            isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
          }`}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#8c4a32] to-[#6f331d] text-white font-black text-2xl flex items-center justify-center shadow-lg mb-4">
              {name.split(' ').map(n => n[0]).join('') || 'RS'}
            </div>

            <h2 className="text-lg font-bold">{name}</h2>
            <p className="text-xs opacity-60">{email}</p>

            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLight ? 'bg-[#ffdbce] text-[#6f331d]' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              Étoile d&apos;Or Member
            </div>

            <div className="mt-6 w-full pt-4 border-t border-inherit text-xs space-y-2 text-left opacity-80">
              <div className="flex justify-between">
                <span>Total Treatments:</span>
                <strong className="font-bold">5 Visits</strong>
              </div>
              <div className="flex justify-between">
                <span>Sanctuary Hours:</span>
                <strong className="font-bold">8.5 hrs</strong>
              </div>
              <div className="flex justify-between">
                <span>Favorite Barber:</span>
                <strong className="font-bold">Raj Malhotra</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className={`md:col-span-2 p-6 sm:p-8 rounded-2xl border shadow-md ${
            isLight ? 'bg-white border-[#e9e1dc]' : 'bg-[#121826] border-slate-800'
          }`}>
            <h3 className="text-base font-bold mb-4 pb-2 border-b border-inherit">
              Edit Profile Details
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider opacity-70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-[#f4ece7] border-[#d9c2ba] focus:border-[#6f331d]'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider opacity-70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-[#f4ece7] border-[#d9c2ba] focus:border-[#6f331d]'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider opacity-70 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-[#f4ece7] border-[#d9c2ba] focus:border-[#6f331d]'
                      : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider opacity-70 mb-1">
                    Favored Stylist
                  </label>
                  <select
                    value={preferredStylist}
                    onChange={(e) => setPreferredStylist(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isLight
                        ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#1e1b18]'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Raj Malhotra">Raj Malhotra (Master Stylist)</option>
                    <option value="Amit Verma">Amit Verma (Senior Barber)</option>
                    <option value="Priya Kapoor">Priya Kapoor (Spa Specialist)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider opacity-70 mb-1">
                    Home Salon Studio
                  </label>
                  <select
                    value={preferredSalon}
                    onChange={(e) => setPreferredSalon(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isLight
                        ? 'bg-[#f4ece7] border-[#d9c2ba] text-[#1e1b18]'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    <option value="SalonPulse Downtown Studio">SalonPulse Downtown Studio</option>
                    <option value="Atelier Éthéré Sanctuary">Atelier Éthéré Luxury Sanctuary</option>
                    <option value="The Urban Barber & Grooming Club">The Urban Barber Lounge</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-inherit flex items-center justify-end">
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                    isLight
                      ? 'bg-[#6f331d] hover:bg-[#8c4a32] text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

        </div>

      </main>
      <MobileNavigation />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ThemeProvider>
      <ProfileContent />
    </ThemeProvider>
  );
}
