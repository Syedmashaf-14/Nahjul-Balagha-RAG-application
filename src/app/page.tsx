'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Compass,
  GraduationCap,
  Bookmark,
  Share2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { IDailyWisdom } from '@/types/api.types';

export default function DashboardPage() {
  const [wisdom, setWisdom] = useState<IDailyWisdom | null>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(true);

  useEffect(() => {
    fetch('/api/recommendations/daily')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setWisdom(json.data);
        }
      })
      .catch((err) => console.error('Failed to load daily wisdom:', err))
      .finally(() => setLoadingWisdom(false));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-10 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-950/80">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Knowledge Platform</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Explore the Peak of Eloquence
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-300 leading-relaxed">
            Welcome to your intelligent learning companion for Nahj al-Balagha. Discover sermons,
            governance treaties, and ethical maxims with verified citations and personalized guidance.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Converse with AI Companion</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-all"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Browse All Passages</span>
            </Link>
          </div>
        </div>

        {/* Decorative Calligraphy watermark */}
        <div className="absolute right-4 -bottom-6 font-arabic text-8xl md:text-9xl text-emerald-500/5 select-none pointer-events-none font-bold">
          نهج البلاغة
        </div>
      </section>

      {/* Daily Wisdom Card */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950/70">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider text-xs">
              Daily Wisdom & Contemplation
            </h2>
          </div>
          {wisdom && (
            <span className="text-xs text-slate-400 font-medium capitalize">
              {wisdom.passageType} #{wisdom.passageNumber} • {wisdom.topic}
            </span>
          )}
        </div>

        {loadingWisdom ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
            <p className="text-xs">Preparing personalized contemplation...</p>
          </div>
        ) : wisdom ? (
          <div className="space-y-6">
            {wisdom.arabicText && (
              <p className="font-arabic text-xl md:text-2xl text-amber-100 text-right leading-loose font-normal">
                {wisdom.arabicText}
              </p>
            )}

            <p className="text-slate-200 text-base md:text-lg leading-relaxed italic border-l-2 border-amber-500/40 pl-4">
              &ldquo;{wisdom.translationText}&rdquo;
            </p>

            {wisdom.reflectionQuestion && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Reflection Prompt:
                </span>
                <p className="text-sm text-slate-300 font-medium">
                  {wisdom.reflectionQuestion}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/chat?q=${encodeURIComponent(
                  `Can you explain the context and deeper ethical implications of ${wisdom.passageType} ${wisdom.passageNumber}: "${wisdom.translationText.substring(0, 80)}"?`
                )}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Explore this passage with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No daily wisdom available at the moment.</p>
        )}
      </section>

      {/* Core Divisions & Topics Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">The Three Sections</h2>
            <p className="text-xs text-slate-400">The historical compilations of al-Sharif al-Radi</p>
          </div>
          <Link href="/explore" className="text-xs font-semibold text-emerald-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/explore?type=sermon"
            className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">The Sermons (Khutbat)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              241 profound discourses on theology, creation of the universe, piety, and the destiny of mankind.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span>Read Sermons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/explore?type=letter"
            className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-3 border border-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">The Letters (Kutub)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              79 historical instructions and political treatises, including the universal charter of governance (Letter 53).
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
              <span>Read Letters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/explore?type=saying"
            className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold mb-3 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Maxims & Sayings (Hikam)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              480 concise ethical aphorisms on human nature, wisdom, virtue, self-discipline, and righteousness.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>Read Sayings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Thematic Learning Topics */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Thematic Explorations</h2>
            <p className="text-xs text-slate-400">Curated ethical concepts across all passages</p>
          </div>
          <Link href="/learn" className="text-xs font-semibold text-emerald-400 hover:underline">
            Start Course
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {[
            { name: 'Justice & Fairness', topic: 'justice' },
            { name: 'Leadership & Governance', topic: 'governance' },
            { name: 'Patience (Sabr)', topic: 'patience' },
            { name: 'Knowledge & True Scholars', topic: 'knowledge' },
            { name: 'Piety & Taqwa', topic: 'piety' },
            { name: 'Human Rights', topic: 'human_rights' },
            { name: 'Worldly Detachment (Zuhd)', topic: 'worldly_detachment' },
            { name: 'Self-Discipline & Ethics', topic: 'ethics_morality' },
          ].map((t) => (
            <Link
              key={t.topic}
              href={`/learn?topic=${t.topic}`}
              className="px-4 py-2 rounded-xl glass-panel glass-panel-hover border border-slate-800 text-xs font-semibold text-slate-200 hover:text-emerald-400 hover:border-emerald-500/40"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
