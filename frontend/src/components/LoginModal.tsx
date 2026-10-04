import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, sendOtp, verifyOtp, updateProfile } = useAuth();

  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROFILE'>('PHONE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 'OTP' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendOtp(mobileNumber);
      setStep('OTP');
      setCountdown(30);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { newUser } = await verifyOtp(mobileNumber, otp);

      if (newUser) {
        setStep('PROFILE');
      } else {
        closeLoginModal();
        resetForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updateProfile(name.trim(), email.trim());
      closeLoginModal();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      setError(null);
      await sendOtp(mobileNumber);
      setCountdown(30);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('PHONE');
    setMobileNumber('');
    setOtp('');
    setName('');
    setEmail('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => {
          closeLoginModal();
          resetForm();
        }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            closeLoginModal();
            resetForm();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
            {step === 'PROFILE' ? <UserCheck className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'PHONE' && 'India’s Last Minute App'}
          </h2>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'OTP' && 'Verify Mobile Number'}
          </h2>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 'PROFILE' && 'Welcome to Blinkcart!'}
          </h2>

          <p className="text-xs text-slate-500 font-medium mt-1">
            {step === 'PHONE' && 'Log in or sign up in seconds for 10-minute delivery'}
            {step === 'OTP' && `Enter 6-digit OTP sent to +91 ${mobileNumber}`}
            {step === 'PROFILE' && 'Tell us your name to personalize your orders'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Phone input */}
        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="flex rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 overflow-hidden bg-slate-50">
                <span className="px-4 py-3 bg-slate-100 border-r border-slate-200 text-sm font-bold text-slate-700 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 bg-transparent text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mobileNumber.length !== 10}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 leading-tight">
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </form>
        )}

        {/* STEP 2: OTP input */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Change number
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-black text-slate-900 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
              <div className="mt-2 text-center">
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md font-mono">
                  💡 Dev Code: 123456
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="font-bold text-emerald-600 disabled:text-slate-400"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
            </button>
          </form>
        )}

        {/* STEP 3: Complete Profile (New User) */}
        {step === 'PROFILE' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : <span>Start Shopping</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
