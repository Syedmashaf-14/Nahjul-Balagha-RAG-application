'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  Headphones,
  TrendingUp,
  Play,
  Clock,
  RefreshCw,
  Check,
  Eye,
  BookOpen,
} from 'lucide-react';
import { IDailyWisdom } from '@/types/api.types';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [wisdom, setWisdom] = useState<any>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(true);
  const [refreshingWisdom, setRefreshingWisdom] = useState(false);
  const [bookmarkedWisdom, setBookmarkedWisdom] = useState(false);

  const fetchWisdom = (forceRefresh: boolean = false) => {
    if (forceRefresh) setRefreshingWisdom(true);
    else setLoadingWisdom(true);

    const url = forceRefresh ? '/api/recommendations/daily?refresh=true' : '/api/recommendations/daily';
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setWisdom(json.data);
        }
      })
      .catch((err) => console.error('Failed to load daily wisdom:', err))
      .finally(() => {
        setLoadingWisdom(false);
        setRefreshingWisdom(false);
      });
  };

  useEffect(() => {
    fetchWisdom(false);
  }, []);

  const handleBookmarkWisdom = async () => {
    if (!wisdom) return;
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageType: wisdom.passageType,
          passageNumber: wisdom.passageNumber,
          title: `${wisdom.passageType?.toUpperCase()} #${wisdom.passageNumber}`,
          arabicText: wisdom.arabicText,
          translationText: wisdom.translationText,
          language: 'english',
          tags: ['daily_wisdom', wisdom.topic || 'wisdom'],
        }),
      });
      setBookmarkedWisdom(true);
      setTimeout(() => setBookmarkedWisdom(false), 2500);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const todayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const islamicDate = wisdom?.islamicDate || 'Jumada II 4, 1448 AH';

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Greeting Header matching Image 1 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E877D]">
              {todayDate}
            </span>
            <span className="text-[#8E877D] text-xs">•</span>
            <span className="text-[11px] font-bold text-[#143E2E] uppercase tracking-wider bg-[#EBF3EE] px-2 py-0.5 rounded-md">
              {islamicDate}
            </span>
          </div>
          <h1 className="font-serif-title text-3xl md:text-4xl text-[#18231C] tracking-tight font-medium">
            {user.isGuest
              ? 'As-salāmu ‘alaykum, Welcome User'
              : `As-salāmu ‘alaykum, ${user.name.split(' ')[0]}`}
          </h1>
          <p className="text-xs md:text-sm text-[#58635B] mt-1">
            Continue your journey through timeless wisdom of Nahj al-Balagha.
          </p>
        </div>

        <div className="flex items-center gap-2 text-right">
          <TrendingUp className="w-4 h-4 text-[#143E2E]" />
          <div>
            <span className="text-xs font-bold text-[#18231C] block leading-tight">799 passages</span>
            <span className="text-[10px] text-[#8E877D]">in canonical library</span>
          </div>
        </div>
      </div>

      {/* 2. Today's Wisdom Hero Banner matching Image 1 & User Request for Dynamic/AI quotes */}
      <section className="relative rounded-3xl bg-geometric-rings text-white p-6 md:p-10 shadow-md overflow-hidden">
        {/* Banner Top Bar */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#C1DFC9] uppercase tracking-wider mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F2D07C]" />
            <span>TODAY&apos;S WISDOM • {wisdom?.islamicMonth || 'JUMADA II'} FOCUS</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchWisdom(true)}
              disabled={refreshingWisdom}
              title="Generate new daily wisdom with AI"
              className="flex items-center gap-1 text-[11px] font-medium text-[#C1DFC9] hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${refreshingWisdom ? 'animate-spin' : ''}`} />
              <span>{refreshingWisdom ? 'Selecting...' : 'New Wisdom'}</span>
            </button>
            <span className="tracking-widest">
              {wisdom ? `${wisdom.passageType.toUpperCase()} ${wisdom.passageNumber}` : 'SAYING 81'}
            </span>
          </div>
        </div>

        {/* Banner Main Quote */}
        <div className="max-w-3xl mx-auto text-center space-y-4 py-2">
          <p className="font-arabic text-2xl md:text-3xl text-[#F9F7EE] leading-loose font-normal">
            {wisdom?.arabicText || 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ'}
          </p>

          <p className="font-serif-title text-xl md:text-2xl text-white font-medium italic">
            &ldquo;{wisdom?.translationText || 'The worth of every person is in what they do well.'}&rdquo;
          </p>

          {wisdom?.urduTranslation && (
            <p className="font-serif text-sm md:text-base text-[#DDECE3] max-w-xl mx-auto leading-loose text-center opacity-90">
              {wisdom.urduTranslation.length > 180 ? wisdom.urduTranslation.substring(0, 180) + '...' : wisdom.urduTranslation}
            </p>
          )}

          <p className="text-xs text-[#C6DFD0] max-w-xl mx-auto leading-relaxed pt-1">
            {wisdom?.reflectionQuestion ||
              'A brief teaching on excellence, purpose, and recognizing the value carried in one’s abilities and virtues.'}
          </p>
        </div>

        {/* Banner Bottom Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 text-xs">
          <Link
            href={`/chat?q=${encodeURIComponent(
              wisdom
                ? `Explain the context and deeper wisdom of ${wisdom.passageType} ${wisdom.passageNumber} in Nahj al-Balagha: "${wisdom.translationText}"`
                : 'Explain Saying 81: "The worth of every person is in what they do well."'
            )}`}
            className="flex items-center gap-1.5 text-[#E6F3EB] hover:text-white font-medium transition-colors"
          >
            <span>Explore this saying with Nahj AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-3 text-[#C6DFD0]">
            <Link
              href={`/reader?type=${wisdom?.passageType || 'saying'}&number=${wisdom?.passageNumber || 81}`}
              className="hover:text-white transition-colors"
              title="Read in Canonical Library"
            >
              <BookOpen className="w-4 h-4" />
            </Link>
            <button
              onClick={handleBookmarkWisdom}
              title="Bookmark wisdom"
              className="hover:text-white transition-colors"
            >
              {bookmarkedWisdom ? <Check className="w-4 h-4 text-[#F2D07C]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* 3. YOUR JOURNEY / Continue Learning Section matching Image 1 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-[#18231C] tracking-tight">
            Continue learning
          </h2>
          <Link
            href="/learn"
            className="text-xs font-semibold text-[#143E2E] hover:underline flex items-center gap-1"
          >
            <span>View learning path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Split Card */}
        <div className="rounded-3xl card-base card-hover overflow-hidden flex flex-col md:flex-row">
          {/* Left Arch Graphic */}
          <div className="md:w-1/3 bg-[#DDECE3] p-8 flex flex-col items-center justify-center relative min-h-[160px]">
            {/* Elegant Arch Silhouette */}
            <div className="w-24 h-32 border-2 border-[#143E2E]/20 arch-shape flex items-center justify-center bg-white/40">
              <span className="font-arabic text-3xl text-[#143E2E] font-bold">ع</span>
            </div>
            <span className="text-[11px] font-bold text-[#143E2E] mt-4 uppercase tracking-wider">
              Leadership & Governance
            </span>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-4 bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8E877D] mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">LESSON 3 OF 8</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    14 MIN
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#18231C] font-bold text-[10px]">
                    LETTER 53
                  </span>
                </div>
              </div>

              <h3 className="font-serif-title text-xl md:text-2xl font-bold text-[#18231C]">
                Justice as the pillar of leadership
              </h3>
              <p className="text-xs text-[#58635B] mt-1.5 leading-relaxed">
                Explore how justice, responsibility, and compassion shape ethical governance through Letter 53 to Malik al-Ashtar.
              </p>
            </div>

            {/* Progress Bar & Continue Button */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#ECE7DE] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#143E2E] h-full rounded-full" style={{ width: '38%' }} />
                </div>
                <span className="text-[11px] font-bold text-[#8E877D]">38%</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143E2E] hover:bg-[#0E2F23] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Continue lesson</span>
                </Link>

                <Link
                  href="/explore?type=letter"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#ECE7DE] hover:bg-[#EBF3EE] text-[#18231C] text-xs font-semibold transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-[#143E2E]" />
                  <span>Read Letter 53 Full</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELECTED FOR YOU / Recommended Readings matching Image 1 & 2 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[#18231C] tracking-tight">
              Recommended readings
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-[#143E2E] hover:underline flex items-center gap-1"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Reading Cards with Arches — fully clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Sermon 216 */}
          <Link
            href="/explore?type=sermon&q=216"
            className="card-base card-hover rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div className="bg-[#DDECE3] h-32 flex items-center justify-center relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#143E2E]">
                SERMON
              </span>
              <div className="w-16 h-20 border-2 border-[#143E2E]/20 arch-shape flex items-center justify-center bg-white/30">
                <span className="font-arabic text-xl font-bold text-[#143E2E]">عدل</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8E877D] tracking-wider block">
                  SERMON 216
                </span>
                <h3 className="font-serif-title font-bold text-base text-[#18231C] group-hover:text-[#143E2E] transition-colors mt-1 leading-snug">
                  Justice is the foundation of order
                </h3>
                <p className="text-xs text-[#58635B] mt-1.5 line-clamp-2 leading-relaxed">
                  A profound reflection on mutual rights, responsibility, and the moral basis of fair governance.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
                <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#58635B] font-medium text-[10px]">
                  Justice
                </span>
                <span className="flex items-center gap-1 text-[#143E2E] font-semibold">
                  Read Sermon →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Letter 31 */}
          <Link
            href="/explore?type=letter&q=31"
            className="card-base card-hover rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div className="bg-[#F0ECE1] h-32 flex items-center justify-center relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#4D4536]">
                LETTER
              </span>
              <div className="w-16 h-20 border-2 border-[#4D4536]/20 arch-shape flex items-center justify-center bg-white/30">
                <span className="font-arabic text-xl font-bold text-[#4D4536]">نصح</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8E877D] tracking-wider block">
                  LETTER 31
                </span>
                <h3 className="font-serif-title font-bold text-base text-[#18231C] group-hover:text-[#143E2E] transition-colors mt-1 leading-snug">
                  A father&apos;s counsel to his son
                </h3>
                <p className="text-xs text-[#58635B] mt-1.5 line-clamp-2 leading-relaxed">
                  Timeless guidance on character, humility, knowledge, and navigating through the world wisely.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
                <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#58635B] font-medium text-[10px]">
                  Character
                </span>
                <span className="flex items-center gap-1 text-[#143E2E] font-semibold">
                  Read Letter →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: Saying 147 */}
          <Link
            href="/explore?type=saying&q=147"
            className="card-base card-hover rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div className="bg-[#E2EAF0] h-32 flex items-center justify-center relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#2B4353]">
                SAYING
              </span>
              <div className="w-16 h-20 border-2 border-[#2B4353]/20 arch-shape flex items-center justify-center bg-white/30">
                <span className="font-arabic text-xl font-bold text-[#2B4353]">علم</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8E877D] tracking-wider block">
                  SAYING 147
                </span>
                <h3 className="font-serif-title font-bold text-base text-[#18231C] group-hover:text-[#143E2E] transition-colors mt-1 leading-snug">
                  The worth of knowledge
                </h3>
                <p className="text-xs text-[#58635B] mt-1.5 line-clamp-2 leading-relaxed">
                  On the enduring value of knowledge over wealth, and the responsibility carried by those who possess it.
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
                <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#58635B] font-medium text-[10px]">
                  Knowledge
                </span>
                <span className="flex items-center gap-1 text-[#143E2E] font-semibold">
                  Read Saying →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
