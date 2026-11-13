import { NextRequest } from 'next/server';
import { userRepository } from '@/db/repositories/user.repository';
import { userPreferencesRepository } from '@/db/repositories/user-preferences.repository';
import { RegisterUserSchema } from '@/types/user.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterUserSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid input data', 400);
    }

    const existingUser = await userRepository.findByEmail(validated.data.email);
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    const user = await userRepository.create(validated.data);

    // Initialize default preferences in MongoDB
    await userPreferencesRepository.getByUserId(user._id.toString());

    return successResponse(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch (err: any) {
    console.error('Registration API Error:', err);
    return errorResponse(err.message || 'Internal server error', 500);
  }
}
