'use client';

import { useState } from 'react';
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
import { SEED_PASSAGES } from '@/ingestion/seed-data';
import { RawPassage } from '@/types/passage.types';

type ReaderLanguage = 'arabic' | 'english' | 'urdu' | 'dual';
type ActiveTab = 'reader' | 'pdfs';

const PDF_EDITIONS = [
  {
    id: 'english',
    title: 'Nahj al-Balagha — The Peak of Eloquence',
    subtitle: 'Complete English Translation & Explanatory Commentary',
    translator: 'Syed Ali Reza',
    compiler: 'al-Sharif al-Radi (d. 406 AH)',
    pages: '680 Pages',
    contents: '241 Sermons • 79 Letters • 489 Sayings & Moral Aphorisms',
    description:
      'The definitive authoritative English translation. Features extensive historical context, cross-references, and doctrinal commentary.',
    pdfUrl: '/docs/nahj-al-balagha-english.pdf',
    badge: 'English Edition',
    badgeColor: 'bg-[#DDECE3] text-[#143E2E]',
  },
  {
    id: 'arabic',
    title: 'نهج البلاغة — النسخة العربية الكاملة المعتمدة',
    subtitle: 'مجموع ما اختاره الشريف الرضي من كلام أمير المؤمنين علي بن أبي طالب',
    translator: 'ضبط النص والتحقيق: الشريف الرضي',
    compiler: 'الشريف الرضي (ت 406 هـ)',
    pages: '720 صفحة',
    contents: 'جميع الخطب والكتب والرسائل والوصايا والحكم الأصلية المشكولة',
    description:
      'النص العربي الأصيل الكامل مضبوطاً بالحركات، مشتملاً على فهارس الخطب ومفردات البلاغة واللغة.',
    pdfUrl: '/docs/nahj-al-balagha-arabic.pdf',
    badge: 'النسخة الأصلية',
    badgeColor: 'bg-[#F0ECE1] text-[#7A5835]',
  },
  {
    id: 'urdu',
    title: 'ترجمہ و شرح نہج البلاغہ — مکمل اردو ایڈیشن',
    subtitle: 'فصیح و بلیغ اردو ترجمہ مع مفصل حواشی و تاریخی پس منظر',
    translator: 'علامہ ذیشان حیدر جوادی / مفتی جعفر حسین',
    compiler: 'شریف الرضی علیہ الرحمہ',
    pages: '840 صفحات',
    contents: 'تمام خطبات، مکتوبات، وصایا اور حکمتوں کا مستند و بامحاورہ اردو ترجمہ',
    description:
      'اردو زبان کا سب سے معتبر اور مستند ترجمہ۔ ہر خطبے کا تاریخی پس منظر اور کلامِ امیر المومنین کے گہرے فکری نکات۔',
    pdfUrl: '/docs/nahj-al-balagha-urdu.pdf',
    badge: 'اردو ایڈیشن',
    badgeColor: 'bg-[#E2EAF0] text-[#244866]',
  },
];

export default function ReaderPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('reader');
  const [selectedLang, setSelectedLang] = useState<ReaderLanguage>('dual');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePassage, setActivePassage] = useState<RawPassage | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Filter passages
  const filteredPassages = SEED_PASSAGES.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.chapter?.toLowerCase().includes(selectedCategory);

    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.arabicText?.includes(searchQuery) ||
      p.translationText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.urduTranslation?.includes(searchQuery) ||
      p.number.toString() === searchQuery.trim();

    return matchesCategory && matchesSearch;
  });

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
          language: 'english',
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

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
          CANONICAL TEXTS & DIGITAL EDITIONS
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
          Nahj al-Balagha Reader & Official Library
        </h1>
        <p className="text-xs md:text-sm text-[#58635B] max-w-3xl">
          Explore complete authentic sermons, letters, sayings, and supplications in original Arabic alongside
          your preferred language translation (English, Urdu, Roman Urdu), or access official digitized PDF editions directly in your browser.
        </p>
      </div>

      {/* Main Mode Tab Switcher */}
      <div className="flex rounded-full bg-white border border-[#ECE7DE] p-1.5 max-w-md shadow-xs">
        <button
          onClick={() => setActiveTab('reader')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reader'
              ? 'bg-[#143E2E] text-white shadow-xs'
              : 'text-[#58635B] hover:text-[#18231C]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Multilingual Reader</span>
        </button>

        <button
          onClick={() => setActiveTab('pdfs')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pdfs'
              ? 'bg-[#143E2E] text-white shadow-xs'
              : 'text-[#58635B] hover:text-[#18231C]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Official PDF Editions</span>
        </button>
      </div>

      {/* MODE 1: MULTILINGUAL CANONICAL READER */}
      {activeTab === 'reader' && (
        <div className="space-y-6">
          {/* Controls Bar: Language Selector & Search & Category Filter */}
          <div className="bg-white rounded-3xl border border-[#ECE7DE] p-5 shadow-xs space-y-4">
            {/* Row 1: Language Preference Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE7DE] pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#18231C]">
                <Languages className="w-4 h-4 text-[#143E2E]" />
                <span>Reading Language:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'dual', label: 'Dual View (عربي + Translation)' },
                  { id: 'arabic', label: 'العربية (Original Arabic)' },
                  { id: 'english', label: 'English (Syed Ali Reza)' },
                  { id: 'urdu', label: 'اردو (علامہ ذیشان حیدر جوادی)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLang(item.id as ReaderLanguage)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedLang === item.id
                        ? 'bg-[#143E2E] text-white shadow-xs'
                        : 'bg-[#FBF9F5] border border-[#ECE7DE] text-[#58635B] hover:border-[#143E2E]/30'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Search & Category Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sermon #, title, or topic..."
                  className="w-full pl-10 pr-4 py-2 bg-[#FBF9F5] border border-[#ECE7DE] rounded-full text-xs text-[#18231C] placeholder-[#8E877D] focus:outline-none focus:border-[#143E2E]/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Sources' },
                  { id: 'sermon', label: 'Khutbat (Sermons)' },
                  { id: 'letter', label: 'Maktubat (Letters)' },
                  { id: 'saying', label: 'Hikam (Sayings)' },
                  { id: 'du\'a', label: 'Ad\'iyah (Duas & Prayers)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#EBF3EE] border border-[#D2E4D8] text-[#143E2E] font-bold'
                        : 'bg-white border border-[#ECE7DE] text-[#58635B] hover:border-[#143E2E]/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Passages List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPassages.map((p) => {
              const type = p.chapter?.toLowerCase() || 'sermon';
              const isDua = type.includes('du\'a') || type.includes('supplication');

              return (
                <div
                  key={`${p.chapter}_${p.number}`}
                  className="bg-white rounded-3xl border border-[#ECE7DE] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Badge & Category */}
                    <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
                      <span className="text-[10px] font-bold tracking-widest text-[#143E2E] uppercase px-2.5 py-0.5 rounded-full bg-[#DDECE3]">
                        {isDua ? 'SUPPLICATION' : p.chapter?.toUpperCase()} #{p.number}
                      </span>
                      <span className="text-[11px] text-[#8E877D]">
                        Nahj al-Balagha
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-serif font-bold text-[#18231C] leading-snug">
                      {p.title}
                    </h3>

                    {/* Arabic Text Display */}
                    {(selectedLang === 'arabic' || selectedLang === 'dual') && (
                      <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE]">
                        <p className="font-arabic text-base md:text-lg text-[#143E2E] text-right leading-loose line-clamp-3">
                          {p.arabicText}
                        </p>
                      </div>
                    )}

                    {/* Translation Display */}
                    {selectedLang !== 'arabic' && (
                      <div className="text-xs md:text-sm text-[#58635B] leading-relaxed line-clamp-4 pt-1">
                        {selectedLang === 'urdu' && p.urduTranslation ? (
                          <p className="text-right font-serif leading-loose text-[#18231C]">
                            {p.urduTranslation}
                          </p>
                        ) : (
                          <p className="italic text-[#18231C]">
                            &ldquo;{p.translationText}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-[#ECE7DE] flex items-center justify-between">
                    <button
                      onClick={() => setActivePassage(p)}
                      className="px-4 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full Passage</span>
                    </button>

                    <Link
                      href={`/chat?q=${encodeURIComponent(
                        `Explain ${p.chapter} #${p.number} from Nahj al-Balagha: "${p.title}"`
                      )}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#143E2E] hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Explore with AI</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: OFFICIAL DIGITAL PDF EDITIONS */}
      {activeTab === 'pdfs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PDF_EDITIONS.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white rounded-3xl border border-[#ECE7DE] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${pdf.badgeColor}`}
                  >
                    {pdf.badge}
                  </span>

                  <h3 className="text-lg font-serif font-bold text-[#18231C] leading-snug">
                    {pdf.title}
                  </h3>

                  <p className="text-xs text-[#8E877D] font-medium">
                    {pdf.subtitle}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-1.5 text-xs text-[#58635B]">
                    <div>
                      <span className="font-semibold text-[#18231C]">Translator / Tahqiq:</span> {pdf.translator}
                    </div>
                    <div>
                      <span className="font-semibold text-[#18231C]">Scope:</span> {pdf.contents}
                    </div>
                    <div>
                      <span className="font-semibold text-[#18231C]">Volume:</span> {pdf.pages}
                    </div>
                  </div>

                  <p className="text-xs text-[#58635B] leading-relaxed">
                    {pdf.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#ECE7DE]">
                  <button
                    onClick={() => setActivePdfUrl(pdf.pdfUrl)}
                    className="w-full py-2.5 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read in Browser</span>
                  </button>

                  <a
                    href={pdf.pdfUrl}
                    download
                    className="w-full py-2 rounded-xl bg-[#FBF9F5] border border-[#ECE7DE] hover:border-[#143E2E]/30 text-xs font-semibold text-[#18231C] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL PASSAGE READING MODAL */}
      {activePassage && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#ECE7DE] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DDECE3]">
                  {activePassage.chapter?.toUpperCase()} #{activePassage.number}
                </span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#18231C] mt-2">
                  {activePassage.title}
                </h2>
                <p className="text-xs text-[#8E877D] mt-0.5">
                  Nahj al-Balagha • Translator: {activePassage.translator}
                </p>
              </div>

              <button
                onClick={() => setActivePassage(null)}
                className="p-1 rounded-lg text-[#8E877D] hover:text-[#18231C] hover:bg-[#FBF9F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Arabic Text */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#143E2E] block">
                Original Arabic Text (النص العربي الأصيل):
              </span>
              <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE]">
                <p className="font-arabic text-lg md:text-xl text-[#143E2E] text-right leading-loose">
                  {activePassage.arabicText}
                </p>
              </div>
            </div>

            {/* English Translation */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#58635B] block">
                English Translation (Syed Ali Reza):
              </span>
              <p className="text-sm text-[#18231C] leading-relaxed p-4 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] whitespace-pre-wrap">
                {activePassage.translationText}
              </p>
            </div>

            {/* Urdu Translation if available */}
            {activePassage.urduTranslation && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#58635B] block text-right">
                  اردو ترجمہ (علامہ ذیشان حیدر جوادی):
                </span>
                <p className="text-sm md:text-base text-[#18231C] text-right leading-loose p-4 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] whitespace-pre-wrap">
                  {activePassage.urduTranslation}
                </p>
              </div>
            )}

            {/* Canonical Book Reference Footer */}
            <div className="p-4 rounded-2xl bg-[#EBF3EE] border border-[#D2E4D8] text-xs text-[#143E2E] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Verified Canonical Source:</span>
              </div>
              <p>
                <strong>Book:</strong> Nahj al-Balagha (نهج البلاغة) — Compiled by al-Sharif al-Radi (d. 406 AH).
                Reference: {activePassage.chapter} #{activePassage.number}.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ECE7DE]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(`${activePassage.title}\n\n${activePassage.arabicText}\n\n${activePassage.translationText}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:text-[#18231C] flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#143E2E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => handleBookmark(activePassage)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:text-[#18231C] flex items-center gap-1.5 shadow-xs"
                >
                  {bookmarked ? <Check className="w-3.5 h-3.5 text-[#143E2E]" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>

              <Link
                href={`/chat?q=${encodeURIComponent(
                  `Explain ${activePassage.chapter} #${activePassage.number} from Nahj al-Balagha: "${activePassage.title}"`
                )}`}
                className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reflect with Nahj AI</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* BROWSER PDF VIEWER MODAL */}
      {activePdfUrl && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full h-[85vh] rounded-3xl border border-[#ECE7DE] p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#143E2E]" />
                <h3 className="text-base font-serif font-bold text-[#18231C]">
                  Official Digital Edition Viewer
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={activePdfUrl}
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-[#143E2E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setActivePdfUrl(null)}
                  className="p-1 rounded-lg text-[#8E877D] hover:text-[#18231C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 my-4 rounded-2xl overflow-hidden border border-[#ECE7DE]">
              <iframe
                src={activePdfUrl}
                className="w-full h-full"
                title="Nahj al-Balagha PDF Viewer"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
              <span>Use browser controls to zoom or print the official digital edition.</span>
              <button
                onClick={() => setActivePdfUrl(null)}
                className="text-xs font-semibold text-[#143E2E] hover:underline"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
