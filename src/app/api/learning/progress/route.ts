import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const progress = await learningRepository.getOverallProgress(userId);
    return successResponse(progress);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
