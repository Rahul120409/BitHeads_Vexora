'use client';

import { useState } from 'react';
import Link from 'next/link';
import { customerService } from '../../services/customerService';

export default function LoginPage() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await customerService.login(email, password, selectedRole);
      if (user.role === 'CUSTOMER') {
        window.location.href = '/customer';
      } else if (user.role === 'STAFF') {
        window.location.href = '/staff';
      } else {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setErrorMessage(err.message || '❌ Login failed. Account not found or incorrect credentials.');
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

      // Direct navigation to home page upon successful registration & login
      window.location.href = '/customer';
    } catch (err: any) {
      setErrorMessage(err.message || '❌ Registration failed. Please check your details.');
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    setIsLoading(true);
    const demoEmail =
      role === 'CUSTOMER'
        ? 'rahul@example.com'
        : role === 'STAFF'
        ? 'raj@salonpulse.com'
        : 'admin@salonpulse.com';
    try {
      await customerService.login(demoEmail, 'password123', role);
      if (role === 'CUSTOMER') {
        window.location.href = '/customer';
      } else if (role === 'STAFF') {
        window.location.href = '/staff';
      } else {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            ✂
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
              SalonPulse
            </span>
            <span className="block text-[11px] uppercase tracking-widest text-amber-400/90 font-semibold -mt-1">
              Live Operations
            </span>
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {mode === 'LOGIN' ? 'Sign In to Your Account' : 'Register New Account'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {mode === 'LOGIN' ? (
            <>
              Or{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMessage('');
                }}
                className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4"
              >
                create a new customer profile
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage('');
                }}
                className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4"
              >
                Sign In here
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800/90 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl backdrop-blur-md">
          
          {/* Tab Navigation: Sign In / Register */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 Register
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
              {errorMessage.includes('Register') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setErrorMessage('');
                  }}
                  className="mt-1 self-start px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md hover:scale-105"
                >
                  📝 Click Here to Register First →
                </button>
              )}
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'LOGIN' ? (
            <>
              {/* Quick 1-Click Demo Logins Banner */}
              <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Hackathon 1-Click Demo Login
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Click below to jump directly to each role's dashboard:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('CUSTOMER')}
                    disabled={isLoading}
                    className="px-2 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 hover:scale-105"
                  >
                    <span>👤 Customer</span>
                    <span className="text-[10px] opacity-80">(Prapti)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('STAFF')}
                    disabled={isLoading}
                    className="px-2 py-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 hover:scale-105"
                  >
                    <span>✂ Staff</span>
                    <span className="text-[10px] opacity-80">(Raj)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    disabled={isLoading}
                    className="px-2 py-2.5 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 hover:scale-105"
                  >
                    <span>📊 Admin</span>
                    <span className="text-[10px] opacity-80">(Owner)</span>
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-900 text-slate-500 font-medium uppercase tracking-wider">
                    Or Sign In with Email
                  </span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Role Select
                  </label>
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
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
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
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-xs text-slate-500">Default: password123</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Authenticating via API...</span>
                    </>
                  ) : (
                    <span>Sign In as {selectedRole} →</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* MODE: REGISTER */
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
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
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
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
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
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
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
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
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-950/70 border rounded-xl text-white text-sm focus:outline-none transition-colors ${
                    regConfirmPassword.length > 0
                      ? regConfirmPassword === regPassword
                        ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                      : 'border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                  }`}
                  placeholder="••••••••"
                />
                {regConfirmPassword.length > 0 && (
                  regConfirmPassword === regPassword ? (
                    <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                      ✓ Passwords match successfully!
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-semibold mt-1 block">
                      ❌ Confirm Password does not match Password
                    </span>
                  )
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || (regConfirmPassword.length > 0 && regPassword !== regConfirmPassword)}
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
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
            >
              <span>← Back to SalonPulse Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
