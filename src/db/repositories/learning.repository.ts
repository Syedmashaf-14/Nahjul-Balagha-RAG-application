import { connectDB } from '../../config/database';
import { LearningPathModel, ILearningPathDocument } from '../models/learning-path.model';
import { QuizResultModel, IQuizResultDocument } from '../models/quiz-result.model';
import { Difficulty, ILesson } from '../../types/learning.types';

export class LearningRepository {
  async createLearningPath(data: {
    userId: string;
    title: string;
    description: string;
    topic: string;
    difficulty: Difficulty;
    lessons: ILesson[];
  }): Promise<ILearningPathDocument> {
    await connectDB();
    return LearningPathModel.create({
      ...data,
      totalLessons: data.lessons.length,
      completedLessons: 0,
      progressPercent: 0,
    });
  }

  async getLearningPaths(userId: string): Promise<ILearningPathDocument[]> {
    await connectDB();
    return LearningPathModel.find({ userId }).sort({ updatedAt: -1 }).exec();
  }

  async getLearningPathById(id: string, userId: string): Promise<ILearningPathDocument | null> {
    await connectDB();
    return LearningPathModel.findOne({ _id: id, userId }).exec();
  }

  async markLessonComplete(
    pathId: string,
    lessonId: string,
    userId: string
  ): Promise<ILearningPathDocument | null> {
    await connectDB();
    const path = await LearningPathModel.findOne({ _id: pathId, userId }).exec();
    if (!path) return null;

    let lessonFound = false;
    let completedCount = 0;

    for (let i = 0; i < path.lessons.length; i++) {
      if (path.lessons[i].lessonId === lessonId) {
        path.lessons[i].status = 'completed';
        path.lessons[i].completedAt = new Date();
        lessonFound = true;
        // Unlock next lesson if locked
        if (i + 1 < path.lessons.length && path.lessons[i + 1].status === 'locked') {
          path.lessons[i + 1].status = 'available';
        }
      }
      if (path.lessons[i].status === 'completed') {
        completedCount++;
      }
    }

    if (!lessonFound) return null;

    path.completedLessons = completedCount;
    path.progressPercent = Math.round((completedCount / path.totalLessons) * 100);
    path.lastAccessedAt = new Date();

    return path.save();
  }

  async saveQuizResult(data: {
    userId: string;
    learningPathId?: string | null;
    lessonId?: string | null;
    topic: string;
    questions: any[];
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  }): Promise<IQuizResultDocument> {
    await connectDB();
    return QuizResultModel.create(data);
  }

  async getQuizResults(userId: string, limit: number = 20): Promise<IQuizResultDocument[]> {
    await connectDB();
    return QuizResultModel.find({ userId }).sort({ completedAt: -1 }).limit(limit).exec();
  }

  async getOverallProgress(userId: string): Promise<{
    totalPaths: number;
    completedPaths: number;
    totalLessonsCompleted: number;
    averageQuizScore: number;
  }> {
    await connectDB();
    const [paths, quizzes] = await Promise.all([
      LearningPathModel.find({ userId }).exec(),
      QuizResultModel.find({ userId }).exec(),
    ]);

    const totalPaths = paths.length;
    const completedPaths = paths.filter((p) => p.progressPercent === 100).length;
    const totalLessonsCompleted = paths.reduce((acc, p) => acc + p.completedLessons, 0);

    const averageQuizScore =
      quizzes.length > 0
        ? Math.round(quizzes.reduce((acc, q) => acc + q.score, 0) / quizzes.length)
        : 0;

    return {
      totalPaths,
      completedPaths,
      totalLessonsCompleted,
      averageQuizScore,
    };
  }
}

export const learningRepository = new LearningRepository();
