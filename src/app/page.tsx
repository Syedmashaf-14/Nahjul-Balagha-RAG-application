'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Play,
  Clock,
  RefreshCw,
  Check,
  Eye,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const { language, isUrdu, t } = useLanguage();
  const [wisdom, setWisdom] = useState<any>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(true);
  const [refreshingWisdom, setRefreshingWisdom] = useState(false);
  const [bookmarkedWisdom, setBookmarkedWisdom] = useState(false);

  const fetchWisdom = (forceRefresh: boolean = false) => {
    if (forceRefresh) setRefreshingWisdom(true);
    else setLoadingWisdom(true);

    const url = forceRefresh
      ? `/api/recommendations/daily?refresh=true&_t=${Date.now()}`
      : '/api/recommendations/daily';

    fetch(url, { cache: 'no-store' })
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
          language: isUrdu ? 'urdu' : 'english',
          tags: ['daily_wisdom', wisdom.topic || 'wisdom'],
        }),
      });
      setBookmarkedWisdom(true);
      setTimeout(() => setBookmarkedWisdom(false), 2500);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const todayDate = new Intl.DateTimeFormat(isUrdu ? 'ur-PK' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const islamicDate = isUrdu
    ? (wisdom?.islamicMonth ? `جمادی الثانی، ۱۴۴۸ ھ` : 'جمادی الثانی، ۱۴۴۸ ھ')
    : (wisdom?.islamicDate || 'Jumada II 4, 1448 AH');

  const getPassageBadge = () => {
    if (!wisdom) return isUrdu ? 'حکمت ۸۱' : 'SAYING 81';
    const type = wisdom.passageType?.toLowerCase();
    if (isUrdu) {
      if (type === 'dua') return `دعا نمبر ${wisdom.passageNumber}`;
      if (type === 'sermon') return `خطبہ نمبر ${wisdom.passageNumber}`;
      if (type === 'letter') return `مکتوب نمبر ${wisdom.passageNumber}`;
      return `حکمت نمبر ${wisdom.passageNumber}`;
    }
    return `${wisdom.passageType.toUpperCase()} ${wisdom.passageNumber}`;
  };

  return (
    <div className="space-y-8 md:space-y-10 pb-16">
      {/* 1. Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E877D]">
              {todayDate}
            </span>
            <span className="text-[#8E877D] text-xs">•</span>
            <span className="text-[11px] font-bold text-[#143E2E] uppercase tracking-wider bg-[#EBF3EE] px-2 py-0.5 rounded-md font-arabic">
              {islamicDate}
            </span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl md:text-4xl text-[#18231C] tracking-tight font-medium">
            {user.isGuest
              ? (isUrdu ? 'السلام علیکم، خوش آمدید' : 'As-salāmu ‘alaykum, Welcome User')
              : (isUrdu ? `السلام علیکم، ${user.name}` : `As-salāmu ‘alaykum, ${user.name.split(' ')[0]}`)}
          </h1>
          <p className="text-xs md:text-sm text-[#58635B] mt-1">
            {isUrdu
              ? 'نہج البلاغہ کے لازوال کلام، علم اور حکمت کا بصیرت انگیز سفر جاری رکھیں۔'
              : 'Continue your journey through timeless wisdom of Nahj al-Balagha.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-left sm:text-right shrink-0">
          <TrendingUp className="w-4 h-4 text-[#143E2E]" />
          <div>
            <span className="text-xs font-bold text-[#18231C] block leading-tight">
              {isUrdu ? '۷۹۹ مستند متون' : '799 passages'}
            </span>
            <span className="text-[10px] text-[#8E877D]">
              {isUrdu ? 'کینونیکل لائبریری میں' : 'in canonical library'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Today's Wisdom Hero Banner */}
      <section className="relative rounded-3xl bg-geometric-rings text-white p-5 sm:p-8 md:p-10 shadow-md overflow-hidden">
        {/* Banner Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold text-[#C1DFC9] uppercase tracking-wider mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F2D07C] shrink-0" />
            <span className={isUrdu ? 'font-arabic text-xs' : ''}>
              {isUrdu
                ? 'آج کی حکمت • ماہانہ روحانی توجہ'
                : `TODAY'S WISDOM • ${wisdom?.islamicMonth || 'JUMADA II'} FOCUS`}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchWisdom(true)}
              disabled={refreshingWisdom}
              title="Select another authentic quote, saying, or supplication"
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#C1DFC9] hover:text-white bg-white/10 hover:bg-white/20 active:bg-white/30 px-3 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingWisdom ? 'animate-spin' : ''}`} />
              <span className={isUrdu ? 'font-arabic text-xs' : ''}>
                {refreshingWisdom
                  ? (isUrdu ? 'منتخب ہو رہا ہے...' : 'Selecting...')
                  : (isUrdu ? 'نئی حکمت / دعا' : 'New Wisdom')}
              </span>
            </button>

            <span className="tracking-widest font-mono text-[11px] bg-white/10 px-2.5 py-1 rounded-full">
              {getPassageBadge()}
            </span>
          </div>
        </div>

        {/* Banner Main Quote */}
        <div className="max-w-3xl mx-auto text-center space-y-4 py-2">
          {/* Arabic Authentic Text */}
          <p className="font-arabic text-xl sm:text-2xl md:text-3xl text-[#F9F7EE] leading-relaxed sm:leading-loose font-normal px-2 break-words">
            {wisdom?.arabicText || 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ'}
          </p>

          {/* Translation depending on language preference */}
          {isUrdu && wisdom?.urduTranslation ? (
            <p className="font-serif text-base sm:text-lg md:text-xl text-[#F4F1EA] max-w-2xl mx-auto leading-relaxed sm:leading-loose text-center font-medium px-2">
              &ldquo;{wisdom.urduTranslation}&rdquo;
            </p>
          ) : (
            <p className="font-serif-title text-base sm:text-xl md:text-2xl text-white font-medium italic px-2">
              &ldquo;{wisdom?.translationText || 'The worth of every person is in what they do well.'}&rdquo;
            </p>
          )}

          {/* Bilingual secondary translation preview */}
          {!isUrdu && wisdom?.urduTranslation && (
            <p className="font-serif text-xs sm:text-sm text-[#DDECE3] max-w-xl mx-auto leading-relaxed text-center opacity-90 px-2">
              {wisdom.urduTranslation.length > 200
                ? wisdom.urduTranslation.substring(0, 200) + '...'
                : wisdom.urduTranslation}
            </p>
          )}

          {isUrdu && wisdom?.translationText && (
            <p className="font-serif text-xs sm:text-sm text-[#C6DFD0] max-w-xl mx-auto leading-relaxed text-center italic opacity-85 px-2">
              &ldquo;{wisdom.translationText.length > 200 ? wisdom.translationText.substring(0, 200) + '...' : wisdom.translationText}&rdquo;
            </p>
          )}

          <p className="text-[11px] sm:text-xs text-[#C6DFD0] max-w-xl mx-auto leading-relaxed pt-1 px-2">
            {isUrdu
              ? 'امیر المومنین علیہ السلام کا یہ فرمان حق، حکمت، اور اخلاقی کمالات کی عکاسی کرتا ہے۔'
              : (wisdom?.reflectionQuestion ||
                'A brief teaching on excellence, purpose, and recognizing the value carried in one’s abilities and virtues.')}
          </p>
        </div>

        {/* Banner Bottom Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-white/10 mt-5 text-xs">
          <Link
            href={`/chat?q=${encodeURIComponent(
              wisdom
                ? (isUrdu
                    ? `نہج البلاغہ کے ${wisdom.passageType} نمبر ${wisdom.passageNumber} کی تفصیلی وضاحت فرمائیں: "${wisdom.urduTranslation || wisdom.translationText}"`
                    : `Explain the context and deeper wisdom of ${wisdom.passageType} ${wisdom.passageNumber} in Nahj al-Balagha: "${wisdom.translationText}"`)
                : 'Explain Saying 81: "The worth of every person is in what they do well."'
            )}`}
            className="flex items-center gap-1.5 text-[#E6F3EB] hover:text-white font-medium transition-colors"
          >
            <span className={isUrdu ? 'font-arabic text-sm' : ''}>
              {isUrdu ? 'اس کلام کی حکمت نہج اے آئی سے دریافت کریں' : 'Explore this saying with Nahj AI'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-3 text-[#C6DFD0]">
            <Link
              href={`/reader?type=${wisdom?.passageType || 'saying'}&number=${wisdom?.passageNumber || 81}`}
              className="hover:text-white transition-colors"
              title={isUrdu ? 'لائبریری میں مطالعہ کریں' : 'Read in Canonical Library'}
            >
              <BookOpen className="w-4 h-4" />
            </Link>
            <button
              onClick={handleBookmarkWisdom}
              title={isUrdu ? 'محفوظ کریں' : 'Bookmark wisdom'}
              className="hover:text-white transition-colors"
            >
              {bookmarkedWisdom ? <Check className="w-4 h-4 text-[#F2D07C]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* 3. YOUR JOURNEY / Continue Learning Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-[#18231C] tracking-tight">
            {isUrdu ? 'مطالعہ اور اسباق جاری رکھیں' : 'Continue learning'}
          </h2>
          <Link
            href="/learn"
            className="text-xs font-semibold text-[#143E2E] hover:underline flex items-center gap-1"
          >
            <span>{isUrdu ? 'مکمل نصاب دیکھیں' : 'View learning path'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Split Card */}
        <div className="rounded-3xl card-base card-hover overflow-hidden flex flex-col md:flex-row">
          {/* Left Arch Graphic */}
          <div className="md:w-1/3 bg-[#DDECE3] p-6 sm:p-8 flex flex-col items-center justify-center relative min-h-[140px] md:min-h-[160px]">
            <div className="w-20 h-28 sm:w-24 sm:h-32 border-2 border-[#143E2E]/20 arch-shape flex items-center justify-center bg-white/40">
              <span className="font-arabic text-2xl sm:text-3xl text-[#143E2E] font-bold">ع</span>
            </div>
            <span className="text-[11px] font-bold text-[#143E2E] mt-3 sm:mt-4 uppercase tracking-wider text-center">
              {isUrdu ? 'حکمرانی و عدل' : 'Leadership & Governance'}
            </span>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-between space-y-4 bg-white">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8E877D] mb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  {isUrdu ? 'سبق ۳ از ۸' : 'LESSON 3 OF 8'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {isUrdu ? '۱۴ منٹ' : '14 MIN'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#18231C] font-bold text-[10px]">
                    {isUrdu ? 'مکتوب ۵۳' : 'LETTER 53'}
                  </span>
                </div>
              </div>

              <h3 className="font-serif-title text-xl md:text-2xl font-bold text-[#18231C]">
                {isUrdu ? 'عدل: قیادت و حکمرانی کی اصل بنیاد' : 'Justice as the pillar of leadership'}
              </h3>
              <p className="text-xs text-[#58635B] mt-1.5 leading-relaxed">
                {isUrdu
                  ? 'مالک اشتر کے نام تاریخی عہد نامے (مکتوب ۵۳) کی روشنی میں عدل، معاشرتی ہمدردی اور دیانتدارانہ حکمرانی کے اصولوں کا مطالعہ۔'
                  : 'Explore how justice, responsibility, and compassion shape ethical governance through Letter 53 to Malik al-Ashtar.'}
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

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143E2E] hover:bg-[#0E2F23] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isUrdu ? 'سبق جاری رکھیں' : 'Continue lesson'}</span>
                </Link>

                <Link
                  href="/explore?type=letter&q=53"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#ECE7DE] hover:bg-[#EBF3EE] text-[#18231C] text-xs font-semibold transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-[#143E2E]" />
                  <span>{isUrdu ? 'مکمل مکتوب ۵۳ پڑھیں' : 'Read Letter 53 Full'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELECTED FOR YOU / Recommended Readings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-[#18231C] tracking-tight">
            {isUrdu ? 'منتخب خطبات و فرامین' : 'Recommended readings'}
          </h2>
          <Link
            href="/explore"
            className="text-xs font-semibold text-[#143E2E] hover:underline flex items-center gap-1"
          >
            <span>{isUrdu ? 'تمام کلام دیکھیں' : 'Explore all'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Reading Cards with Arches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Sermon 216 */}
          <Link
            href="/explore?type=sermon&q=216"
            className="card-base card-hover rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div className="bg-[#DDECE3] h-28 sm:h-32 flex items-center justify-center relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#143E2E]">
                {isUrdu ? 'خطبہ' : 'SERMON'}
              </span>
              <div className="w-14 h-18 sm:w-16 sm:h-20 border-2 border-[#143E2E]/20 arch-shape flex items-center justify-center bg-white/30">
                <span className="font-arabic text-xl font-bold text-[#143E2E]">عدل</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8E877D] tracking-wider block">
                  {isUrdu ? 'خطبہ ۲۱۶' : 'SERMON 216'}
                </span>
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#18231C] group-hover:text-[#143E2E] transition-colors mt-1 leading-snug">
                  {isUrdu ? 'عدل اور باہمی حقوق کا نظام' : 'Justice is the foundation of order'}
                </h3>
                <p className="text-xs text-[#58635B] mt-1.5 line-clamp-2 leading-relaxed">
                  {isUrdu
                    ? 'والی اور رعیت کے باہمی حقوق، عدل کی برکت اور معاشرتی امن پر امیر المومنین کا بلیغ خطبہ۔'
                    : 'A profound reflection on mutual rights, responsibility, and the moral basis of fair governance.'}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
                <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#58635B] font-medium text-[10px]">
                  {isUrdu ? 'عدل و انصاف' : 'Justice'}
                </span>
                <span className="flex items-center gap-1 text-[#143E2E] font-semibold">
                  {isUrdu ? 'خطبہ پڑھیں ←' : 'Read Sermon →'}
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Letter 31 */}
          <Link
            href="/explore?type=letter&q=31"
            className="card-base card-hover rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div className="bg-[#F0ECE1] h-28 sm:h-32 flex items-center justify-center relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#4D4536]">
                {isUrdu ? 'مکتوب' : 'LETTER'}
              </span>
              <div className="w-14 h-18 sm:w-16 sm:h-20 border-2 border-[#4D4536]/20 arch-shape flex items-center justify-center bg-white/30">
                <span className="font-arabic text-xl font-bold text-[#4D4536]">نصح</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8E877D] tracking-wider block">
                  {isUrdu ? 'مکتوب ۳۱' : 'LETTER 31'}
                </span>
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#18231C] group-hover:text-[#143E2E] transition-colors mt-1 leading-snug">
                  {isUrdu ? 'فرزند کے نام وصیت اور پند و نصائح' : 'A father’s counsel to his son'}
                </h3>
                <p className="text-xs text-[#58635B] mt-1.5 line-clamp-2 leading-relaxed">
                  {isUrdu
                    ? 'تہذیب نفس، عفت، زمانے کے نشیب و فراز اور اللہ پر توکل کے متعلق لازوال ہدایات۔'
                    : 'Timeless guidance on character, humility, knowledge, and navigating through the world wisely.'}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
                <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#58635B] font-medium text-[10px]">
                  {isUrdu ? 'تربیت و اخلاق' : 'Character'}
                </span>
                <span className="flex items-center gap-1 text-[#143E2E] font-semibold">
                  {isUrdu ? 'مکتوب پڑھیں ←' : 'Read Letter →'}
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: Saying 147 */}
          <Link
            href="/explore?type=saying&q=147"
            className="card-base card-hover rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer sm:col-span-2 md:col-span-1"
          >
            <div className="bg-[#E2EAF0] h-28 sm:h-32 flex items-center justify-center relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#2B4353]">
                {isUrdu ? 'حکمت' : 'SAYING'}
              </span>
              <div className="w-14 h-18 sm:w-16 sm:h-20 border-2 border-[#2B4353]/20 arch-shape flex items-center justify-center bg-white/30">
                <span className="font-arabic text-xl font-bold text-[#2B4353]">علم</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#8E877D] tracking-wider block">
                  {isUrdu ? 'حکمت ۱۴۷' : 'SAYING 147'}
                </span>
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#18231C] group-hover:text-[#143E2E] transition-colors mt-1 leading-snug">
                  {isUrdu ? 'علم اور مال کا موازنہ' : 'The worth of knowledge'}
                </h3>
                <p className="text-xs text-[#58635B] mt-1.5 line-clamp-2 leading-relaxed">
                  {isUrdu
                    ? 'کمیل ابن زیاد کو علم کی لازوال برتری اور اہل علم کے بلند درجات کی تلقین۔'
                    : 'On the enduring value of knowledge over wealth, and the responsibility carried by those who possess it.'}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8E877D] pt-2 border-t border-[#ECE7DE]">
                <span className="px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#58635B] font-medium text-[10px]">
                  {isUrdu ? 'علم و بصیرت' : 'Knowledge'}
                </span>
                <span className="flex items-center gap-1 text-[#143E2E] font-semibold">
                  {isUrdu ? 'حکمت پڑھیں ←' : 'Read Saying →'}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
