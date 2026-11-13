import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { noteRepository } from '@/db/repositories/note.repository';
import { UpdateNoteSchema } from '@/types/api.types';
import { successResponse, errorResponse , formatZodError } from '@/lib/response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const note = await noteRepository.findById(id, userId);
    if (!note) return errorResponse('Note not found', 404);
    return successResponse(note);
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
    const validated = UpdateNoteSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid note update', 400);
    }

    const updated = await noteRepository.update(id, userId, validated.data);
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
    const ok = await noteRepository.delete(id, userId);
    return successResponse({ deleted: ok });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
