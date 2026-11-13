import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { collectionRepository } from '@/db/repositories/collection.repository';
import { bookmarkRepository } from '@/db/repositories/bookmark.repository';
import { noteRepository } from '@/db/repositories/note.repository';
import { UpdateCollectionSchema } from '@/types/api.types';
import { successResponse, errorResponse , formatZodError } from '@/lib/response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const collection = await collectionRepository.findById(id, userId);
    if (!collection) return errorResponse('Collection not found', 404);

    const [bookmarks, notes] = await Promise.all([
      bookmarkRepository.listByUser(userId, { collectionId: id, limit: 50 }),
      noteRepository.listByUser(userId, { collectionId: id, limit: 50 }),
    ]);

    return successResponse({
      collection,
      bookmarks: bookmarks.bookmarks,
      notes: notes.notes,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = UpdateCollectionSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid collection update', 400);
    }

    const updated = await collectionRepository.update(id, userId, validated.data);
    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const ok = await collectionRepository.delete(id, userId);
    return successResponse({ deleted: ok });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
