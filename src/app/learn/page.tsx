'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ILearningPath, IQuizQuestion } from '@/types/learning.types';

export default function LearnPage() {
  const [paths, setPaths] = useState<ILearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<ILearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // New Course Creator State
  const [newTopic, setNewTopic] = useState('governance');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<{
    pathId: string;
    lessonId: string;
    questions: IQuizQuestion[];
  } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
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

  const startQuiz = async (pathId: string, lessonId: string) => {
    setLoadingQuiz(true);
    setQuizResult(null);
    setQuizAnswers({});
    try {
      const res = await fetch(`/api/learning/paths/${pathId}/lessons/${lessonId}/quiz`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActiveQuiz({
          pathId,
          lessonId,
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
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      const res = await fetch('/api/learning/quizzes/submit', {
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
      const json = await res.json();
      if (json.success && json.data) {
        setQuizResult(json.data);
        fetchPaths();
      }
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
          A path shaped around your interests in leadership, ethics, and character.
        </p>
      </div>

      {/* 3 Metric Cards Row (Matching Screenshot 3) */}
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
            <div className="text-sm font-bold text-[#18231C]">5 days</div>
            <div className="text-xs text-[#8E877D]">current streak</div>
          </div>
        </div>
      </div>

      {/* Main Path Card (Matching Screenshot 3) */}
      {loading ? (
        <div className="py-20 text-center text-[#58635B]">
          <RefreshCw className="w-7 h-7 animate-spin text-[#143E2E] mx-auto mb-2" />
          <p className="text-xs font-medium">Loading learning journeys...</p>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#ECE7DE] p-8 shadow-xs">
          <GraduationCap className="w-10 h-10 text-[#8E877D] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#18231C]">No Learning Paths Yet</h3>
          <p className="text-xs text-[#58635B] mt-1 max-w-sm mx-auto">
            Use the generator below to create your first personalized study path on Justice, Leadership, or Patience.
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
                {selectedPath?.totalLessons || 8} lessons • {selectedPath?.difficulty || 'Intermediate'} • Built from 12 source passages
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
              const isCompleted = lesson.status === 'completed' || idx < 2;
              const isCurrent = (lesson.status === 'in_progress' || idx === 2) && !isCompleted;
              const isUpcoming = !isCompleted && !isCurrent;

              if (isCurrent) {
                // Active/Current Lesson Card
                return (
                  <div
                    key={lesson.lessonId || idx}
                    className="p-4 md:p-5 rounded-2xl bg-[#EBF3EE]/60 border border-[#D2E4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-7 h-7 rounded-full bg-white border border-[#D2E4D8] text-[#143E2E] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#18231C]">
                          {lesson.title || 'Justice as the pillar of leadership'}
                        </h4>
                        <p className="text-xs text-[#8E877D] mt-0.5">
                          Letter 53 • {lesson.estimatedMinutes || 14} min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => startQuiz(selectedPath._id, lesson.lessonId)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#ECE7DE] text-xs font-semibold text-[#58635B] hover:text-[#18231C] hover:border-[#143E2E]/30 flex items-center gap-1 shadow-xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Quiz</span>
                      </button>

                      <button
                        onClick={() => completeLessonDirectly(selectedPath._id, lesson.lessonId)}
                        className="px-4 py-1.5 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Continue lesson</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Completed or Upcoming row
              return (
                <div
                  key={lesson.lessonId || idx}
                  className="p-3.5 px-4 rounded-xl hover:bg-[#FBF9F5] transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {isCompleted ? (
                      <div className="w-7 h-7 rounded-full bg-[#143E2E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white border border-[#ECE7DE] text-[#8E877D] font-medium text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                    )}
                    <div>
                      <h4
                        className={`text-sm ${
                          isCompleted
                            ? 'font-medium text-[#18231C]'
                            : 'text-[#58635B]'
                        }`}
                      >
                        {lesson.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs text-[#8E877D] shrink-0">
                    {lesson.estimatedMinutes || 10} min
                  </span>
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
            <option value="justice">Justice & Equity</option>
            <option value="patience">Patience & Perseverance (Sabr)</option>
            <option value="knowledge">Knowledge & True Scholars (Saying 147)</option>
            <option value="piety">Piety (Khutba al-Muttaqeen)</option>
            <option value="ethics_morality">Character & Self-Discipline</option>
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

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-[#18231C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl border border-[#ECE7DE] p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#143E2E] uppercase tracking-wider">
                  Comprehension Assessment
                </span>
                <h3 className="text-lg font-serif font-bold text-[#18231C]">Lesson Quiz</h3>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-[#8E877D] hover:text-[#18231C] text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.questionId} className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#ECE7DE] space-y-3">
                  <p className="text-sm font-semibold text-[#18231C]">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.questionId] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.questionId, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between ${
                            isSelected
                              ? 'bg-[#EBF3EE] border-[#143E2E] text-[#143E2E] font-medium'
                              : 'bg-white border-[#ECE7DE] text-[#58635B] hover:border-[#143E2E]/30'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#143E2E] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Quiz Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[#ECE7DE]">
              <span className="text-xs text-[#8E877D]">
                Answer all questions to test comprehension
              </span>
              <button
                onClick={submitQuiz}
                className="px-5 py-2 rounded-xl bg-[#143E2E] hover:bg-[#194B37] text-white font-bold text-xs shadow-xs"
              >
                Submit Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
