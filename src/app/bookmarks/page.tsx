'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Sparkles, BookOpen, Clock } from 'lucide-react';
import { IBookmark } from '@/types/api.types';

const ARABIC_MOTIFS: Record<string, string> = {
  justice: 'عدل',
  leadership: 'حكم',
  patience: 'صبر',
  knowledge: 'علم',
  piety: 'تقوى',
  character: 'نصح',
  wisdom: 'حكمة',
  sermon: 'خطبة',
  letter: 'نصح',
  saying: 'حكمة',
};

function getArchStyle(type: string, index: number) {
  const styles = [
    { bg: 'bg-[#F0ECE1]', arabic: 'نصح' }, // Sand (Letter 31 style)
    { bg: 'bg-[#DDECE3]', arabic: 'عدل' }, // Sage
    { bg: 'bg-[#E2EAF0]', arabic: 'علم' }, // Sky
  ];
  return styles[index % styles.length];
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<IBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = () => {
    setLoading(true);
    fetch('/api/bookmarks')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBookmarks(json.data.bookmarks || []);
        }
      })
      .catch((err) => console.error('Error fetching bookmarks:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
          YOUR LIBRARY
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
          Saved passages
        </h1>
        <p className="text-xs md:text-sm text-[#58635B]">
          Return to the wisdom you want to reflect on and remember.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-[#58635B]">
          <div className="w-8 h-8 rounded-full border-2 border-[#143E2E] border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Loading your library...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-xs max-w-xl mx-auto">
          <BookOpen className="w-10 h-10 text-[#8E877D] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#18231C]">No Passages Saved Yet</h3>
          <p className="text-xs text-[#58635B] mt-1 max-w-sm mx-auto">
            While exploring passages or interacting with Nahj AI, click the bookmark icon to save reflections to your library.
          </p>
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#143E2E] text-white text-xs font-bold shadow-xs hover:bg-[#194B37] transition-all"
          >
            <span>Explore Collection</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((b, idx) => {
            const arch = getArchStyle(b.passageType, idx);
            const topic = b.tags?.[0] || 'Reflections';
            const arabicWord = ARABIC_MOTIFS[topic.toLowerCase()] || arch.arabic;

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-[#ECE7DE] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Arch Illustration Area (Matching Screenshot 4) */}
                  <div className={`h-40 ${arch.bg} relative p-4 flex flex-col justify-between overflow-hidden`}>
                    {/* Concentric subtle background curves */}
                    <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-20">
                      <div className="w-48 h-48 rounded-full border border-[#143E2E] absolute -top-10 -right-10" />
                      <div className="w-36 h-36 rounded-full border border-[#143E2E] absolute top-2 right-2" />
                    </div>

                    {/* Top Row: Type Pill & Ribbon Bookmark */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[10px] font-bold tracking-widest text-[#58635B] uppercase bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#ECE7DE]/50">
                        {b.passageType}
                      </span>

                      {/* Forest Green Ribbon Bookmark */}
                      <div className="w-7 h-7 rounded-full bg-[#143E2E] text-white flex items-center justify-center shadow-xs">
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </div>
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
                      {b.passageType} {b.passageNumber}
                    </span>

                    <h3 className="text-base font-serif font-bold text-[#18231C] group-hover:text-[#143E2E] transition-colors line-clamp-1">
                      {b.title}
                    </h3>

                    {/* Arabic Text if saved */}
                    {b.arabicText && (
                      <p className="font-arabic text-sm text-[#143E2E] text-right leading-loose py-1 border-b border-[#ECE7DE]/60 line-clamp-2">
                        {b.arabicText}
                      </p>
                    )}

                    <p className="text-xs text-[#58635B] leading-relaxed line-clamp-2 pt-1">
                      {b.translationText}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#ECE7DE]/60 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#EBF3EE] text-[#58635B] border border-[#D2E4D8]">
                      {topic}
                    </span>
                    <span className="text-[10px] text-[#8E877D] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      12 min
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/chat?q=${encodeURIComponent(
                        `Explain ${b.passageType} #${b.passageNumber}: "${b.title}"`
                      )}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#143E2E] hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Reflect</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1 text-[#8E877D] hover:text-red-500 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
