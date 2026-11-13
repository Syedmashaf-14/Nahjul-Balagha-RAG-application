import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { bookmarkRepository } from '@/db/repositories/bookmark.repository';
import { CreateBookmarkSchema } from '@/types/api.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const passageType = searchParams.get('passageType') || undefined;
    const collectionId = searchParams.get('collectionId') || undefined;

    const result = await bookmarkRepository.listByUser(userId, {
      page,
      limit,
      passageType,
      collectionId,
    });

    return successResponse(result);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = CreateBookmarkSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid bookmark data', 400);
    }

    const bookmark = await bookmarkRepository.create(userId, validated.data);
    return successResponse(bookmark, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
