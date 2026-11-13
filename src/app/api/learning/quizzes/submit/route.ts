import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();

    const { learningPathId, lessonId, topic, questions, userAnswers } = body;

    let correctCount = 0;
    const gradedQuestions = questions.map((q: any) => {
      const userAnswer = userAnswers[q.questionId];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        userAnswer,
      };
    });

    const total = questions.length || 1;
    const score = Math.round((correctCount / total) * 100);

    const saved = await learningRepository.saveQuizResult({
      userId,
      learningPathId,
      lessonId,
      topic: topic || 'General Wisdom',
      questions: gradedQuestions,
      score,
      totalQuestions: total,
      correctAnswers: correctCount,
    });

    // If lessonId and learningPathId exist and score >= 60%, mark lesson complete
    if (learningPathId && lessonId && score >= 60) {
      await learningRepository.markLessonComplete(learningPathId, lessonId, userId);
    }

    return successResponse({
      quizResultId: saved._id.toString(),
      score,
      totalQuestions: total,
      correctAnswers: correctCount,
      passed: score >= 60,
      questions: gradedQuestions,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
