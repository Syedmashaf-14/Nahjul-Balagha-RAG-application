import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { noteRepository } from '@/db/repositories/note.repository';
import { CreateNoteSchema } from '@/types/api.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const collectionId = searchParams.get('collectionId') || undefined;
    const q = searchParams.get('q');

    if (q) {
      const searchResults = await noteRepository.search(userId, q);
      return successResponse({ notes: searchResults, total: searchResults.length });
    }

    const result = await noteRepository.listByUser(userId, { page, limit, collectionId });
    return successResponse(result);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = CreateNoteSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid note data', 400);
    }

    const note = await noteRepository.create(userId, validated.data);
    return successResponse(note, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
