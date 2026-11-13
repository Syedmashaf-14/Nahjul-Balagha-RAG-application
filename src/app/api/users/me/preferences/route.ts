import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { userPreferencesRepository } from '@/db/repositories/user-preferences.repository';
import { UpdatePreferencesSchema } from '@/types/user.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const prefs = await userPreferencesRepository.getByUserId(userId);
    return successResponse(prefs);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = UpdatePreferencesSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid preferences', 400);
    }

    const updated = await userPreferencesRepository.updateByUserId(userId, validated.data);
    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE() {
  try {
    const userId = await getSessionUserId();
    const reset = await userPreferencesRepository.resetToDefaults(userId);
    return successResponse(reset);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
