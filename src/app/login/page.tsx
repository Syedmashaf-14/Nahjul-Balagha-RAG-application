'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function AuthPage() {
  const router = useRouter();
  const { login, setGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('english');
  const [explanationLevel, setExplanationLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || 'Registration failed');
          setLoading(false);
          return;
        }
      }

      // Update auth context state
      login(email, name || email.split('@')[0]);

      // Save initial preferences if registering
      if (activeTab === 'register') {
        await fetch('/api/users/me/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, explanationLevel }),
        }).catch(() => {});
      }

      router.push('/');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoName: string) => {
    login(demoEmail, demoName);
    router.push('/');
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
            {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-[#58635B] max-w-xs mx-auto">
            Access personalized learning paths, save reflection notes, and explore authentic Nahj al-Balagha teachings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full bg-[#FBF9F5] border border-[#ECE7DE] p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
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

        {error && (
          <div className="p-3 rounded-xl bg-[#FFF2EB] border border-[#F5D5C6] text-[#A25232] text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
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
                  required={activeTab === 'register'}
                />
              </div>
            </div>
          )}

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

          {activeTab === 'register' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-[#8E877D] uppercase block mb-1">
                  Language Preference
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs text-[#18231C]"
                >
                  <option value="english">English</option>
                  <option value="urdu">اردو (Urdu)</option>
                  <option value="arabic">العربية (Arabic)</option>
                  <option value="roman_urdu">Roman Urdu</option>
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{loading ? 'Processing...' : activeTab === 'login' ? 'Sign In to Platform' : 'Create My Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#ECE7DE]"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#8E877D]">
            Demo Accounts
          </span>
          <div className="flex-grow border-t border-[#ECE7DE]"></div>
        </div>

        {/* Demo Accounts */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleDemoLogin('student@knowledge.org', 'Ahmed Khan')}
            className="p-3 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/40 text-left transition-all"
          >
            <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider block">
              Intermediate Learner
            </span>
            <span className="text-xs font-semibold text-[#18231C] block mt-0.5">
              Ahmed Khan
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('researcher@knowledge.org', 'Dr. Farooq')}
            className="p-3 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/40 text-left transition-all"
          >
            <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider block">
              Governance Scholar
            </span>
            <span className="text-xs font-semibold text-[#18231C] block mt-0.5">
              Dr. Farooq
            </span>
          </button>
        </div>

        {/* Guest Access Button */}
        <button
          type="button"
          onClick={handleGuest}
          className="w-full py-2.5 rounded-full bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/30 text-[#58635B] hover:text-[#18231C] text-xs font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#143E2E]" />
          <span>Continue as Guest Seeker</span>
        </button>
      </div>
    </div>
  );
}
