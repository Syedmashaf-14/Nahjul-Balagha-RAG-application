'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  Bookmark,
  FileText,
  Layers,
  Home,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';

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

const NOTIF_STORAGE_KEY = 'nahj_notifications_v3';

export function Topbar() {
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { language, setLanguage, isUrdu, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Load persistent notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read notifications from storage:', e);
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not persist notifications:', e);
    }
  };

  const isCurrent = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setMobileMenuOpen(false);
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLanguageChange = (lang: 'english' | 'urdu') => {
    setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  const markAllNotificationsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  const markNotificationRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setNotificationsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[#ECE7DE] bg-[#FBF9F5]/90 backdrop-blur-md px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between">
        {/* Search Bar - Desktop & Tablet */}
        <form onSubmit={handleSearch} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md hidden sm:block">
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

        {/* Mobile Header Brand & Hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 rounded-xl text-[#58635B] hover:text-[#18231C] hover:bg-[#F3EFE8] active:bg-[#ECE7DE] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-[#143E2E] flex items-center justify-center text-[#FBF9F5] font-serif font-bold text-sm shadow-xs">
              ن
            </div>
            <span className="font-serif-title font-bold text-base text-[#18231C]">Nahj</span>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
              className="p-2 rounded-xl text-[#58635B] hover:text-[#18231C] hover:bg-[#F3EFE8] transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D96B43] ring-2 ring-[#FBF9F5]" />
              )}
            </button>

            {/* Notifications Dropdown / Mobile Floating Modal */}
            {notificationsOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div
                  className="fixed inset-0 bg-[#18231C]/30 backdrop-blur-2xs z-40 sm:hidden"
                  onClick={() => setNotificationsOpen(false)}
                />

                <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-88 max-w-[calc(100vw-24px)] bg-white border border-[#ECE7DE] rounded-2xl shadow-2xl sm:shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#18231C] uppercase tracking-wider">
                        {isUrdu ? 'اطلاعات' : 'Notifications'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EBF3EE] text-[#143E2E]">
                          {unreadCount} {isUrdu ? 'نئی' : 'New'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-[#143E2E] dark:text-[#52B788] font-medium hover:underline cursor-pointer"
                        >
                          {isUrdu ? 'سب پڑھ لی گئیں' : 'Mark all read'}
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] text-[#8E877D] hover:text-[#D96B43] font-medium transition-colors cursor-pointer"
                        >
                          {isUrdu ? 'صاف کریں' : 'Clear all'}
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg text-[#8E877D] hover:text-[#18231C] sm:hidden cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-[#ECE7DE]/60 dark:divide-[#28392F]/60 max-h-[60vh] sm:max-h-80 overflow-y-auto mt-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#8E877D]">
                        {isUrdu ? 'کوئی نئی اطلاع موجود نہیں ہے' : 'No notifications'}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`group relative flex items-start justify-between gap-2 py-3 px-2 rounded-xl hover:bg-[#FBF9F5] dark:hover:bg-[#1E2C22] transition-colors ${
                            !n.read ? 'bg-[#FDFBF7] dark:bg-[#19261E]' : ''
                          }`}
                        >
                          <Link
                            href={n.link}
                            onClick={() => markNotificationRead(n.id)}
                            className="flex-1 pr-6"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-[#18231C] dark:text-[#F3EFE8] leading-snug">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-[#8E877D] shrink-0 font-mono">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#58635B] dark:text-[#A7A29A] mt-1 leading-relaxed line-clamp-2">
                              {n.description}
                            </p>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => dismissNotification(n.id, e)}
                            title="Dismiss"
                            aria-label="Dismiss notification"
                            className="opacity-0 group-hover:opacity-100 text-[#8E877D] hover:text-[#D96B43] p-1 transition-opacity cursor-pointer shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-[#58635B] hover:text-[#18231C] hover:bg-[#F3EFE8] dark:hover:bg-[#1E2C22] transition-colors cursor-pointer border border-[#ECE7DE] bg-white shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#E9C46A]" />
            ) : (
              <Moon className="w-4 h-4 text-[#143E2E]" />
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#ECE7DE] bg-white hover:bg-[#F7F5F0] text-xs font-semibold text-[#18231C] transition-all cursor-pointer shadow-2xs"
            >
              <span className={language === 'urdu' ? 'font-arabic' : 'font-mono'}>
                {language === 'urdu' ? 'اردو' : 'EN'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8E877D]" />
            </button>

            {/* Language Dropdown Menu */}
            {languageMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 max-w-[calc(100vw-24px)] bg-white border border-[#ECE7DE] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8E877D] border-b border-[#ECE7DE]/70 mb-1">
                  Language Preference
                </div>

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
                    <span className="text-[10px] text-[#8E877D] font-normal">علامہ مفتی جعفر حسین</span>
                  </div>
                  {language === 'urdu' && <Check className="w-3.5 h-3.5 text-[#143E2E]" />}
                </button>
              </div>
            )}
          </div>

          {/* Ask Nahj AI Pill Button */}
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#143E2E] hover:bg-[#0E2F23] text-white font-medium text-xs shadow-xs transition-all"
            title={t('askNahjAi')}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F2D07C]" />
            <span className="hidden sm:inline">{t('askNahjAi')}</span>
          </Link>

          {/* User Auth Status */}
          {user.isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-[#ECE7DE] hover:bg-[#F7F5F0] text-xs font-semibold text-[#18231C] transition-all shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#143E2E]" />
              <span className="hidden sm:inline">{t('signIn')}</span>
            </Link>
          ) : (
            <button
              onClick={logout}
              title={t('signOut')}
              className="p-1.5 sm:p-2 rounded-xl text-[#8E877D] hover:text-red-600 hover:bg-[#F3EFE8] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* FULL-FEATURED MOBILE DRAWER & BACKDROP */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#18231C]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#ECE7DE] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#143E2E] flex items-center justify-center text-[#FBF9F5] font-serif font-bold text-lg shadow-sm">
                  ن
                </div>
                <div>
                  <h2 className="font-serif-title font-bold text-base text-[#18231C] leading-none">
                    Nahj
                  </h2>
                  <p className="text-[10px] text-[#8E877D] font-medium mt-0.5">
                    Path of Eloquence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-[#8E877D] hover:text-[#18231C] hover:bg-[#FBF9F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search in Drawer */}
            <div className="p-4 pb-2 border-b border-[#ECE7DE]/60">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E877D]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('topSearchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs text-[#18231C] placeholder-[#8E877D] focus:outline-none focus:border-[#143E2E]"
                />
              </form>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
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
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? 'bg-[#EBF3EE] text-[#143E2E] border border-[#D2E4D8]'
                            : 'text-[#58635B] hover:text-[#18231C] hover:bg-[#F7F5F0]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 ${
                              active ? 'text-[#143E2E]' : 'text-[#8E877D]'
                            }`}
                          />
                          <span className={isUrdu ? 'font-arabic text-xs' : ''}>{item.name}</span>
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

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D] px-3 block mb-2">
                  {t('intelligence')}
                </span>
                <nav className="space-y-1">
                  <Link
                    href="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
                      <span className={isUrdu ? 'font-arabic text-xs' : ''}>{t('askNahjAi')}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EBF3EE] text-[#143E2E] border border-[#D2E4D8]">
                      AI
                    </span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent('/settings')
                        ? 'bg-[#EBF3EE] text-[#143E2E]'
                        : 'text-[#58635B] hover:text-[#18231C] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders
                        className={`w-4 h-4 ${
                          isCurrent('/settings') ? 'text-[#143E2E]' : 'text-[#8E877D]'
                        }`}
                      />
                      <span className={isUrdu ? 'font-arabic text-xs' : ''}>{t('personalization')}</span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-[#58635B] hover:text-[#18231C] hover:bg-[#F7F5F0] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-[#E9C46A]" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#143E2E]" />
                      )}
                      <span>{theme === 'dark' ? 'Light Mode / روشن موڈ' : 'Dark Mode / ڈارک موڈ'}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[#8E877D]">
                      {theme}
                    </span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Drawer User Footer */}
            <div className="p-3 border-t border-[#ECE7DE] bg-[#FBF9F5]">
              <Link
                href={user.isGuest ? '/login' : '/settings'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 w-full p-2 rounded-xl hover:bg-white transition-colors"
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
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ECE7DE] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { name: t('overview'), href: '/', icon: Home },
          { name: t('explore'), href: '/explore', icon: Compass },
          { name: t('askNahjAi'), href: '/chat', icon: Sparkles, isAi: true },
          { name: t('library'), href: '/reader', icon: BookOpen },
          { name: t('saved'), href: '/bookmarks', icon: Bookmark },
        ].map((tab) => {
          const active = isCurrent(tab.href);
          const Icon = tab.icon;

          if (tab.isAi) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
                    active
                      ? 'bg-[#143E2E] text-[#F2D07C] ring-4 ring-[#EBF3EE]'
                      : 'bg-[#143E2E] text-white hover:bg-[#194B37]'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-[#F2D07C]" />
                </div>
                <span
                  className={`text-[9px] font-bold mt-0.5 ${
                    active ? 'text-[#143E2E]' : 'text-[#8E877D]'
                  }`}
                >
                  {isUrdu ? 'اے آئی' : 'AI'}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
                active
                  ? 'text-[#143E2E]'
                  : 'text-[#8E877D] hover:text-[#18231C]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              <span
                className={`text-[9px] mt-0.5 leading-none ${
                  active ? 'font-bold text-[#143E2E]' : 'font-medium'
                } ${isUrdu ? 'font-arabic' : ''}`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
