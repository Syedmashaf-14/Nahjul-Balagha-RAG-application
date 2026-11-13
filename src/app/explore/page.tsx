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
  Compass,
} from 'lucide-react';
import { RetrievedDocument, PassageType } from '@/types/passage.types';

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
    params.set('limit', '12');

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
      setTimeout(() => setBookmarkedId(null), 2000);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-emerald-400" />
            Passage Explorer
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse and search through sermons, letters, and sayings with parallel Arabic and English texts.
          </p>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { label: 'All', value: '' },
            { label: 'Sermons (Khutbat)', value: 'sermon' },
            { label: 'Letters (Kutub)', value: 'letter' },
            { label: 'Sayings (Hikam)', value: 'saying' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => handleTypeSelect(item.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === item.value
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, quotes, or numbers (e.g. Letter 53, Sermon 193, Justice, Sabr)..."
            className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          Search
        </button>
      </form>

      {/* Passages Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
          <p className="text-xs">Retrieving passages from knowledge base...</p>
        </div>
      ) : passages.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 p-8">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No matching passages found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or select another category like Sermons or Sayings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {passages.map((doc) => {
            const meta = doc.metadata;
            return (
              <div
                key={doc.id}
                className="glass-panel glass-panel-hover rounded-3xl p-6 border border-slate-800/90 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/70 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {meta.passageType} #{meta.passageNumber}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1">
                        {meta.passageTitle}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleBookmark(doc)}
                      className={`p-2 rounded-xl border transition-colors ${
                        bookmarkedId === doc.id
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400'
                      }`}
                      title="Bookmark passage"
                    >
                      {bookmarkedId === doc.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {meta.arabicOriginal && (
                    <div className="my-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-850">
                      <p className="font-arabic text-lg text-amber-100 text-right leading-loose">
                        {meta.arabicOriginal.length > 250
                          ? meta.arabicOriginal.substring(0, 250) + '...'
                          : meta.arabicOriginal}
                      </p>
                    </div>
                  )}

                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/30 pl-3">
                    &ldquo;{doc.content.length > 350
                      ? doc.content.substring(0, 350) + '...'
                      : doc.content}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {meta.topics?.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `Explain ${meta.passageType} #${meta.passageNumber} in Nahj al-Balagha: "${meta.passageTitle}"`
                    )}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explore with AI</span>
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
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-xs">Loading explorer...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
