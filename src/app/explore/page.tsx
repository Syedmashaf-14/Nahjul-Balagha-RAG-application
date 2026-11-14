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
  const [loading, setLoading] = useState(true);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);

  const fetchPassages = (searchQ?: string, type?: string) => {
    setLoading(true);
    const q = searchQ !== undefined ? searchQ : query;
    const t = type !== undefined ? type : selectedType;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (t) params.set('type', t);
    params.set('limit', '18');

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
            Discover sermons, letters, and sayings by theme, source, or question.
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
            placeholder="Search the collection"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ECE7DE] rounded-full text-xs md:text-sm text-[#18231C] placeholder-[#8E877D] shadow-sm focus:outline-none focus:border-[#143E2E]/40 focus:ring-1 focus:ring-[#143E2E]/30 transition-all"
          />
        </form>

        {/* Source Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All sources', value: '' },
            { label: 'Sermons', value: 'sermon' },
            { label: 'Letters', value: 'letter' },
            { label: 'Sayings', value: 'saying' },
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
        <span>{passages.length} curated results</span>
        <div className="flex items-center gap-1 text-[#58635B] hover:text-[#18231C] cursor-pointer font-medium">
          <span>Most relevant</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Passages Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#58635B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#143E2E] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-medium">Retrieving passages from knowledge base...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passages.map((doc, idx) => {
            const meta = doc.metadata;
            const arch = getArchStyle(idx);
            const topicKey = meta.topics?.[0]?.toLowerCase() || '';
            const arabicWord = ARABIC_MOTIFS[topicKey] || arch.arabic;
            const isBookmarked = bookmarkedId === doc.id;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-[#ECE7DE] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
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
                      <span className="text-[10px] font-bold tracking-widest text-[#58635B] uppercase bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#ECE7DE]/50">
                        {meta.passageType}
                      </span>

                      <button
                        onClick={() => handleBookmark(doc)}
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
                      {doc.content}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#ECE7DE]/60 mt-auto">
                  <div className="flex items-center gap-2">
                    {meta.topics?.[0] && (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#F5F2EB] text-[#58635B] border border-[#ECE7DE]">
                        {meta.topics[0]}
                      </span>
                    )}
                    <span className="text-[10px] text-[#8E877D] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.max(3, Math.round((doc.content?.length || 600) / 250))} min
                    </span>
                  </div>

                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `Explain ${meta.passageType} #${meta.passageNumber} in Nahj al-Balagha: "${meta.passageTitle}"`
                    )}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#143E2E] hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Explore</span>
                  </Link>
                </div>
              </div>
            );
          })}
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
