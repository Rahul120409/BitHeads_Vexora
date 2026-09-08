'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { useTheme } from '@/hooks/useTheme';

export default function LoginPage() {
  const { isDark, toggle, mounted } = useTheme();
  const d = mounted ? isDark : true;

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'STAFF' | 'ADMIN'>('CUSTOMER');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('registered=true')) {
      setSuccessMessage('🎉 Registration successful! Please Sign In now with your registered credentials.');
      setMode('LOGIN');
    }
  }, []);

  // Shared redirect helper — checks userType first, then role
  const redirectByUser = (user: { role?: string; userType?: string }, fallbackRole?: string) => {
    const effective = (user.userType || user.role || fallbackRole || 'CUSTOMER').toUpperCase().trim();
    if (effective === 'ADMIN') {
      window.location.href = '/admin';
    } else if (effective === 'STAFF') {
      window.location.href = '/staff';
    } else {
      window.location.href = '/customer';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await customerService.login(email, password, selectedRole);
      redirectByUser(user, selectedRole);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('password') || msg.includes('Incorrect')) {
        setErrorMessage('❌ Wrong password. Please check your password and try again.');
      } else {
        setErrorMessage(msg || '❌ Login failed. Please check your details and try again.');
      }
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('❌ Password and Confirm Password do not match. Please verify both fields.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await customerService.register({
        name: regName,
        email: regEmail,
        mobileNumber: regMobile,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: 'CUSTOMER',
        userType: 'CUSTOMER'
      });
      setEmail(regEmail);
      setPassword(regPassword);
      setSuccessMessage('🎉 Registration successful! Please Sign In now with your registered email and password.');
      setMode('LOGIN');
      setIsLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || '❌ Registration failed. Please check your details.');
      setIsLoading(false);
    }
  };

  // Shared input class
  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors border ${
    d
      ? 'bg-slate-950/70 border-slate-700 text-white placeholder-slate-500'
      : 'bg-gray-50 border-gray-300 text-slate-900 placeholder-slate-400'
  }`;

  const labelCls = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${d ? 'text-slate-300' : 'text-slate-600'}`;

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-6 px-3.5 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300"
      style={{
        backgroundColor: d ? '#020617' : '#f9fafb',
        color: d ? '#f1f5f9' : '#0f172a'
      }}
    >
      {/* Ambient glow */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] ${d ? 'bg-amber-500/10' : 'bg-amber-400/20'} blur-[90px] sm:blur-[120px] pointer-events-none rounded-full`}></div>

      {/* Theme toggle — top right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggle}
          title={d ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 ${d ? 'border-slate-700 bg-slate-800/70 text-amber-400 hover:bg-slate-700' : 'border-amber-300 bg-white text-amber-600 hover:bg-amber-50'} shadow-md`}
        >
          {d ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Brand + Title */}
      <div className="w-full max-w-md mx-auto relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ✂
          </div>
          <div className="text-left">
            <span className={`text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r ${d ? 'from-white via-slate-200 to-amber-400' : 'from-slate-900 via-slate-700 to-amber-500'} bg-clip-text text-transparent`}>
              SalonPulse
            </span>
            <span className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-500 font-semibold -mt-1">
              Live Operations
            </span>
          </div>
        </Link>
        <h2 className={`text-xl sm:text-3xl font-extrabold ${d ? 'text-white' : 'text-slate-900'} tracking-tight`}>
          {mode === 'LOGIN' ? 'Sign In to Your Account' : 'Register New Account'}
        </h2>
        <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm ${d ? 'text-slate-400' : 'text-slate-500'}`}>
          {mode === 'LOGIN' ? (
            <>Or{' '}<button type="button" onClick={() => { setMode('REGISTER'); setErrorMessage(''); }} className="font-semibold text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-4">create a new customer profile</button></>
          ) : (
            <>Already registered?{' '}<button type="button" onClick={() => { setMode('LOGIN'); setErrorMessage(''); }} className="font-semibold text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-4">Sign In here</button></>
          )}
        </p>
      </div>

      {/* Card */}
      <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto relative z-10">
        <div className={`${d ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-gray-200'} border py-6 px-4 sm:py-8 sm:px-8 shadow-2xl rounded-2xl sm:rounded-3xl backdrop-blur-md transition-colors duration-300`}>

          {/* Tab Nav */}
          <div className={`flex ${d ? 'bg-slate-950/80 border-slate-800' : 'bg-gray-100 border-gray-200'} p-1.5 rounded-xl border mb-6`}>
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'LOGIN' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : d ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'REGISTER' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : d ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              📝 Register
            </button>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-semibold flex items-center gap-2">
              <span>🎉</span><span>{successMessage}</span>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-500 text-xs font-semibold flex flex-col gap-2">
              <div className="flex items-center gap-2"><span>⚠️</span><span>{errorMessage}</span></div>
              {errorMessage.includes('Register') && (
                <button type="button" onClick={() => { setMode('REGISTER'); setErrorMessage(''); }} className="mt-1 self-start px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:scale-105">
                  📝 Click Here to Register First →
                </button>
              )}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'LOGIN' ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={labelCls}>Role Select</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CUSTOMER', 'STAFF', 'ADMIN'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role);
                        if (role === 'CUSTOMER') setEmail('prapti@example.com');
                        else if (role === 'STAFF') setEmail('raj@salonpulse.com');
                        else setEmail('admin@salonpulse.com');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedRole === role
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : d
                          ? 'bg-slate-950/60 text-slate-400 border-slate-700 hover:border-slate-600'
                          : 'bg-gray-100 text-slate-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="name@example.com" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-semibold uppercase tracking-wider ${d ? 'text-slate-300' : 'text-slate-600'}`}>Password</label>
                  <span className={`text-xs ${d ? 'text-slate-500' : 'text-slate-400'}`}>Default: password123</span>
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-3 px-4 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (
                  <><svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Authenticating via API...</span></>
                ) : (
                  <span>Sign In as {selectedRole} →</span>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} className={inputCls} placeholder="e.g. Karan Malhotra" />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputCls} placeholder="karan@example.com" />
              </div>
              <div>
                <label className={labelCls}>Mobile No (Phone Number)</label>
                <input type="tel" required value={regMobile} onChange={(e) => setRegMobile(e.target.value)} className={inputCls} placeholder="9876543210" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors border ${
                    regConfirmPassword.length > 0
                      ? regConfirmPassword === regPassword
                        ? 'border-emerald-500 focus:ring-emerald-400'
                        : 'border-rose-500 focus:ring-rose-400'
                      : d ? 'border-slate-700 focus:ring-amber-400' : 'border-gray-300 focus:ring-amber-400'
                  } ${d ? 'bg-slate-950/70 text-white placeholder-slate-500' : 'bg-gray-50 text-slate-900 placeholder-slate-400'}`}
                  placeholder="••••••••"
                />
                {regConfirmPassword.length > 0 && (
                  regConfirmPassword === regPassword
                    ? <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">✓ Passwords match successfully!</span>
                    : <span className="text-[11px] text-rose-500 font-semibold mt-1 block">❌ Password is wrong</span>
                )}
              </div>

              <button type="submit" disabled={isLoading || (regConfirmPassword.length > 0 && regPassword !== regConfirmPassword)} className="w-full py-3 px-4 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (
                  <><svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Creating Account &amp; Authenticating...</span></>
                ) : (
                  <span>Register &amp; Go to Sign In →</span>
                )}
              </button>
            </form>
          )}

          {/* Back link */}
          <div className={`mt-6 pt-5 border-t ${d ? 'border-slate-800' : 'border-gray-200'} text-center`}>
            <Link href="/" className={`text-xs ${d ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors inline-flex items-center gap-1`}>
              <span>← Back to SalonPulse Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
