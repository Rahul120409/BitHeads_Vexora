'use client';

import { useState } from 'react';
import Link from 'next/link';
import { customerService } from '../../services/customerService';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('❌ Password and Confirm Password do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await customerService.register({
        name,
        email,
        mobileNumber: phone,
        password,
        confirmPassword,
        role: 'CUSTOMER',
        userType: 'CUSTOMER'
      });

      // Navigate directly to Sign In form upon successful registration
      window.location.href = '/login?registered=true';
    } catch (err: any) {
      setErrorMessage(err.message || '❌ Registration failed. Please check your details.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-6 px-3.5 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] bg-amber-500/10 blur-[90px] sm:blur-[120px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-md mx-auto relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ✂
          </div>
          <div className="text-left">
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
              SalonPulse
            </span>
            <span className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-400/90 font-semibold -mt-1">
              Live Operations
            </span>
          </div>
        </Link>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Your Customer Account
        </h2>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            Sign In here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto relative z-10">
        <div className="bg-slate-900/90 border border-slate-800/90 py-6 px-4 sm:py-8 sm:px-8 shadow-2xl rounded-2xl sm:rounded-3xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                placeholder="e.g. Karan Malhotra"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                placeholder="karan@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile No (Phone Number)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-950/70 border rounded-xl text-white text-sm focus:outline-none transition-colors ${
                  confirmPassword.length > 0
                    ? confirmPassword === password
                      ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                      : 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                    : 'border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                }`}
                placeholder="••••••••"
              />
              {confirmPassword.length > 0 && (
                confirmPassword === password ? (
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    ✓ Passwords match successfully!
                  </span>
                ) : (
                  <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
                    ❌ Password is wrong
                  </span>
                )
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || (confirmPassword.length > 0 && password !== confirmPassword)}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Creating Account & Authenticating...</span>
                </>
              ) : (
                <span>Register & Open Home Page →</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>← Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
