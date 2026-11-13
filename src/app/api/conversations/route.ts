import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { conversationRepository } from '@/db/repositories/conversation.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const type = searchParams.get('type') || undefined;

    const result = await conversationRepository.listByUser(userId, { page, limit, type });
    return successResponse(result);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
