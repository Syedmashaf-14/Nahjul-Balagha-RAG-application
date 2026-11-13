'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Sparkles, BookOpen, ExternalLink } from 'lucide-react';
import { IBookmark } from '@/types/api.types';

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
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Bookmark className="w-7 h-7 text-emerald-400" />
          Saved Passages & Bookmarks
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Your personal collection of revered sermons, letters, and aphorisms for continued contemplation.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 p-8">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Bookmarks Saved Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            While exploring passages or interacting with the AI companion, click the bookmark icon to save passages here.
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
          >
            <span>Explore Passages</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((b) => (
            <div
              key={b._id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {b.passageType} #{b.passageNumber}
                  </span>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white mt-2">{b.title}</h3>

                {b.arabicText && (
                  <p className="font-arabic text-base text-amber-200 text-right leading-loose my-2 p-2 rounded-xl bg-slate-950/50">
                    {b.arabicText}
                  </p>
                )}

                {b.translationText && (
                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/30 pl-2.5">
                    &ldquo;{b.translationText}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Translator: {b.translator || 'Syed Ali Reza'}
                </span>
                <Link
                  href={`/chat?q=${encodeURIComponent(
                    `Explain the context and deeper moral meaning of ${b.passageType} #${b.passageNumber}`
                  )}`}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
