'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  Bookmark,
  Check,
  Search,
  Eye,
  Languages,
  X,
  Copy,
} from 'lucide-react';
import { RawPassage } from '@/types/passage.types';
import { useLanguage } from '@/contexts/language-context';
import canonicalPassages from '@/ingestion/canonical-passages.json';

type ReaderLanguage = 'arabic' | 'english' | 'urdu' | 'dual';
type ActiveTab = 'reader' | 'pdfs';

const PDF_EDITIONS = [
  {
    id: 'urdu',
    title: 'منہاج نہج البلاغہ — مکمل اردو ایڈیشن مع شرح',
    titleEn: 'Nahj al-Balagha — Complete Urdu Edition with Commentary',
    subtitle: 'فصیح و بلیغ اردو ترجمہ مع مفصل حواشی و تاریخی پس منظر',
    subtitleEn: 'Authoritative Urdu Translation & Historical Explanatory Notes',
    translator: 'علامہ مفتی جعفر حسین / علامہ سید سبط الحسن ہنسوی',
    compiler: 'شریف الرضی علیہ الرحمہ (ت ۴۰۶ ھ)',
    pages: '840 صفحات (مکمل جلد)',
    contents: 'تمام ۲۴۱ خطبات، ۷۹ مکتوبات اور ۴۸۰ کلماتِ حکمت و دعائیں',
    contentsEn: 'All 241 Sermons • 79 Letters • 480 Sayings & Moral Aphorisms',
    description:
      'اردو زبان کا سب سے معتبر اور مستند ترین ترجمہ۔ ہر خطبے اور مکتوب کا پس منظر اور کلام امیر المومنین کے عمیق فکری نکات۔',
    descriptionEn:
      'The definitive authoritative Urdu translation. Complete unabridged volume containing all sermons, letters, and sayings.',
    pdfUrl: '/docs/nahj-al-balagha-urdu.pdf',
    badge: 'مکمل مستند اردو ایڈیشن',
    badgeColor: 'bg-[#E2EAF0] text-[#244866]',
  },
  {
    id: 'english',
    title: 'Nahj al-Balagha — Complete English Edition',
    titleEn: 'Nahj al-Balagha — Complete English Edition',
    subtitle: 'Authoritative English Translation & Explanatory Commentary',
    subtitleEn: 'Authoritative English Translation & Explanatory Commentary',
    translator: 'Syed Ali Reza / Allama Jafari',
    compiler: 'al-Sharif al-Radi (d. 406 AH)',
    pages: '680 Pages (Complete)',
    contents: 'All 241 Sermons • 79 Letters • 480 Sayings & Moral Aphorisms',
    contentsEn: 'All 241 Sermons • 79 Letters • 480 Sayings & Moral Aphorisms',
    description:
      'The definitive authoritative English translation. Complete unabridged volume containing all sermons, letters, and sayings.',
    descriptionEn:
      'The definitive authoritative English translation. Complete unabridged volume containing all sermons, letters, and sayings.',
    pdfUrl: '/docs/nahj-al-balagha-english.pdf',
    badge: 'Complete English Edition',
    badgeColor: 'bg-[#DDECE3] text-[#143E2E]',
  },
  {
    id: 'arabic',
    title: 'نهج البلاغة — النسخة العربية الكاملة المعتمدة',
    titleEn: 'Nahj al-Balagha — Complete Canonical Arabic Edition',
    subtitle: 'مجموع ما اختاره الشريف الرضي من كلام أمير المؤمنين علي بن أبي طالب',
    subtitleEn: 'Compiled by al-Sharif al-Radi (d. 406 AH) with Complete Vocalization',
    translator: 'ضبط النص والتحقيق: الشريف الرضي',
    compiler: 'الشريف الرضي (ت 406 هـ)',
    pages: '720 صفحة (المجلد الكامل)',
    contents: 'جميع الخطب والكتب والرسائل والوصايا والحكم الأصلية المشكولة',
    contentsEn: 'All original sermons, letters, and aphorisms with full Arabic diacritics',
    description:
      'النص العربي الأصيل الكامل مضبوطاً بالحركات، مشتملاً على فهارس الخطب ومفردات البلاغة واللغة.',
    descriptionEn:
      'Authentic complete Arabic edition with full diacritics, scholarly commentary, and thematic index.',
    pdfUrl: '/docs/nahj-al-balagha-arabic.pdf',
    badge: 'النسخة الأصلية المشكولة',
    badgeColor: 'bg-[#F0ECE1] text-[#7A5835]',
  },
  {
    id: 'sec-sermons',
    title: 'مجموعہ خطبات امیر المومنین (خطبات)',
    titleEn: 'All Sermons Section (Khutbat)',
    subtitle: 'تمام ۲۴۱ مکمل خطبات مع اردو و انگریزی تراجم',
    subtitleEn: 'All 241 Complete Sermons of Imam Ali (AS)',
    translator: 'علامہ مفتی جعفر حسین / Syed Ali Reza',
    compiler: 'الشریف الرضی',
    pages: '242 Pages',
    contents: 'خطبہ ۱ تا خطبہ ۲۴۱ مکمل',
    contentsEn: 'Sermons 1 through 241 Complete',
    description:
      'امیر المومنین علیہ السلام کے تمام خطبات توحید، کائنات، عدل و انصاف، اور سیاسی و اخلاقی حکمت پر مشتمل مکمل جلد۔',
    descriptionEn:
      'Dedicated complete volume for all sermons delivered by Imam Ali on divine unity, creation, justice, and governance.',
    pdfUrl: '/docs/nahj-sermons-complete.pdf',
    badge: 'باب الخطب الكامل',
    badgeColor: 'bg-[#DDECE3] text-[#143E2E]',
  },
  {
    id: 'sec-letters',
    title: 'مجموعہ مکتوبات و معاہدات (رسائل)',
    titleEn: 'All Letters & Treatises (Maktubat)',
    subtitle: 'تمام ۷۹ سرکاری مکتوبات، فرامین اور وصایا',
    subtitleEn: 'All 79 Official Letters & Epistles of Imam Ali (AS)',
    translator: 'علامہ مفتی جعفر حسین / Syed Ali Reza',
    compiler: 'الشریف الرضی',
    pages: '80 Pages',
    contents: 'مکتوب ۱ تا مکتوب ۷۹ مکمل (بشمول مکتوب ۵۳ و ۳۱)',
    contentsEn: 'Letters 1 through 79 Complete (including Letter 53 & Letter 31)',
    description:
      'امیر المومنین کے حکمرانوں، گورنروں، جرنیلوں اور فرزندان کے نام تاریخی فرامین اور اخلاقی وصیت نامے۔',
    descriptionEn:
      'Dedicated complete volume of all official administrative epistles, ethical counsels to sons, and treaties.',
    pdfUrl: '/docs/nahj-letters-complete.pdf',
    badge: 'باب الرسائل والكتب',
    badgeColor: 'bg-[#F0ECE1] text-[#7A5835]',
  },
  {
    id: 'sec-sayings',
    title: 'کلماتِ حکمت و قصار الحکم (حکمتیں)',
    titleEn: 'All Sayings & Maxims (Hikam)',
    subtitle: 'تمام ۴۸۰ اخلاقی و فکری اقوالِ زریں',
    subtitleEn: 'All 480 Moral Aphorisms and Wisdoms',
    translator: 'علامہ مفتی جعفر حسین / Syed Ali Reza',
    compiler: 'الشریف الرضی',
    pages: '120 Pages',
    contents: 'حکمت ۱ تا حکمت ۴۸۰ مکمل',
    contentsEn: 'Sayings 1 through 480 Complete',
    description:
      'زندگی، عقل، علم، صبر، خود داری اور اخلاقِ حسنہ پر امیر المومنین کے مختصر مگر جامع فرامین کا خزانہ۔',
    descriptionEn:
      'Dedicated complete volume of all moral maxims, spiritual aphorisms, and life principles.',
    pdfUrl: '/docs/nahj-sayings-complete.pdf',
    badge: 'باب قصار الحكم',
    badgeColor: 'bg-[#E2EAF0] text-[#244866]',
  },
];

export default function ReaderPage() {
  const { language, isUrdu, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ActiveTab>('reader');
  const [selectedLang, setSelectedLang] = useState<ReaderLanguage>(isUrdu ? 'dual' : 'dual');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePassage, setActivePassage] = useState<RawPassage | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(24);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Sync reader language when global language changes
  useEffect(() => {
    if (isUrdu && selectedLang === 'english') {
      setSelectedLang('urdu');
    }
  }, [isUrdu]);

  const allPassages: RawPassage[] = (canonicalPassages as any[]) || [];

  // Filter passages
  const filteredPassages = allPassages.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.chapter?.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.arabicText?.includes(searchQuery) ||
      p.translationText?.toLowerCase().includes(q) ||
      p.urduTranslation?.includes(searchQuery) ||
      p.number.toString() === q;

    return matchesCategory && matchesSearch;
  });

  const visiblePassages = filteredPassages.slice(0, displayLimit);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = async (p: RawPassage) => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageType: p.chapter?.toLowerCase() || 'sermon',
          passageNumber: p.number,
          title: p.title || `${p.chapter} #${p.number}`,
          arabicText: p.arabicText,
          translationText: p.translationText,
          language: isUrdu ? 'urdu' : 'english',
          translator: p.translator,
          tags: p.topics || [],
        }),
      });
      setBookmarked(true);
      setTimeout(() => setBookmarked(false), 2500);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const getCategoryLabel = (val: string) => {
    if (isUrdu) {
      if (val === 'all') return 'تمام متون';
      if (val === 'sermon') return 'خطبات (۲۴۱)';
      if (val === 'letter') return 'مکتوبات (۷۹)';
      if (val === 'saying') return 'حکمتیں (۴۸۰)';
      if (val === 'dua') return 'دعائیں و مناجات (۲۸)';
    }
    if (val === 'all') return 'All Passages (799)';
    if (val === 'sermon') return 'Sermons (241)';
    if (val === 'letter') return 'Letters (79)';
    if (val === 'saying') return 'Sayings (480)';
    if (val === 'dua') return "Du'as & Supplications (28)";
    return val;
  };

  const getPassageBadge = (p: RawPassage) => {
    const isDua = p.chapter?.toLowerCase() === 'dua';
    if (isUrdu) {
      if (isDua) return `دعا نمبر ${p.number}`;
      if (p.chapter?.toLowerCase() === 'sermon') return `خطبہ نمبر ${p.number}`;
      if (p.chapter?.toLowerCase() === 'letter') return `مکتوب نمبر ${p.number}`;
      return `حکمت نمبر ${p.number}`;
    }
    return `${isDua ? 'SUPPLICATION' : p.chapter?.toUpperCase()} #${p.number}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase font-mono">
          {isUrdu ? 'مستند کینونیکل کتب خانہ و ڈیجیٹل کتب' : 'CANONICAL TEXTS & DIGITAL EDITIONS'}
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
          {isUrdu ? 'نہج البلاغہ مطالعہ و آفیشل لائبریری' : 'Nahj al-Balagha Reader & Official Library'}
        </h1>
        <p className="text-xs md:text-sm text-[#58635B] max-w-3xl leading-relaxed">
          {isUrdu
            ? 'امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے تمام ۲۴۱ خطبات، ۷۹ مکتوبات، ۴۸۰ کلماتِ حکمت اور ۲۸ مستند دعائیں اصلی عربی متن اور با محاورہ اردو و انگریزی ترجمے کے ساتھ پڑھیں، یا آفیشل ڈیجیٹل کتب و پی ڈی ایف ملاحظہ فرمائیں۔'
            : 'Explore complete authentic sermons, letters, sayings, and supplications in original Arabic alongside your preferred language translation (English and Urdu), or access official digitized complete PDF editions directly in your browser.'}
        </p>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 border-b border-[#ECE7DE] pb-4">
        <button
          onClick={() => setActiveTab('reader')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'reader'
              ? 'bg-[#143E2E] text-white shadow-xs'
              : 'bg-white border border-[#ECE7DE] text-[#58635B] hover:text-[#18231C]'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>
            {isUrdu
              ? `کینونیکل ریڈر (${filteredPassages.length} متون)`
              : `Interactive Canonical Reader (${filteredPassages.length} Texts)`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pdfs')}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'pdfs'
              ? 'bg-[#143E2E] text-white shadow-xs'
              : 'bg-white border border-[#ECE7DE] text-[#58635B] hover:text-[#18231C]'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>
            {isUrdu
              ? 'آفیشل ڈیجیٹل کتب و پی ڈی ایف (۶ جلدیں)'
              : 'Official Digitized Books & Sectional PDFs (6 Volumes)'}
          </span>
        </button>
      </div>

      {/* MODE 1: INTERACTIVE PARALLEL READER */}
      {activeTab === 'reader' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category, Language */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-[#ECE7DE] shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayLimit(24);
                }}
                placeholder={
                  isUrdu
                    ? 'عنوان، الفاظ یا نمبر سے تلاش کریں (مثلاً: ۵۳، ۲۱۶، کمیل)...'
                    : 'Filter by title, keywords, or passage # (e.g. 53, 216, Kumayl)...'
                }
                className="w-full pl-10 pr-4 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs text-[#18231C] placeholder-[#8E877D] focus:outline-none focus:border-[#143E2E]/40"
              />
            </div>

            {/* Category Selector */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'sermon', 'letter', 'saying', 'dua'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setDisplayLimit(24);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#143E2E] text-white shadow-xs'
                      : 'bg-[#FBF9F5] border border-[#ECE7DE] text-[#58635B] hover:text-[#18231C]'
                  }`}
                >
                  <span className={isUrdu ? 'font-arabic text-xs' : ''}>{getCategoryLabel(cat)}</span>
                </button>
              ))}
            </div>

            {/* Translation Language Selector */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs border-t lg:border-t-0 pt-3 lg:pt-0">
              <span className="text-[#8E877D] flex items-center gap-1 text-[11px] font-medium mr-1">
                <Languages className="w-3.5 h-3.5" /> {isUrdu ? 'ترجمہ:' : 'View:'}
              </span>
              {[
                { id: 'dual', label: isUrdu ? 'دونوں زبانیں' : 'Dual View' },
                { id: 'urdu', label: 'اردو (Urdu)' },
                { id: 'english', label: 'English' },
                { id: 'arabic', label: 'العربية' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id as ReaderLanguage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedLang === lang.id
                      ? 'bg-[#143E2E] text-white shadow-xs'
                      : 'bg-[#FBF9F5] border border-[#ECE7DE] text-[#58635B] hover:text-[#18231C]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Showing Passages Count */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#8E877D] px-1 gap-2">
            <span>
              {isUrdu
                ? `${filteredPassages.length} میں سے ${visiblePassages.length} متون دکھائے جا رہے ہیں`
                : `Showing ${visiblePassages.length} of ${filteredPassages.length} passages`}
            </span>
            <span className="hidden sm:inline">
              {isUrdu
                ? 'مکمل کلام پڑھنے کے لیے کارڈ پر کلک فرمائیں'
                : 'Click any passage to open full reading manuscript'}
            </span>
          </div>

          {/* Passages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {visiblePassages.map((p, idx) => {
              const displayUrduFirst = isUrdu || selectedLang === 'urdu';
              const showUrdu = selectedLang === 'urdu' || selectedLang === 'dual';
              const showEnglish = selectedLang === 'english' || (selectedLang === 'dual' && !isUrdu);

              return (
                <div
                  key={`${p.chapter}_${p.number}_${idx}`}
                  className="bg-white rounded-3xl border border-[#ECE7DE] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer hover:border-[#143E2E]/40"
                  onClick={() => setActivePassage(p)}
                >
                  <div className="space-y-3">
                    {/* Header: Badge & Category */}
                    <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
                      <span className="text-[10px] font-bold tracking-widest text-[#143E2E] uppercase px-2.5 py-0.5 rounded-full bg-[#DDECE3] font-mono">
                        {getPassageBadge(p)}
                      </span>
                      <span className="text-[11px] text-[#8E877D]">
                        {isUrdu ? 'نہج البلاغہ' : 'Nahj al-Balagha'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#18231C] leading-snug">
                      {p.title}
                    </h3>

                    {/* Arabic Text Display */}
                    {(selectedLang === 'arabic' || selectedLang === 'dual') && (
                      <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE]">
                        <p className="font-arabic text-base sm:text-lg text-[#143E2E] text-right leading-loose line-clamp-3">
                          {p.arabicText}
                        </p>
                      </div>
                    )}

                    {/* Urdu Translation Display */}
                    {showUrdu && p.urduTranslation && (
                      <div className="p-3 rounded-2xl bg-[#F8FAF8] border border-[#E3EDE6]">
                        <span className="text-[10px] font-bold uppercase text-[#143E2E] block mb-1 text-right">
                          اردو ترجمہ
                        </span>
                        <p className="text-right font-serif text-xs sm:text-sm text-[#18231C] leading-loose line-clamp-4">
                          {p.urduTranslation}
                        </p>
                      </div>
                    )}

                    {/* English Translation Display */}
                    {showEnglish && p.translationText && (
                      <div className="text-xs sm:text-sm text-[#58635B] leading-relaxed line-clamp-3 pt-1">
                        <p className="italic text-[#18231C]">
                          &ldquo;{p.translationText}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div
                    className="pt-3 border-t border-[#ECE7DE] flex flex-wrap items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setActivePassage(p)}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'مکمل متن پڑھیں' : 'Read Full Passage'}</span>
                    </button>

                    <Link
                      href={`/chat?q=${encodeURIComponent(
                        isUrdu
                          ? `نہج البلاغہ کے ${p.chapter} نمبر ${p.number} کی تفصیلی وضاحت فرمائیں: "${p.title}"`
                          : `Explain ${p.chapter} #${p.number} from Nahj al-Balagha: "${p.title}"`
                      )}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#143E2E] hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isUrdu ? 'اے آئی سے دریافت کریں' : 'Explore with AI'}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {displayLimit < filteredPassages.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayLimit((prev) => prev + 24)}
                className="px-6 py-2.5 rounded-full bg-white border border-[#ECE7DE] text-[#18231C] text-xs font-bold hover:border-[#143E2E]/40 hover:bg-[#FBF9F5] shadow-xs transition-all cursor-pointer"
              >
                {isUrdu
                  ? `مزید متون ملاحظہ فرمائیں (${filteredPassages.length - displayLimit} باقی ہیں)`
                  : `Load More Passages (${filteredPassages.length - displayLimit} remaining)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: OFFICIAL DIGITIZED BOOKS & SECTIONAL PDFS */}
      {activeTab === 'pdfs' && (
        <div className="space-y-6">
          <div className="bg-[#EBF3EE] border border-[#D2E4D8] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider block mb-1">
                {isUrdu ? 'مستند تصدیق شدہ کتب' : 'AUTHENTIC VOLUMES & CITATIONS'}
              </span>
              <h3 className="font-serif-title font-bold text-lg sm:text-xl text-[#143E2E]">
                {isUrdu ? 'مکمل نہج البلاغہ ڈیجیٹل ایڈیشنز' : 'Complete Nahj al-Balagha Digitized Editions'}
              </h3>
              <p className="text-xs text-[#58635B] mt-1 max-w-xl">
                {isUrdu
                  ? 'معتبر محققین اور نامور مترجمین کے مصدقہ اردو، انگریزی اور عربی ایڈیشنز براہِ راست براؤزر میں ملاحظہ اور ڈاؤنلوڈ کریں۔'
                  : 'Official multi-page canonical volumes in English, Arabic, and Urdu. Verified against standard manuscripts.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-[#D2E4D8] text-xs font-bold text-[#143E2E]">
                {isUrdu ? '۶ کتب دستیاب' : '6 Editions Available'}
              </span>
            </div>
          </div>

          {/* PDF Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {PDF_EDITIONS.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white rounded-3xl border border-[#ECE7DE] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${pdf.badgeColor}`}
                    >
                      {pdf.badge}
                    </span>
                    <span className="text-[11px] text-[#8E877D] font-mono">{pdf.pages}</span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#18231C] leading-snug">
                    {isUrdu ? pdf.title : pdf.titleEn}
                  </h3>

                  <p className="text-xs text-[#58635B] leading-relaxed">
                    {isUrdu ? pdf.description : pdf.descriptionEn}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#8E877D]">{isUrdu ? 'مترجم / ضبط:' : 'Translator:'}</span>
                      <span className="font-semibold text-[#18231C] text-right">{pdf.translator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E877D]">{isUrdu ? 'جامع:' : 'Compiler:'}</span>
                      <span className="font-semibold text-[#18231C]">{pdf.compiler}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECE7DE] flex items-center justify-between">
                  <a
                    href={pdf.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'کتاب کھولیں' : 'Read Edition'}</span>
                  </a>

                  <a
                    href={pdf.pdfUrl}
                    download
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#58635B] hover:text-[#18231C]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'ڈاؤنلوڈ' : 'Download'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL PASSAGE DETAIL MANUSCRIPT MODAL */}
      {activePassage && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-4xl w-full rounded-3xl border border-[#ECE7DE] p-5 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#ECE7DE] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DDECE3] font-mono">
                  {getPassageBadge(activePassage)} • {isUrdu ? 'نہج البلاغہ' : 'NAHJ AL-BALAGHA'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#18231C] mt-1">
                  {activePassage.title}
                </h3>
                <p className="text-xs text-[#8E877D]">
                  {isUrdu
                    ? 'جامع: سید شریف الرضی (ت ۴۰۶ ھ) • کلامِ امیر المومنین علی ابن ابی طالب (ع)'
                    : 'Compiled by al-Sharif al-Radi (d. 406 AH) • Author: Amir al-Mu\'minin Ali ibn Abi Talib (AS)'}
                </p>
              </div>

              <button
                onClick={() => setActivePassage(null)}
                className="p-1.5 rounded-xl text-[#8E877D] hover:text-[#18231C] hover:bg-[#FBF9F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Arabic Manuscript Box */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#143E2E] block text-right font-mono">
                {isUrdu ? 'اصل عربی متن' : 'ORIGINAL ARABIC TEXT'}
              </span>
              <p className="font-arabic text-lg sm:text-2xl text-[#18231C] text-right leading-loose selection:bg-[#DDECE3]">
                {activePassage.arabicText}
              </p>
            </div>

            {/* Urdu Translation Box */}
            {activePassage.urduTranslation && (
              <div className="p-4 sm:p-6 rounded-2xl bg-[#F8FAF8] border border-[#D2E4D8] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#143E2E] block text-right font-mono">
                  اردو مستند ترجمہ (علامہ مفتی جعفر حسین / علامہ سبط الحسن)
                </span>
                <p className="font-serif text-sm sm:text-base text-[#18231C] text-right leading-loose selection:bg-[#EBF3EE]">
                  {activePassage.urduTranslation}
                </p>
              </div>
            )}

            {/* English Translation Box */}
            {activePassage.translationText && (
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#ECE7DE] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D] block font-mono">
                  {isUrdu ? 'انگریزی ترجمہ' : 'AUTHORITATIVE ENGLISH TRANSLATION (SYED ALI REZA)'}
                </span>
                <p className="italic text-xs sm:text-sm text-[#18231C] leading-relaxed">
                  &ldquo;{activePassage.translationText}&rdquo;
                </p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[#ECE7DE] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(
                      `${activePassage.title}\n\nArabic:\n${activePassage.arabicText}\n\nUrdu:\n${
                        activePassage.urduTranslation || ''
                      }\n\nEnglish:\n${activePassage.translationText || ''}`
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl border border-[#ECE7DE] hover:bg-[#FBF9F5] text-xs font-semibold text-[#58635B] hover:text-[#18231C] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#143E2E]" />
                      <span className="text-[#143E2E]">{isUrdu ? 'کاپی ہو گیا' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'متن کاپی کریں' : 'Copy All'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleBookmark(activePassage)}
                  className="px-3.5 py-1.5 rounded-xl border border-[#ECE7DE] hover:bg-[#FBF9F5] text-xs font-semibold text-[#58635B] hover:text-[#18231C] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {bookmarked ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#143E2E]" />
                      <span className="text-[#143E2E]">{isUrdu ? 'محفوظ شدہ' : 'Saved'}</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'بک مارک کریں' : 'Bookmark'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/chat?q=${encodeURIComponent(
                    isUrdu
                      ? `نہج البلاغہ کے ${activePassage.chapter} نمبر ${activePassage.number} کی تفصیلی تفسیر فرمائیں: "${activePassage.title}"`
                      : `Explain ${activePassage.chapter} #${activePassage.number} from Nahj al-Balagha: "${activePassage.title}"`
                  )}`}
                  className="px-4 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نہج اے آئی سے رہنمائی حاصل کریں' : 'Explore with Nahj AI'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
