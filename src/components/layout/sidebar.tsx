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
import { useLanguage } from '@/contexts/language-context';
import { getActiveStreak } from '@/lib/streak';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { language, isUrdu, t } = useLanguage();
  const [streak, setStreak] = useState(() => getActiveStreak());

  useEffect(() => {
    setStreak(getActiveStreak());
  }, []);

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
            {t('discover')}
          </span>
          <nav className="space-y-1">
            {[
              { name: t('overview'), href: '/', icon: Home },
              { name: t('explore'), href: '/explore', icon: Compass },
              { name: t('library'), href: '/reader', icon: BookOpen },
              { name: t('myLearning'), href: '/learn', icon: GraduationCap },
              { name: t('saved'), href: '/bookmarks', icon: Bookmark, badge: '1' },
              { name: t('notes'), href: '/notes', icon: FileText },
              { name: t('collections'), href: '/collections', icon: Layers },
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
                    <span className={isUrdu ? 'font-arabic text-sm' : ''}>{item.name}</span>
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
            {t('intelligence')}
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
                <span className={isUrdu ? 'font-arabic text-sm' : ''}>{t('askNahjAi')}</span>
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
                <span className={isUrdu ? 'font-arabic text-sm' : ''}>{t('personalization')}</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      {/* Daily Reflection Streak Card */}
      {!user.isGuest && (
        <div className="p-3.5 m-3 rounded-2xl bg-[#FDF6F2] border border-[#F5E6DC]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#F9E2D4] flex items-center justify-center text-[#D96B43]">
              <Flame className="w-3.5 h-3.5 fill-[#D96B43]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2A231F] block leading-none">
                {isUrdu ? `${streak.count} روزہ تسلسل` : `${streak.count} Day Streak`}
              </span>
              <span className="text-[10px] text-[#8E877D]">{isUrdu ? 'تسلسل مطالعہ و علم' : 'Active learning journey'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 mt-2">
            {streak.recentDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                    day.completed
                      ? 'bg-[#E5F2EB] text-[#143E2E] font-bold'
                      : 'bg-[#ECE7DE]/80 text-[#8E877D]'
                  }`}
                  title={`${day.dayName}: ${day.completed ? 'Completed' : 'Pending'}`}
                >
                  {day.completed ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                </div>
                <span className="text-[9px] text-[#8E877D] leading-none">{day.dayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-[#ECE7DE] flex items-center justify-between">
        <Link
          href={user.isGuest ? '/login' : '/settings'}
          className="flex items-center gap-2.5 w-full p-1.5 rounded-xl hover:bg-[#F7F5F0] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#E5ECE7] border border-[#D2E4D8] flex items-center justify-center text-xs font-bold text-[#143E2E] shrink-0">
            {user.isGuest ? (isUrdu ? 'قاری' : 'WU') : user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-[#18231C] truncate leading-tight">
              {user.isGuest ? t('welcomeUser') : user.name}
            </p>
            <p className="text-[10px] text-[#8E877D] truncate mt-0.5">
              {user.isGuest ? t('signInToTrack') : (isUrdu ? 'محقق و قاری' : 'Personalized Scholar')}
            </p>
          </div>
          <MoreVertical className="w-3.5 h-3.5 text-[#8E877D]" />
        </Link>
      </div>
    </aside>
  );
}
