import { getSessionUserId } from '@/config/auth';
import { dailyWisdomService } from '@/recommendations/daily-wisdom';
import { ensureKnowledgeBaseSeeded } from '@/ingestion/seed-runner';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET() {
  try {
    await ensureKnowledgeBaseSeeded();
    const userId = await getSessionUserId();
    const wisdom = await dailyWisdomService.getDailyWisdom(userId);
    return successResponse(wisdom);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
