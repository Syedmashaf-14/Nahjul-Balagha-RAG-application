'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  LogIn,
  LogOut,
  Check,
  BookOpen,
  Compass,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  link: string;
  type: 'wisdom' | 'library' | 'learning';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Daily Reflection Ready',
    description: 'Explore Saying 81: "The worth of every person is in what they do well."',
    time: '15m ago',
    read: false,
    link: '/explore?q=worth',
    type: 'wisdom',
  },
  {
    id: 'notif_2',
    title: 'Multi-Page Canonical PDFs',
    description: 'Complete multi-page English, Arabic, and Urdu editions are now available.',
    time: '1h ago',
    read: false,
    link: '/reader',
    type: 'library',
  },
  {
    id: 'notif_3',
    title: 'Learning Path Update',
    description: 'Letter 53 on Governance and Compassion is ready for your next lesson.',
    time: 'Yesterday',
    read: true,
    link: '/learn',
    type: 'learning',
  },
];

export function Topbar() {
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { language, setLanguage, isUrdu, t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { user, logout } = useAuth();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLanguageChange = (lang: 'english' | 'urdu') => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#ECE7DE] bg-[#FBF9F5]/90 backdrop-blur-md px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('topSearchPlaceholder')}
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
        {/* Notification Bell with interactive popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-[#58635B] hover:text-[#18231C] hover:bg-[#F3EFE8] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D96B43] ring-2 ring-[#FBF9F5]" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#ECE7DE] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm text-[#18231C]">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3EE] text-[#143E2E]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-[#143E2E] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#ECE7DE]/60 max-h-72 overflow-y-auto mt-2">
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => {
                      setNotificationsOpen(false);
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                      );
                    }}
                    className={`block py-3 px-2 rounded-xl hover:bg-[#FBF9F5] transition-colors ${
                      !item.read ? 'bg-[#FAF8F5]/80' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#18231C]">{item.title}</p>
                      <span className="text-[10px] text-[#8E877D] whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="text-xs text-[#58635B] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-[#ECE7DE] text-center">
                <Link
                  href="/reader"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-bold text-[#143E2E] hover:underline"
                >
                  Explore Canonical Library →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Language Selector Dropdown (English & Urdu) */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:border-[#D2E4D8] transition-all cursor-pointer shadow-2xs"
          >
            <span className={language === 'urdu' ? 'font-arabic text-sm' : ''}>
              {language === 'urdu' ? 'اردو' : 'EN'}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[#8E877D] transition-transform ${
                languageMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Language Options Dropdown */}
          {languageMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#ECE7DE] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D] px-2.5 py-1 block">
                {language === 'urdu' ? 'ترجمہ منتخب کریں' : 'Select Translation'}
              </span>

              <button
                type="button"
                onClick={() => handleLanguageChange('english')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                  language === 'english'
                    ? 'bg-[#EBF3EE] text-[#143E2E]'
                    : 'text-[#18231C] hover:bg-[#FBF9F5]'
                }`}
              >
                <div>
                  <span className="block">English (EN)</span>
                  <span className="text-[10px] text-[#8E877D] font-normal">Syed Ali Reza</span>
                </div>
                {language === 'english' && <Check className="w-3.5 h-3.5 text-[#143E2E]" />}
              </button>

              <button
                type="button"
                onClick={() => handleLanguageChange('urdu')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors mt-1 ${
                  language === 'urdu'
                    ? 'bg-[#EBF3EE] text-[#143E2E]'
                    : 'text-[#18231C] hover:bg-[#FBF9F5]'
                }`}
              >
                <div>
                  <span className="block font-arabic">اردو (UR)</span>
                  <span className="text-[10px] text-[#8E877D] font-normal">علامہ جوادی / مفتی جعفر</span>
                </div>
                {language === 'urdu' && <Check className="w-3.5 h-3.5 text-[#143E2E]" />}
              </button>
            </div>
          )}
        </div>

        {/* Ask Nahj AI Pill Button */}
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143E2E] hover:bg-[#0E2F23] text-white font-medium text-xs shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('askNahjAi')}</span>
        </Link>

        {/* User Auth Status */}
        {user.isGuest ? (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ECE7DE] hover:bg-[#F7F5F0] text-xs font-semibold text-[#18231C] transition-all ml-1"
          >
            <LogIn className="w-3.5 h-3.5 text-[#143E2E]" />
            <span>{t('signIn')}</span>
          </Link>
        ) : (
          <button
            onClick={logout}
            title={t('signOut')}
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
            {t('overview')}
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            {t('explore')}
          </Link>
          <Link
            href="/reader"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            {t('library')}
          </Link>
          <Link
            href="/learn"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            {t('myLearning')}
          </Link>
          <Link
            href="/bookmarks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#18231C]"
          >
            {t('saved')}
          </Link>
          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#143E2E]"
          >
            {t('askNahjAi')}
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-semibold text-[#58635B]"
          >
            {t('personalization')}
          </Link>
        </div>
      )}
    </header>
  );
}
