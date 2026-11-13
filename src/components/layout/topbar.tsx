'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Flame, Bell, Settings, Menu, X, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Topbar() {
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sermons, letters, sayings (e.g. Letter 53, Justice, Patience)..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all"
        />
      </form>

      {/* Mobile Title */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-bold text-sm tracking-tight text-white">Nahj al-Balagha</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Ask AI Pill Button */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Companion</span>
        </Link>

        {/* Daily Learning Streak */}
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>3 Days</span>
        </div>

        {/* Settings Shortcut */}
        <Link
          href="/settings"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 transition-colors"
          title="Personalization Preferences"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-800 p-4 space-y-2 md:hidden shadow-2xl">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teachings..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm"
            />
          </form>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-200"
          >
            Dashboard
          </Link>
          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-emerald-400 font-medium"
          >
            AI Companion
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-200"
          >
            Explore Passages
          </Link>
          <Link
            href="/learn"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-200"
          >
            Learning Paths
          </Link>
          <Link
            href="/bookmarks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-200"
          >
            Bookmarks
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-200"
          >
            Personalization Settings
          </Link>
        </div>
      )}
    </header>
  );
}
