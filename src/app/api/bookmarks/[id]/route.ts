import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { bookmarkRepository } from '@/db/repositories/bookmark.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const ok = await bookmarkRepository.delete(id, userId);
    return successResponse({ deleted: ok });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
