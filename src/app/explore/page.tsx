'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Bookmark,
  Sparkles,
  Check,
  Clock,
  ChevronRight,
  Eye,
  X,
  Copy,
  Languages,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { RetrievedDocument, PassageType } from '@/types/passage.types';

// Arabic calligraphy tags mapping for aesthetic arch motifs
const ARABIC_MOTIFS: Record<string, string> = {
  justice: 'عدل',
  leadership: 'حكم',
  patience: 'صبر',
  knowledge: 'علم',
  piety: 'تقوى',
  character: 'نصح',
  wisdom: 'حكمة',
  governance: 'عدل',
  ethics: 'خلق',
  dua: 'دعاء',
};

function getArchStyle(index: number) {
  const styles = [
    { bg: 'bg-[#DDECE3]', arabic: 'عدل' }, // Sage
    { bg: 'bg-[#F0ECE1]', arabic: 'نصح' }, // Sand
    { bg: 'bg-[#E2EAF0]', arabic: 'علم' }, // Sky
    { bg: 'bg-[#EAE4DC]', arabic: 'حكمة' }, // Warm Stone
    { bg: 'bg-[#E0EBE4]', arabic: 'تقوى' }, // Light Emerald
  ];
  return styles[index % styles.length];
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as PassageType) || '';
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [passages, setPassages] = useState<RetrievedDocument[]>([]);
  const [displayCount, setDisplayCount] = useState<number>(24);
  const [loading, setLoading] = useState(true);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);

  // Active Passage Detail Modal State
  const [selectedDoc, setSelectedDoc] = useState<RetrievedDocument | null>(null);
  const [modalLanguage, setModalLanguage] = useState<'dual' | 'english' | 'urdu' | 'arabic'>('dual');
  const [copied, setCopied] = useState(false);

  const fetchPassages = (searchQ?: string, type?: string) => {
    setLoading(true);
    const q = searchQ !== undefined ? searchQ : query;
    const t = type !== undefined ? type : selectedType;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (t) params.set('type', t);
    params.set('limit', '100'); // Retrieve sufficient passages

    fetch(`/api/passages/search?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPassages(json.data);
        }
      })
      .catch((err) => console.error('Fetch passages error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPassages(initialQuery, initialType);
  }, [initialQuery, initialType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPassages();
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setDisplayCount(24);
    fetchPassages(undefined, type);
  };

  const handleBookmark = async (doc: RetrievedDocument) => {
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageType: doc.metadata.passageType,
          passageNumber: doc.metadata.passageNumber,
          title: doc.metadata.passageTitle || `${doc.metadata.passageType} #${doc.metadata.passageNumber}`,
          arabicText: doc.metadata.arabicOriginal,
          translationText: doc.content,
          language: doc.metadata.language,
          translator: doc.metadata.translator,
          tags: doc.metadata.topics || [],
        }),
      });
      setBookmarkedId(doc.id);
      setTimeout(() => setBookmarkedId(null), 2500);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visiblePassages = passages.slice(0, displayCount);

  return (
    <div className="space-y-7 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
            THE COLLECTION
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
            Explore the Nahj al-Balagha
          </h1>
          <p className="text-xs md:text-sm text-[#58635B]">
            Discover complete sermons, letters, sayings, and supplications by theme, source, or question. Click any card to read in full.
          </p>
        </div>

        <Link
          href="/reader"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EBF3EE] border border-[#D2E4D8] text-[#143E2E] hover:bg-[#DDECE3] text-xs font-bold transition-all shadow-2xs self-start md:self-auto"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Canonical Library & Official PDFs →</span>
        </Link>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E877D]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sermons, letters, sayings (e.g. Letter 53, Saying 81, justice)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ECE7DE] rounded-full text-xs md:text-sm text-[#18231C] placeholder-[#8E877D] shadow-sm focus:outline-none focus:border-[#143E2E]/40 focus:ring-1 focus:ring-[#143E2E]/30 transition-all"
          />
        </form>

        {/* Source Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All sources', value: '' },
            { label: 'Sermons (241)', value: 'sermon' },
            { label: 'Letters (79)', value: 'letter' },
            { label: 'Sayings (470)', value: 'saying' },
            { label: "Du'as", value: 'dua' },
          ].map((item) => {
            const isActive = selectedType === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleTypeSelect(item.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#143E2E] text-white shadow-sm'
                    : 'bg-white border border-[#ECE7DE] text-[#58635B] hover:border-[#143E2E]/30 hover:text-[#18231C]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subheader: Results count & Sort */}
      <div className="flex items-center justify-between text-xs text-[#8E877D] pt-1">
        <span>Showing {visiblePassages.length} of {passages.length} authentic passages</span>
        <div className="flex items-center gap-1 text-[#58635B] font-medium">
          <span>Click any card to read full Arabic & translations</span>
        </div>
      </div>

      {/* Passages Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#58635B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#143E2E] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-medium">Retrieving passages from canonical library...</p>
        </div>
      ) : passages.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-sm">
          <BookOpen className="w-10 h-10 text-[#8E877D] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#18231C]">No matching passages found</h3>
          <p className="text-xs text-[#58635B] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or select another category like Sermons, Letters, or Sayings.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePassages.map((doc, idx) => {
              const meta = doc.metadata;
              const arch = getArchStyle(idx);
              const topicKey = meta.topics?.[0]?.toLowerCase() || '';
              const arabicWord = ARABIC_MOTIFS[topicKey] || arch.arabic;
              const isBookmarked = bookmarkedId === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-white rounded-2xl border border-[#ECE7DE] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer hover:border-[#143E2E]/40"
                >
                  <div>
                    {/* Top Arch Illustration Area */}
                    <div
                      className={`h-40 ${arch.bg} relative p-4 flex flex-col justify-between overflow-hidden`}
                    >
                      {/* Concentric subtle background curves */}
                      <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-20">
                        <div className="w-48 h-48 rounded-full border border-[#143E2E] absolute -top-10 -right-10" />
                        <div className="w-36 h-36 rounded-full border border-[#143E2E] absolute top-2 right-2" />
                      </div>

                      {/* Top Row: Type Pill & Bookmark Button */}
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-bold tracking-widest text-[#143E2E] uppercase bg-white/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#ECE7DE]/50">
                          {meta.passageType} #{meta.passageNumber}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(doc);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                            isBookmarked
                              ? 'bg-[#143E2E] text-white'
                              : 'bg-white/80 hover:bg-white text-[#58635B] hover:text-[#143E2E] border border-[#ECE7DE]/80'
                          }`}
                          title="Save passage"
                        >
                          {isBookmarked ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Center Arch Motif with Calligraphy */}
                      <div className="flex justify-center items-end relative z-10">
                        <div className="w-16 h-20 rounded-t-full bg-white/85 border border-[#ECE7DE] flex items-center justify-center shadow-xs">
                          <span className="font-arabic text-2xl text-[#143E2E] font-medium leading-none pt-1">
                            {arabicWord}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D] block">
                        {meta.passageType} {meta.passageNumber}
                      </span>

                      <h3 className="text-base font-serif font-bold text-[#18231C] group-hover:text-[#143E2E] transition-colors line-clamp-1">
                        {meta.passageTitle || `${meta.passageType} #${meta.passageNumber}`}
                      </h3>

                      {/* Original Arabic Text (if present) */}
                      {meta.arabicOriginal && (
                        <p className="font-arabic text-sm text-[#143E2E] text-right leading-loose py-1 border-b border-[#ECE7DE]/60 line-clamp-2">
                          {meta.arabicOriginal}
                        </p>
                      )}

                      <p className="text-xs text-[#58635B] leading-relaxed line-clamp-2 pt-1">
                        {meta.urduTranslation ? meta.urduTranslation.substring(0, 140) + '...' : doc.content}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#ECE7DE]/60 mt-auto">
                    <span className="text-[10px] text-[#8E877D] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.max(3, Math.round((doc.content?.length || 600) / 250))} min read
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EBF3EE] text-[#143E2E] text-xs font-bold hover:bg-[#DDECE3] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Full</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {displayCount < passages.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayCount((prev) => prev + 24)}
                className="px-6 py-2.5 rounded-full bg-white border border-[#ECE7DE] text-[#18231C] text-xs font-bold hover:border-[#143E2E]/40 hover:bg-[#FBF9F5] shadow-xs transition-all"
              >
                Load More Passages ({passages.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* FULL PASSAGE DETAIL MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#ECE7DE] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DDECE3]">
                  {selectedDoc.metadata.passageType?.toUpperCase()} #{selectedDoc.metadata.passageNumber} • NAHJ AL-BALAGHA
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-[#18231C] mt-1">
                  {selectedDoc.metadata.passageTitle || `${selectedDoc.metadata.passageType} #${selectedDoc.metadata.passageNumber}`}
                </h3>
                <p className="text-xs text-[#8E877D]">
                  Compiled by al-Sharif al-Radi (d. 406 AH) • Author: Amir al-Mu&apos;minin Ali ibn Abi Talib (AS)
                </p>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-[#8E877D] hover:text-[#18231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher Tabs */}
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-2xl border border-[#ECE7DE]">
              <span className="text-xs font-semibold text-[#58635B] flex items-center gap-1.5 pl-2">
                <Languages className="w-3.5 h-3.5 text-[#143E2E]" />
                <span>Display View:</span>
              </span>
              <div className="flex items-center gap-1 text-xs">
                {(['dual', 'english', 'urdu', 'arabic'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setModalLanguage(lang)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all ${
                      modalLanguage === lang
                        ? 'bg-[#143E2E] text-white shadow-xs'
                        : 'text-[#58635B] hover:text-[#18231C]'
                    }`}
                  >
                    {lang === 'dual' ? 'Dual (Side-by-Side)' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Texts */}
            <div className="space-y-5">
              {/* Arabic Vocalized Text */}
              {(modalLanguage === 'arabic' || modalLanguage === 'dual') && selectedDoc.metadata.arabicOriginal && (
                <div className="p-6 rounded-2xl bg-[#F7F5EE] border border-[#ECE7DE]">
                  <span className="text-[10px] font-bold text-[#7A5835] uppercase tracking-wider block mb-2">
                    النص العربي الأصيل المعتمد (Vocalized Arabic Original)
                  </span>
                  <p className="font-arabic text-xl md:text-2xl text-[#143E2E] text-right leading-loose selection:bg-[#143E2E] selection:text-white">
                    {selectedDoc.metadata.arabicOriginal}
                  </p>
                </div>
              )}

              {/* English Translation */}
              {(modalLanguage === 'english' || modalLanguage === 'dual') && (
                <div className="p-6 rounded-2xl bg-white border border-[#ECE7DE] space-y-2">
                  <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider block">
                    English Translation (Syed Ali Reza Edition)
                  </span>
                  <p className="text-sm md:text-base text-[#18231C] leading-relaxed italic">
                    &ldquo;{selectedDoc.content}&rdquo;
                  </p>
                </div>
              )}

              {/* Urdu Translation */}
              {(modalLanguage === 'urdu' || modalLanguage === 'dual') && selectedDoc.metadata.urduTranslation && (
                <div className="p-6 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-2">
                  <span className="text-[10px] font-bold text-[#244866] uppercase tracking-wider block text-right">
                    اردو ترجمہ و تشریح (علامہ مفتی جعفر حسین / علامہ ذیشان حیدر جوادی)
                  </span>
                  <p className="text-sm md:text-base text-[#18231C] text-right leading-loose font-serif">
                    {selectedDoc.metadata.urduTranslation}
                  </p>
                </div>
              )}
            </div>

            {/* Canonical Reference & Tags */}
            <div className="p-4 rounded-2xl bg-[#EBF3EE]/60 border border-[#D2E4D8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#18231C]">
              <div>
                <span className="font-bold">Canonical Citation: </span>
                <span>
                  Nahj al-Balagha, {selectedDoc.metadata.passageType} #{selectedDoc.metadata.passageNumber}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(selectedDoc.metadata.topics || []).map((t, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-white border border-[#D2E4D8] text-[10px] font-semibold text-[#143E2E]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECE7DE]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(
                      `${selectedDoc.metadata.passageTitle}\n\nArabic:\n${selectedDoc.metadata.arabicOriginal || ''}\n\nEnglish:\n${selectedDoc.content}\n\nUrdu:\n${selectedDoc.metadata.urduTranslation || ''}`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:text-[#18231C] flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#143E2E]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => handleBookmark(selectedDoc)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:text-[#18231C] flex items-center gap-1.5 shadow-xs"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmark</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/reader?type=${selectedDoc.metadata.passageType}&number=${selectedDoc.metadata.passageNumber}`}
                  className="px-4 py-2 rounded-xl bg-[#FBF9F5] border border-[#ECE7DE] text-[#18231C] text-xs font-bold hover:bg-[#EBF3EE] transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read in Canonical Library</span>
                </Link>

                <Link
                  href={`/chat?q=${encodeURIComponent(
                    `Explain the deep wisdom and historical context of ${selectedDoc.metadata.passageType} #${selectedDoc.metadata.passageNumber} in Nahj al-Balagha: "${selectedDoc.metadata.passageTitle}"`
                  )}`}
                  className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reflect with Nahj AI</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-[#58635B] text-xs">
          Loading explorer...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
