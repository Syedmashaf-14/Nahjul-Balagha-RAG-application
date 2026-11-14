import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { dailyWisdomService } from '@/recommendations/daily-wisdom';
import { ensureKnowledgeBaseSeeded } from '@/ingestion/seed-runner';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await ensureKnowledgeBaseSeeded();
    const searchParams = req.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';
    const userId = await getSessionUserId();
    const wisdom = await dailyWisdomService.getDailyWisdom(userId, forceRefresh);
    const islamicDate = dailyWisdomService.getIslamicDate();
    
    return successResponse({
      ...wisdom,
      islamicDate: islamicDate.islamicDateStr,
      islamicMonth: islamicDate.islamicMonth,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
