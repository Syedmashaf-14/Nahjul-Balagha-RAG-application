'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Compass,
  GraduationCap,
  Bookmark,
  FileText,
  Sliders,
  BookOpen,
  Home,
  Layers,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'AI Companion', href: '/chat', icon: Sparkles, badge: 'RAG' },
  { name: 'Explore Passages', href: '/explore', icon: Compass },
  { name: 'Learning Paths', href: '/learn', icon: GraduationCap },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Notes & Reflections', href: '/notes', icon: FileText },
  { name: 'Collections', href: '/collections', icon: Layers },
  { name: 'Personalization', href: '/settings', icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col fixed inset-y-0 left-0 z-40 hidden md:flex">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
          <BookOpen className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            Nahj al-Balagha
          </h1>
          <p className="text-xs text-emerald-400/90 font-medium">AI Knowledge Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Subtle Quote at bottom */}
      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/20">
        <p className="text-[11px] font-arabic text-emerald-300 text-right mb-1">
          قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ
        </p>
        <p className="text-[10px] text-slate-400 italic">
          &ldquo;The value of every person is that which they do well.&rdquo;
        </p>
      </div>

      {/* User Badge */}
      <div className="p-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-semibold text-emerald-300">
            A
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-200">Seeker of Wisdom</p>
            <p className="text-[10px] text-emerald-400">Personalized Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
