import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { userRepository } from '@/db/repositories/user.repository';
import { UpdateProfileSchema } from '@/types/user.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const user = await userRepository.findById(userId);
    if (!user) {
      return successResponse({
        id: userId,
        name: 'Guest Seeker',
        email: 'guest@nahj-al-balagha.org',
        role: 'user',
        image: null,
      });
    }

    return successResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = UpdateProfileSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid profile data', 400);
    }

    const updated = await userRepository.updateProfile(userId, validated.data);
    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
