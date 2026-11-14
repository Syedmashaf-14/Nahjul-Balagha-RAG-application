'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'english' | 'urdu';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isUrdu: boolean;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  english: {
    // Navigation / Sidebar
    discover: 'Discover',
    overview: 'Overview',
    explore: 'Explore',
    library: 'Canonical Library & PDFs',
    myLearning: 'My learning',
    saved: 'Saved',
    notes: 'Notes',
    collections: 'Collections',
    intelligence: 'Intelligence',
    askNahjAi: 'Ask Nahj AI',
    personalization: 'Personalization',
    dailyReflection: 'Daily reflection',
    learningStreak: 'day learning streak',
    welcomeUser: 'Welcome, User',
    signInToTrack: 'Sign in to track progress',
    signIn: 'Sign In',
    signOut: 'Sign Out',

    // Topbar
    topSearchPlaceholder: 'Search sermons, letters, sayings...',
    notifications: 'Notifications',

    // Explore Page
    theCollection: 'THE COLLECTION',
    exploreTitle: 'Explore the Nahj al-Balagha',
    exploreSubtitle: 'Discover sermons, letters, and sayings by theme, source, or question.',
    canonicalLibraryPill: 'Canonical Library & Official PDFs →',
    searchPlaceholder: 'Search sermons, letters, sayings (e.g. Letter 53, Saying 81, justice)...',
    allSources: 'All sources',
    sermonsFilter: 'Sermons (241)',
    lettersFilter: 'Letters (79)',
    sayingsFilter: 'Sayings (470)',
    duasFilter: "Du'as & Supplications (28)",
    showingPassages: 'Showing',
    ofPassages: 'of',
    authenticPassages: 'authentic passages',
    clickCardHint: 'Click any card to read full Arabic & translations',
    minRead: 'min read',
    readFull: 'Read Full',
    loadMore: 'Load More Passages',
    remaining: 'remaining',
    noMatchesFound: 'No matching passages found',
    noMatchesDesc: 'Try adjusting your search terms or select another category like Sermons, Letters, or Sayings.',

    // Modal
    sourceReference: 'SOURCE REFERENCE',
    vocalizedArabic: 'Vocalized Arabic Original',
    englishTranslationTitle: 'English Translation (Syed Ali Reza Edition)',
    urduTranslationTitle: 'Urdu Translation & Commentary (Allama Zeeshan Haider Jawadi / Mufti Jafar Hussain)',
    displayView: 'Display View:',
    dualView: 'Dual (English & Urdu)',
    englishOnly: 'English Only',
    urduOnly: 'Urdu Only',
    arabicOnly: 'Arabic Only',
    canonicalCitation: 'Canonical Citation:',
    bookmarkPassage: 'Bookmark Passage',
    bookmarked: 'Saved!',
    copyPassage: 'Copy Translation',
    copied: 'Copied!',
    askAboutPassage: 'Ask AI About This Passage',
  },
  urdu: {
    // Navigation / Sidebar
    discover: 'دریافت و مطالعہ',
    overview: 'جائزہ و رہنمائی',
    explore: 'کلام کی تلاش',
    library: 'مستند کتب خانہ و پی ڈی ایف',
    myLearning: 'میرا سفرِ علم',
    saved: 'محفوظ کلام',
    notes: 'علمی نوٹس',
    collections: 'مجموعات',
    intelligence: 'دانش و حکمت',
    askNahjAi: 'نہج اے آئی سے پوچھیں',
    personalization: 'ذاتی ترجیحات',
    dailyReflection: 'روزانہ کی حکمت',
    learningStreak: 'روزہ تسلسل',
    welcomeUser: 'خوش آمدید، معزز قاری',
    signInToTrack: 'پیش رفت محفوظ کرنے کے لیے سائن ان کریں',
    signIn: 'سائن ان',
    signOut: 'لاگ آؤٹ',

    // Topbar
    topSearchPlaceholder: 'خطبات، مکتوبات یا حکمتیں تلاش کریں...',
    notifications: 'اطلاعات',

    // Explore Page
    theCollection: 'نہج البلاغہ کا ذخیرہ',
    exploreTitle: 'کلام امیر المومنین کی دریافت',
    exploreSubtitle: 'خطبات، مکتوبات اور حکمتوں کا موضوعاتی و مستند مطالعہ۔',
    canonicalLibraryPill: 'مستند کتب خانہ و اصل پی ڈی ایف کتب ←',
    searchPlaceholder: 'خطبہ، مکتوب، یا حکمت تلاش کریں (مثلاً: خط 53، حکمت 81، عدل و انصاف)...',
    allSources: 'تمام ماخذ',
    sermonsFilter: 'خطبات (241)',
    lettersFilter: 'مکتوبات (79)',
    sayingsFilter: 'حکمتیں (470)',
    duasFilter: 'دعائیں و مناجات (28)',
    showingPassages: 'پیش نظر',
    ofPassages: 'از کل',
    authenticPassages: 'مستند ارشادات',
    clickCardHint: 'مکمل عربی و مستند تراجم کے لیے کسی بھی کارڈ پر کلک فرمائیں',
    minRead: 'منٹ مطالعہ',
    readFull: 'مکمل مطالعہ',
    loadMore: 'مزید ارشادات دکھائیں',
    remaining: 'باقی ہیں',
    noMatchesFound: 'کوئی مناسب ارشاد نہیں ملا',
    noMatchesDesc: 'براہ کرم تلاش کے الفاظ تبدیل کریں یا خطبات، مکتوبات یا حکمتوں میں سے کوئی انتخاب فرمائیں۔',

    // Modal
    sourceReference: 'مستند کتابی حوالہ',
    vocalizedArabic: 'النص العربي الأصيل المعتمد (اعراب کے ساتھ)',
    englishTranslationTitle: 'انگریزی ترجمہ (سید علی رضا ایڈیشن)',
    urduTranslationTitle: 'اردو ترجمہ و تشریح (علامہ ذیشان حیدر جوادی / مفتی جعفر حسین)',
    displayView: 'نمائش کا انداز:',
    dualView: 'مشترکہ (اردو و انگریزی)',
    englishOnly: 'صرف انگریزی',
    urduOnly: 'صرف اردو',
    arabicOnly: 'صرف عربی متن',
    canonicalCitation: 'کتابی ماخذ:',
    bookmarkPassage: 'کلام محفوظ کریں',
    bookmarked: 'محفوظ ہو گیا!',
    copyPassage: 'ترجمہ کاپی کریں',
    copied: 'کاپی ہو گیا!',
    askAboutPassage: 'اس کلام کے بارے میں اے آئی سے پوچھیں',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'english',
  setLanguage: () => {},
  isUrdu: false,
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('english');

  useEffect(() => {
    // Read from localStorage or cookie on mount
    const saved = localStorage.getItem('nahj_language') as AppLanguage | null;
    if (saved === 'english' || saved === 'urdu') {
      setLanguageState(saved);
      document.documentElement.lang = saved === 'urdu' ? 'ur' : 'en';
    }
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('nahj_language', lang);
    document.documentElement.lang = lang === 'urdu' ? 'ur' : 'en';

    // Also update server preferences if logged in
    fetch('/api/users/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang }),
    }).catch(() => {});
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.english[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isUrdu: language === 'urdu',
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
