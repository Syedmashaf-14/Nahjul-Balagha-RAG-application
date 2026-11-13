import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { quizGenerator } from '@/learning/quiz-generator';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    const userId = await getSessionUserId();
    const path = await learningRepository.getLearningPathById(id, userId);

    if (!path) return errorResponse('Learning path not found', 404);

    const lesson = path.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) return errorResponse('Lesson not found', 404);

    const questions = await quizGenerator.generateQuiz(
      path.topic,
      lesson.passageRefs.map((r) => ({ type: r.type, number: r.number }))
    );

    return successResponse({
      topic: path.topic,
      learningPathId: id,
      lessonId,
      questions,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
