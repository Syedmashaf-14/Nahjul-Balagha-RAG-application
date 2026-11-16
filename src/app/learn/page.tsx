'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Check,
  RefreshCw,
  HelpCircle,
  X,
  Play,
  BookOpen,
  ArrowRight,
  Eye,
  Languages,
} from 'lucide-react';
import { ILearningPath, ILesson, IQuizQuestion } from '@/types/learning.types';
import { SEED_PASSAGES } from '@/ingestion/seed-data';
import { getActiveStreak, recordDailyStudyActivity } from '@/lib/streak';

export default function LearnPage() {
  const [paths, setPaths] = useState<ILearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<ILearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [streakCount, setStreakCount] = useState(1);

  useEffect(() => {
    recordDailyStudyActivity();
    const info = getActiveStreak();
    setStreakCount(info.count);
  }, []);

  // Lesson Reading Modal State
  const [activeLesson, setActiveLesson] = useState<{
    lesson: ILesson;
    passageData: any;
  } | null>(null);
  const [lessonLanguage, setLessonLanguage] = useState<'dual' | 'english' | 'urdu' | 'arabic'>('dual');

  // New Course Creator State
  const [newTopic, setNewTopic] = useState('governance');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<{
    pathId: string;
    lessonId: string;
    lessonTitle: string;
    questions: IQuizQuestion[];
  } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const fetchPaths = () => {
    setLoading(true);
    fetch('/api/learning/paths')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPaths(json.data);
          if (json.data.length > 0) {
            setSelectedPath(json.data[0]);
          }
        }
      })
      .catch((err) => console.error('Fetch paths error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const openLesson = (lesson: ILesson) => {
    const primaryRef = lesson.passageRefs?.[0] || { type: 'letter', number: 53 };
    const matched = SEED_PASSAGES.find(
      (p) =>
        p.chapter?.toLowerCase() === primaryRef.type.toLowerCase() &&
        p.number === primaryRef.number
    ) || SEED_PASSAGES.find((p) => p.number === primaryRef.number) || SEED_PASSAGES[0];

    setActiveLesson({
      lesson,
      passageData: matched,
    });
  };

  const handleGeneratePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/learning/paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic,
          difficulty,
          maxLessons: 6,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPaths((prev) => [json.data, ...prev]);
        setSelectedPath(json.data);
      }
    } catch (err) {
      console.error('Failed to generate course:', err);
    } finally {
      setGenerating(false);
    }
  };

  const startQuiz = async (pathId: string, lesson: ILesson) => {
    setLoadingQuiz(true);
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizAnswers({});
    try {
      const res = await fetch(`/api/learning/paths/${pathId}/lessons/${lesson.lessonId}/quiz`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveQuiz({
          pathId,
          lessonId: lesson.lessonId,
          lessonTitle: lesson.title,
          questions: json.data.questions,
        });
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      if (quizAnswers[q.questionId] === q.correctAnswer) {
        correctCount++;
      }
    });

    setQuizScore({
      correct: correctCount,
      total: activeQuiz.questions.length,
    });
    setQuizSubmitted(true);

    try {
      await fetch('/api/learning/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningPathId: activeQuiz.pathId,
          lessonId: activeQuiz.lessonId,
          topic: selectedPath?.topic || 'General',
          questions: activeQuiz.questions,
          userAnswers: quizAnswers,
        }),
      });
      fetchPaths();
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const completeLessonDirectly = async (pathId: string, lessonId: string) => {
    try {
      await fetch(`/api/learning/paths/${pathId}/lessons/${lessonId}/complete`, {
        method: 'POST',
      });
      fetchPaths();
      if (activeLesson) {
        setActiveLesson(null);
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  };

  // Stats calculation
  const totalCompleted = selectedPath?.completedLessons || 3;
  const totalLessons = selectedPath?.totalLessons || 8;
  const progressPercent = selectedPath
    ? Math.round((selectedPath.completedLessons / (selectedPath.totalLessons || 1)) * 100)
    : 38;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-widest text-[#8E877D] uppercase">
          PERSONALIZED CURRICULUM
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#18231C] tracking-tight">
          My learning journey
        </h1>
        <p className="text-xs md:text-sm text-[#58635B]">
          A structured path shaped around authentic teachings on leadership, justice, and character in Nahj al-Balagha.
        </p>
      </div>

      {/* 3 Metric Cards Row (Matching Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-[#ECE7DE] p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#EBF3EE] text-[#143E2E] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#18231C]">
              {totalCompleted} of {totalLessons}
            </div>
            <div className="text-xs text-[#8E877D]">lessons completed</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ECE7DE] p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#EBF3EE] text-[#143E2E] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#18231C]">2h 40m</div>
            <div className="text-xs text-[#8E877D]">time learned</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#ECE7DE] p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#EBF3EE] text-[#143E2E] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#18231C]">
              {streakCount} {streakCount === 1 ? 'day' : 'days'}
            </div>
            <div className="text-xs text-[#8E877D]">current streak</div>
          </div>
        </div>
      </div>

      {/* Main Path Card (Matching Image 3) */}
      {loading ? (
        <div className="py-20 text-center text-[#58635B]">
          <RefreshCw className="w-7 h-7 animate-spin text-[#143E2E] mx-auto mb-2" />
          <p className="text-xs font-medium">Loading learning journey...</p>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-xs">
          <GraduationCap className="w-10 h-10 text-[#8E877D] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#18231C]">No Learning Paths Yet</h3>
          <p className="text-xs text-[#58635B] mt-1 max-w-sm mx-auto">
            Use the curriculum generator below to create your personalized study path.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#ECE7DE] p-6 md:p-8 shadow-xs space-y-6">
          {/* Card Header with Circular Progress Gauge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECE7DE]">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#143E2E] uppercase px-2.5 py-0.5 rounded-full bg-[#DDECE3]">
                CURRENT PATH
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#18231C] mt-2">
                {selectedPath?.title || 'Leadership with integrity'}
              </h2>
              <p className="text-xs text-[#8E877D] mt-0.5">
                {selectedPath?.totalLessons || 8} lessons • {selectedPath?.difficulty || 'Intermediate'} • Built from authentic Nahj al-Balagha passages
              </p>
            </div>

            {/* Circular Progress Gauge */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#ECE7DE]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#143E2E]"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-[#18231C]">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Lesson Timeline List */}
          <div className="space-y-3">
            {selectedPath?.lessons.map((lesson, idx) => {
              const isCompleted = lesson.status === 'completed';
              const isCurrent = lesson.status === 'in_progress' || (idx === 2 && !isCompleted);
              const refItem = lesson.passageRefs?.[0];
              const refLabel = refItem
                ? `${refItem.type.toUpperCase()} ${refItem.number}`
                : 'LETTER 53';

              if (isCurrent) {
                // Active/Current Lesson Card
                return (
                  <div
                    key={lesson.lessonId || idx}
                    className="p-4 md:p-5 rounded-2xl bg-[#EBF3EE]/70 border border-[#D2E4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs cursor-pointer hover:bg-[#EBF3EE]"
                    onClick={() => openLesson(lesson)}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1">
                      <div className="w-7 h-7 rounded-full bg-white border border-[#D2E4D8] text-[#143E2E] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#18231C]">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-[#58635B] line-clamp-1">
                          {lesson.description}
                        </p>
                        <p className="text-[11px] text-[#8E877D]">
                          {refLabel} • {lesson.estimatedMinutes || 14} min • Click to read passage
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 self-end sm:self-center shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => startQuiz(selectedPath._id, lesson)}
                        disabled={loadingQuiz}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:text-[#18231C] hover:border-[#143E2E]/30 flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#143E2E]" />
                        <span>Quiz</span>
                      </button>

                      <button
                        onClick={() => openLesson(lesson)}
                        className="px-4 py-1.5 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Read Lesson</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Completed or Upcoming row
              return (
                <div
                  key={lesson.lessonId || idx}
                  onClick={() => openLesson(lesson)}
                  className="p-3.5 px-4 rounded-xl hover:bg-[#FBF9F5] border border-transparent hover:border-[#ECE7DE] transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    {isCompleted ? (
                      <div className="w-7 h-7 rounded-full bg-[#143E2E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white border border-[#ECE7DE] text-[#8E877D] font-medium text-xs flex items-center justify-center shrink-0 group-hover:border-[#143E2E]/40 group-hover:text-[#143E2E]">
                        {idx + 1}
                      </div>
                    )}
                    <div>
                      <h4
                        className={`text-sm ${
                          isCompleted
                            ? 'font-medium text-[#18231C]'
                            : 'text-[#58635B] group-hover:text-[#18231C]'
                        }`}
                      >
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-[#8E877D]">
                        {refLabel} • {lesson.estimatedMinutes || 10} min
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => startQuiz(selectedPath._id, lesson)}
                      className="px-2.5 py-1 rounded-lg border border-[#ECE7DE] text-[11px] font-medium text-[#58635B] hover:text-[#143E2E] hover:border-[#143E2E]/30 bg-white"
                    >
                      Quiz
                    </button>
                    <button
                      onClick={() => openLesson(lesson)}
                      className="p-1 rounded-lg text-[#8E877D] hover:text-[#143E2E]"
                      title="Read lesson passage"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curriculum Customizer / Path Generator (Clean White Panel) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ECE7DE] shadow-xs">
        <div className="max-w-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877D]">
            CURRICULUM ENGINE
          </span>
          <h3 className="text-lg font-serif font-bold text-[#18231C]">
            Design a new study path
          </h3>
          <p className="text-xs text-[#58635B]">
            Generate an AI-curated sequence based on sermons, letters, and maxims matching your study interest.
          </p>
        </div>

        <form onSubmit={handleGeneratePath} className="mt-5 flex flex-wrap items-center gap-3">
          <select
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="px-3.5 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs font-semibold text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
          >
            <option value="governance">Leadership & Governance (Letter 53)</option>
            <option value="justice">Justice & Equity (Sermon 216, Sermon 224)</option>
            <option value="patience">Patience & Perseverance (Sabr)</option>
            <option value="knowledge">Knowledge & True Scholars (Saying 147)</option>
            <option value="piety">Piety (Khutba al-Muttaqeen, Sermon 193)</option>
            <option value="ethics_morality">Character & Self-Discipline (Letter 31)</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#FBF9F5] border border-[#ECE7DE] rounded-xl text-xs font-semibold text-[#18231C] focus:outline-none focus:border-[#143E2E]/40"
          >
            <option value="beginner">Beginner Level</option>
            <option value="intermediate">Intermediate Level</option>
            <option value="advanced">Advanced Scholar</option>
          </select>

          <button
            type="submit"
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Designing Syllabus...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Path</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 1. LESSON READING MODAL — Shows Actual Passage Text & Hadith */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#ECE7DE] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DDECE3]">
                  LESSON STUDY • {activeLesson.lesson.passageRefs?.[0]?.type?.toUpperCase()} #{activeLesson.lesson.passageRefs?.[0]?.number}
                </span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-[#18231C] mt-1">
                  {activeLesson.lesson.title}
                </h3>
                <p className="text-xs text-[#58635B]">
                  {activeLesson.lesson.description}
                </p>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="p-1 rounded-lg text-[#8E877D] hover:text-[#18231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher for Lesson */}
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-2xl border border-[#ECE7DE]">
              <span className="text-xs font-semibold text-[#58635B] flex items-center gap-1.5 pl-2">
                <Languages className="w-3.5 h-3.5 text-[#143E2E]" />
                <span>Language View:</span>
              </span>
              <div className="flex items-center gap-1 text-xs">
                {(['dual', 'english', 'urdu', 'arabic'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLessonLanguage(lang)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all ${
                      lessonLanguage === lang
                        ? 'bg-[#143E2E] text-white shadow-xs'
                        : 'text-[#58635B] hover:text-[#18231C]'
                    }`}
                  >
                    {lang === 'dual' ? 'Side-by-Side' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Passage Content Section */}
            <div className="space-y-4">
              {/* Arabic Text */}
              {(lessonLanguage === 'arabic' || lessonLanguage === 'dual') && (
                <div className="p-5 rounded-2xl bg-[#F7F5EE] border border-[#ECE7DE]">
                  <span className="text-[10px] font-bold text-[#7A5835] uppercase tracking-wider block mb-2">
                    النص العربي الأصيل (Canonical Arabic Text)
                  </span>
                  <p className="font-arabic text-lg md:text-xl text-[#143E2E] text-right leading-loose">
                    {activeLesson.passageData.arabicText}
                  </p>
                </div>
              )}

              {/* English Translation */}
              {(lessonLanguage === 'english' || lessonLanguage === 'dual') && (
                <div className="p-5 rounded-2xl bg-white border border-[#ECE7DE] space-y-2">
                  <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider block">
                    English Translation & Commentary (Syed Ali Reza)
                  </span>
                  <p className="text-xs md:text-sm text-[#18231C] leading-relaxed italic">
                    &ldquo;{activeLesson.passageData.translationText}&rdquo;
                  </p>
                </div>
              )}

              {/* Urdu Translation */}
              {(lessonLanguage === 'urdu' || lessonLanguage === 'dual') && activeLesson.passageData.urduTranslation && (
                <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-2">
                  <span className="text-[10px] font-bold text-[#244866] uppercase tracking-wider block text-right">
                    اردو ترجمہ و تشریح (علامہ مفتی جعفر حسین / علامہ ذیشان حیدر جوادی)
                  </span>
                  <p className="text-xs md:text-sm text-[#18231C] text-right leading-loose font-serif">
                    {activeLesson.passageData.urduTranslation}
                  </p>
                </div>
              )}
            </div>

            {/* Objectives & Key Takeaways */}
            <div className="p-4 rounded-2xl bg-[#EBF3EE]/60 border border-[#D2E4D8] space-y-2">
              <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider block">
                Lesson Learning Objectives
              </span>
              <ul className="space-y-1.5 text-xs text-[#18231C]">
                {(activeLesson.lesson.objectives || ['Reflect on the ethical principles of this passage']).map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#143E2E] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECE7DE]">
              <Link
                href={`/chat?q=${encodeURIComponent(
                  `Explain ${activeLesson.lesson.passageRefs?.[0]?.type || 'passage'} #${
                    activeLesson.lesson.passageRefs?.[0]?.number || 53
                  } in Nahj al-Balagha and its application to: ${activeLesson.lesson.title}`
                )}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#143E2E] hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reflect with Nahj AI</span>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const l = activeLesson.lesson;
                    setActiveLesson(null);
                    if (selectedPath) startQuiz(selectedPath._id, l);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#143E2E] text-[#143E2E] text-xs font-bold hover:bg-[#EBF3EE] transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Take Lesson Quiz</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedPath) {
                      completeLessonDirectly(selectedPath._id, activeLesson.lesson.lessonId);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark as Completed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUIZ MODAL — Interactive Multiple Choice Assessment */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider">
                  Comprehension Assessment • {activeQuiz.lessonTitle}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#18231C]">
                  Knowledge & Wisdom Quiz
                </h3>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-[#8E877D] hover:text-[#18231C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner if Submitted */}
            {quizSubmitted && quizScore && (
              <div
                className={`p-4 rounded-2xl border text-center space-y-1 ${
                  quizScore.correct >= quizScore.total / 2
                    ? 'bg-[#EBF3EE] border-[#143E2E] text-[#143E2E]'
                    : 'bg-[#FDF2F2] border-[#E05252] text-[#9B1C1C]'
                }`}
              >
                <div className="text-lg font-serif font-bold">
                  Score: {quizScore.correct} of {quizScore.total} Correct (
                  {Math.round((quizScore.correct / quizScore.total) * 100)}%)
                </div>
                <p className="text-xs">
                  {quizScore.correct >= quizScore.total / 2
                    ? 'MashaAllah! Excellent comprehension of Imam Ali’s profound wisdom.'
                    : 'Review the explanations below to deepen your understanding.'}
                </p>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => {
                const selectedOpt = quizAnswers[q.questionId];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div
                    key={q.questionId}
                    className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-3"
                  >
                    <p className="text-sm font-semibold text-[#18231C]">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        let optionStyle = 'bg-white border-[#ECE7DE] text-[#58635B] hover:border-[#143E2E]/30';

                        if (quizSubmitted) {
                          if (optIdx === q.correctAnswer) {
                            optionStyle = 'bg-[#EBF3EE] border-[#143E2E] text-[#143E2E] font-bold';
                          } else if (isSelected && optIdx !== q.correctAnswer) {
                            optionStyle = 'bg-[#FDF2F2] border-[#E05252] text-[#9B1C1C] line-through';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-[#EBF3EE] border-[#143E2E] text-[#143E2E] font-medium';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(q.questionId, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#143E2E] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submission */}
                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-white border border-[#ECE7DE] text-xs text-[#58635B] space-y-1">
                        <span className="font-bold text-[#143E2E] block">Explanation & Source:</span>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Quiz Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[#ECE7DE]">
              <span className="text-xs text-[#8E877D]">
                {quizSubmitted
                  ? 'Lesson completed and progress saved!'
                  : 'Select your answers to test your understanding'}
              </span>

              {quizSubmitted ? (
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs"
                >
                  Done
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs"
                >
                  Submit Answers
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
