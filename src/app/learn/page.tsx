'use client';

import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  HelpCircle,
  Award,
  RefreshCw,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';
import { ILearningPath, ILesson, IQuizQuestion } from '@/types/learning.types';

export default function LearnPage() {
  const [paths, setPaths] = useState<ILearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<ILearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // New Course Creator State
  const [newTopic, setNewTopic] = useState('governance');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

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
          if (json.data.length > 0 && !selectedPath) {
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
          maxLessons: 5,
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
        // Refresh learning path progress
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <GraduationCap className="w-7 h-7 text-emerald-400" />
          Personalized Learning Hub
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Structured ethical learning journeys, topic lessons, and comprehension assessments.
        </p>
      </div>

      {/* Course Generator Card */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-slate-900/60">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Generate a Personalized Journey
        </h2>
        <p className="text-xs text-slate-300 mb-4 max-w-xl">
          The AI will analyze Nahj al-Balagha, select the most relevant sermons, letters, and sayings,
          and organize them into an actionable syllabus tailored to your level.
        </p>

        <form onSubmit={handleGeneratePath} className="flex flex-wrap items-center gap-3">
          <select
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="governance">Leadership & Governance (Letter 53)</option>
            <option value="justice">Justice & Equity</option>
            <option value="patience">Patience & Perseverance (Sabr)</option>
            <option value="knowledge">Knowledge & True Scholars</option>
            <option value="piety">Piety (Khutba al-Muttaqeen)</option>
            <option value="ethics_morality">Character & Self-Discipline</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500/60"
          >
            <option value="beginner">Beginner Level</option>
            <option value="intermediate">Intermediate Level</option>
            <option value="advanced">Advanced Scholar</option>
          </select>

          <button
            type="submit"
            disabled={generating}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Designing Syllabus...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create New Path</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Path Explorer */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
          <p className="text-xs">Loading learning journeys...</p>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-slate-800 p-8">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Learning Paths Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Use the generator above to create your first personalized study path on Justice, Leadership, or Patience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Path Selector List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Learning Paths ({paths.length})
            </h3>
            {paths.map((p) => (
              <div
                key={p._id}
                onClick={() => setSelectedPath(p)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPath?._id === p._id
                    ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'glass-panel border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    {p.difficulty}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {p.progressPercent}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{p.title}</h4>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                    style={{ width: `${p.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Active Path Lesson Timeline */}
          {selectedPath && (
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Current Syllabus
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedPath.completedLessons} of {selectedPath.totalLessons} lessons completed
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">{selectedPath.title}</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedPath.description}
                </p>
              </div>

              {/* Lesson Cards */}
              <div className="space-y-4">
                {selectedPath.lessons.map((lesson) => {
                  const isCompleted = lesson.status === 'completed';
                  const isLocked = lesson.status === 'locked';
                  return (
                    <div
                      key={lesson.lessonId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : isLocked
                          ? 'bg-slate-950/40 border-slate-850 opacity-60'
                          : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5 text-slate-500" />
                            ) : (
                              <PlayCircle className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Lesson {lesson.order} • {lesson.estimatedMinutes} mins
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {lesson.description}
                            </p>

                            {/* Passages Studied */}
                            {lesson.passageRefs.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {lesson.passageRefs.map((r, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-emerald-300 border border-slate-800 font-medium"
                                  >
                                    {r.type.toUpperCase()} #{r.number}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {!isLocked && (
                          <div className="flex flex-col sm:flex-row items-end gap-2 shrink-0">
                            <button
                              onClick={() => startQuiz(selectedPath._id, lesson.lessonId)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Take Quiz</span>
                            </button>
                            {!isCompleted && (
                              <button
                                onClick={() =>
                                  completeLessonDirectly(selectedPath._id, lesson.lessonId)
                                }
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full rounded-3xl border border-amber-500/30 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Comprehension Assessment
                </span>
                <h3 className="text-lg font-bold text-white">Lesson Quiz</h3>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.questionId} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <p className="text-sm font-bold text-slate-100">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.questionId] === optIdx;
                      const isCorrect = q.correctAnswer === optIdx;
                      const showResult = quizResult !== null;

                      let optClass = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';
                      if (isSelected) {
                        optClass = 'bg-amber-500/10 border-amber-500/40 text-amber-300';
                      }
                      if (showResult) {
                        if (isCorrect) {
                          optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                        } else if (isSelected && !isCorrect) {
                          optClass = 'bg-red-500/20 border-red-500 text-red-300';
                        }
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => !quizResult && handleSelectAnswer(q.questionId, optIdx)}
                          className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${optClass}`}
                        >
                          <span>{opt}</span>
                          {showResult && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                          {showResult && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400" />}
                        </div>
                      );
                    })}
                  </div>

                  {quizResult && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-amber-400 block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              {quizResult ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    Score: {quizResult.score}% ({quizResult.correctAnswers}/{quizResult.totalQuestions})
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      quizResult.passed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {quizResult.passed ? 'Passed & Lesson Unlocked!' : 'Review & Retry'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 transition-all ml-auto"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
