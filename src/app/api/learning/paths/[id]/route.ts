import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const path = await learningRepository.getLearningPathById(id, userId);

    if (!path) return errorResponse('Learning path not found', 404);
    return successResponse(path);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
