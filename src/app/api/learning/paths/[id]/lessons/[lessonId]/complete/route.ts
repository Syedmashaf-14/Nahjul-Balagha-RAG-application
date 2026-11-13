import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    const userId = await getSessionUserId();
    const updated = await learningRepository.markLessonComplete(id, lessonId, userId);

    if (!updated) return errorResponse('Lesson or path not found', 404);
    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
