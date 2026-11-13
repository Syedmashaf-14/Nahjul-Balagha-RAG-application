'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Sparkles, Menu, X, ChevronDown, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export function Topbar() {
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#ECE7DE] bg-[#FBF9F5]/90 backdrop-blur-md px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Search Bar matching screenshot */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sermons, letters, sayings..."
          className="w-full pl-10 pr-12 py-2 bg-white border border-[#ECE7DE] rounded-xl text-xs text-[#18231C] placeholder-[#8E877D] focus:outline-none focus:border-[#143E2E] focus:ring-1 focus:ring-[#143E2E] transition-all shadow-2xs"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-[#F4F1EA] border border-[#E5E0D6] text-[10px] text-[#8E877D] font-mono">
          ⌘ K
        </div>
      </form>

      {/* Mobile Title */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#58635B] hover:text-[#18231C]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="w-7 h-7 rounded-lg bg-[#143E2E] flex items-center justify-center text-[#FBF9F5] font-serif font-bold text-sm">
          ن
        </div>
        <span className="font-serif-title font-bold text-base text-[#18231C]">Nahj</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl text-[#58635B] hover:text-[#18231C] hover:bg-[#F3EFE8] transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Language Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] cursor-pointer hover:border-[#D2E4D8]">
          <span>EN</span>
          <ChevronDown className="w-3 h-3 text-[#8E877D]" />
        </div>

        {/* Ask Nahj AI Pill Button */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143E2E] hover:bg-[#0E2F23] text-white font-medium text-xs shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Nahj AI</span>
        </Link>

        {/* User Auth Status */}
        {user.isGuest ? (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ECE7DE] hover:bg-[#F7F5F0] text-xs font-semibold text-[#18231C] transition-all ml-1"
          >
            <LogIn className="w-3.5 h-3.5 text-[#143E2E]" />
            <span>Sign In</span>
          </Link>
        ) : (
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl text-[#8E877D] hover:text-red-600 hover:bg-[#F3EFE8] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-[#ECE7DE] p-4 space-y-2 md:hidden shadow-xl">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sermons, letters, sayings..."
              className="w-full px-3 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs"
            />
          </form>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            Overview
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            Explore
          </Link>
          <Link
            href="/learn"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            My learning
          </Link>
          <Link
            href="/bookmarks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            Saved Passages
          </Link>
          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#143E2E]"
          >
            Ask Nahj AI
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#58635B]"
          >
            Personalization
          </Link>
        </div>
      )}
    </header>
  );
}
