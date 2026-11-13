import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { collectionRepository } from '@/db/repositories/collection.repository';
import { CreateCollectionSchema } from '@/types/api.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const collections = await collectionRepository.listByUser(userId);
    return successResponse(collections);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = CreateCollectionSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid collection data', 400);
    }

    const col = await collectionRepository.create(userId, validated.data);
    return successResponse(col, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
