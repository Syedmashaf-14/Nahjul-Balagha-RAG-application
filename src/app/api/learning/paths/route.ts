import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { pathGenerator } from '@/learning/path-generator';
import { GenerateLearningPathSchema } from '@/types/learning.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const paths = await learningRepository.getLearningPaths(userId);
    return successResponse(paths);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = GenerateLearningPathSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid parameters', 400);
    }

    const { topic, difficulty, maxLessons } = validated.data;
    const path = await pathGenerator.generatePath(userId, topic, difficulty, maxLessons);

    return successResponse(path, 201);
  } catch (err: any) {
    console.error('Learning Path Generation Error:', err);
    return errorResponse(err.message || 'Failed to generate learning path', 500);
  }
}
