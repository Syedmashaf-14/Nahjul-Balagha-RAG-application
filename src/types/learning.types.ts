import { z } from 'zod';
import { PassageRefSchema, PassageTypeEnum } from './passage.types';

// ─── Learning Path ───────────────────────────────────────────────────────────

export const LessonStatusEnum = z.enum(['locked', 'available', 'in_progress', 'completed']);
export type LessonStatus = z.infer<typeof LessonStatusEnum>;

export const DifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export interface ILessonPassageRef {
  type: string;
  number: number;
  relevance: string;
}

export interface ILesson {
  lessonId: string;
  order: number;
  title: string;
  description: string;
  passageRefs: ILessonPassageRef[];
  objectives: string[];
  estimatedMinutes: number;
  status: LessonStatus;
  completedAt: Date | null;
}

export interface ILearningPath {
  _id: string;
  userId: string;
  title: string;
  description: string;
  topic: string;
  difficulty: Difficulty;
  lessons: ILesson[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

export interface IQuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number | null;
  explanation: string;
  passageRef: { type: string; number: number };
}

export interface IQuizResult {
  _id: string;
  userId: string;
  learningPathId: string | null;
  lessonId: string | null;
  topic: string;
  questions: IQuizQuestion[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
  createdAt: Date;
}

// ─── API Schemas ─────────────────────────────────────────────────────────────

export const GenerateLearningPathSchema = z.object({
  topic: z.string().min(1).max(100),
  difficulty: DifficultyEnum.default('beginner'),
  maxLessons: z.number().int().min(3).max(20).default(8),
});
export type GenerateLearningPathInput = z.infer<typeof GenerateLearningPathSchema>;

export const SubmitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.number().int().min(0).max(3),
  })),
});
export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>;

export const GenerateQuizSchema = z.object({
  numQuestions: z.number().int().min(3).max(15).default(5),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizSchema>;
