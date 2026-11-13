'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  GraduationCap,
  Bookmark,
  FileText,
  Sliders,
  Home,
  Layers,
  Sparkles,
  Flame,
  Check,
  MoreVertical,
  LogIn,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isCurrent = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-[#ECE7DE] flex flex-col fixed inset-y-0 left-0 z-40 hidden md:flex">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#ECE7DE]/70 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#143E2E] flex items-center justify-center text-[#FBF9F5] font-serif font-bold text-xl shadow-sm">
          ن
        </div>
        <div>
          <h1 className="font-serif-title font-bold text-lg text-[#18231C] tracking-tight leading-none">
            Nahj
          </h1>
          <p className="text-[11px] text-[#8E877D] font-medium mt-1">Path of Eloquence</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
        {/* Discover Section */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D] px-3 block mb-2">
            Discover
          </span>
          <nav className="space-y-1">
            {[
              { name: 'Overview', href: '/', icon: Home },
              { name: 'Explore', href: '/explore', icon: Compass },
              { name: 'Canonical Library & PDFs', href: '/reader', icon: BookOpen },
              { name: 'My learning', href: '/learn', icon: GraduationCap },
              { name: 'Saved', href: '/bookmarks', icon: Bookmark, badge: '1' },
              { name: 'Notes', href: '/notes', icon: FileText },
              { name: 'Collections', href: '/collections', icon: Layers },
            ].map((item) => {
              const active = isCurrent(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#EBF3EE] text-[#143E2E] border border-[#D2E4D8] shadow-xs'
                      : 'text-[#58635B] hover:text-[#18231C] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? 'text-[#143E2E]' : 'text-[#8E877D]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E1EDE6] text-[#143E2E]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Intelligence Section */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D] px-3 block mb-2">
            Intelligence
          </span>
          <nav className="space-y-1">
            <Link
              href="/chat"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/chat')
                  ? 'bg-[#EBF3EE] text-[#143E2E] border border-[#D2E4D8]'
                  : 'text-[#58635B] hover:text-[#18231C] hover:bg-[#F7F5F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles
                  className={`w-4 h-4 ${
                    isCurrent('/chat') ? 'text-[#143E2E]' : 'text-[#8E877D]'
                  }`}
                />
                <span>Ask Nahj AI</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EBF3EE] text-[#143E2E] border border-[#D2E4D8]">
                AI
              </span>
            </Link>

            <Link
              href="/settings"
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent('/settings')
                  ? 'bg-[#EBF3EE] text-[#143E2E] border border-[#D2E4D8]'
                  : 'text-[#58635B] hover:text-[#18231C] hover:bg-[#F7F5F0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders
                  className={`w-4 h-4 ${
                    isCurrent('/settings') ? 'text-[#143E2E]' : 'text-[#8E877D]'
                  }`}
                />
                <span>Personalization</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      {/* Daily Reflection Streak Card */}
      <div className="p-3.5 m-3 rounded-2xl bg-[#FDF6F2] border border-[#F5E6DC]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md bg-[#F9E2D4] flex items-center justify-center text-[#D96B43]">
            <Flame className="w-3.5 h-3.5 fill-[#D96B43]" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#2A231F] block leading-none">
              Daily reflection
            </span>
            <span className="text-[10px] text-[#8E877D]">5 day learning streak</span>
          </div>
        </div>

        {/* 5 Streak Bubbles */}
        <div className="flex items-center gap-1.5 mt-2">
          {[1, 2, 3, 4, 5].map((d) => (
            <div
              key={d}
              className="w-5 h-5 rounded-full bg-[#E5F2EB] flex items-center justify-center text-[#143E2E]"
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          ))}
          <div className="w-5 h-5 rounded-full bg-[#ECE7DE]/80" />
          <div className="w-5 h-5 rounded-full bg-[#ECE7DE]/80" />
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-[#ECE7DE] flex items-center justify-between">
        <Link
          href={user.isGuest ? '/login' : '/settings'}
          className="flex items-center gap-2.5 w-full p-1.5 rounded-xl hover:bg-[#F7F5F0] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#E5ECE7] border border-[#D2E4D8] flex items-center justify-center text-xs font-bold text-[#143E2E] shrink-0">
            {user.isGuest ? 'AK' : user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-[#18231C] truncate leading-tight">
              {user.isGuest ? 'Ahmed Khan' : user.name}
            </p>
            <p className="text-[10px] text-[#8E877D] truncate mt-0.5">
              {user.isGuest ? 'Intermediate learner' : 'Personalized Scholar'}
            </p>
          </div>
          <MoreVertical className="w-3.5 h-3.5 text-[#8E877D]" />
        </Link>
      </div>
    </aside>
  );
}
