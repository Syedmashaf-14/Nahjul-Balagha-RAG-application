'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  KeyRound,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function AuthPage() {
  const router = useRouter();
  const { login, setGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'english' | 'urdu'>('english');
  const [explanationLevel, setExplanationLevel] = useState('intermediate');

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In production/development session handler
      login(email, email.split('@')[0]);
      router.push('/');
    } catch {
      setError('Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP for New Registration
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          language,
          explanationLevel,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to dispatch verification code');
        setLoading(false);
        return;
      }

      setDispatchedOtp(json.data?.devOtp || null);
      setInfoMessage(`A 6-digit verification code has been dispatched to ${email}`);
      setOtpStep(true);
    } catch {
      setError('Network error while requesting verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Complete Registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Invalid or expired code. Please try again.');
        setLoading(false);
        return;
      }

      // Success! Update auth context and redirect
      login(email, name);
      router.push('/');
    } catch {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuest();
    router.push('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white max-w-md w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-9 space-y-6 shadow-xs relative">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Logo badge with Arabic 'ن' */}
          <div className="w-12 h-12 rounded-2xl bg-[#143E2E] flex items-center justify-center text-white mx-auto shadow-xs mb-3">
            <span className="font-arabic text-2xl font-bold leading-none">ن</span>
          </div>

          <h1 className="text-2xl font-serif font-bold text-[#18231C]">
            {activeTab === 'login'
              ? 'Welcome Back'
              : otpStep
              ? 'Verify Your Email'
              : 'Create Your Account'}
          </h1>
          <p className="text-xs text-[#58635B] max-w-xs mx-auto">
            {otpStep
              ? `Enter the 6-digit code sent to ${email}`
              : 'Access personalized learning paths, save reflection notes, and explore authentic Nahj al-Balagha teachings.'}
          </p>
        </div>

        {/* Tab Switcher (Only shown when not on OTP step) */}
        {!otpStep && (
          <div className="flex rounded-full bg-[#FBF9F5] border border-[#ECE7DE] p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setInfoMessage(null);
              }}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'login'
                  ? 'bg-[#143E2E] text-white shadow-xs'
                  : 'text-[#58635B] hover:text-[#18231C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError(null);
                setInfoMessage(null);
              }}
              className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-[#143E2E] text-white shadow-xs'
                  : 'text-[#58635B] hover:text-[#18231C]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FFF2EB] border border-[#F5D5C6] text-[#A25232] text-xs text-center leading-relaxed">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="p-3 rounded-xl bg-[#EBF3EE] border border-[#D2E4D8] text-[#143E2E] text-xs text-center leading-relaxed">
            {infoMessage}
          </div>
        )}

        {/* Verification Code Testing Helper Banner */}
        {otpStep && dispatchedOtp && (
          <div className="p-3 rounded-2xl bg-[#F0ECE1] border border-[#D4CBB8] text-[#5A4526] text-xs text-center space-y-1">
            <span className="font-bold text-[11px] uppercase tracking-wider block">
              🔐 Verification Code:
            </span>
            <div className="text-xl font-mono font-bold tracking-widest text-[#143E2E]">
              {dispatchedOtp}
            </div>
            <p className="text-[10px] text-[#7A684C]">
              (Dispatched to your email; entered below to activate account)
            </p>
          </div>
        )}

        {/* 1. Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#58635B] uppercase block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seeker@knowledge.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#58635B] uppercase block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Platform'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 2. Registration Step 1: User Details */}
        {activeTab === 'register' && !otpStep && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#58635B] uppercase block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ali Reza"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#58635B] uppercase block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seeker@knowledge.org"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#58635B] uppercase block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs md:text-sm text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-[#8E877D] uppercase block mb-1">
                  Language Preference
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs text-[#18231C]"
                >
                  <option value="english">English (Default)</option>
                  <option value="urdu">اردو (Urdu)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E877D] uppercase block mb-1">
                  Knowledge Level
                </label>
                <select
                  value={explanationLevel}
                  onChange={(e) => setExplanationLevel(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs text-[#18231C]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <span>{loading ? 'Sending Code...' : 'Send 6-Digit Verification Code'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 3. Registration Step 2: Enter & Verify OTP */}
        {activeTab === 'register' && otpStep && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#58635B] uppercase block mb-1 text-center">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-center text-xl font-mono tracking-widest text-[#18231C] focus:outline-none focus:border-[#143E2E]"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || enteredOtp.length !== 6}
              className="w-full py-3 rounded-full bg-[#143E2E] hover:bg-[#194B37] disabled:bg-[#8E877D]/40 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Verify Code & Complete Sign Up'}</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-[#58635B] hover:text-[#18231C] flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Details</span>
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[#143E2E] font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend Code</span>
              </button>
            </div>
          </form>
        )}

        {/* Guest Access Button */}
        {!otpStep && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGuest}
              className="w-full py-2.5 rounded-full bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/30 text-[#58635B] hover:text-[#18231C] text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#143E2E]" />
              <span>Continue as Guest Seeker</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
