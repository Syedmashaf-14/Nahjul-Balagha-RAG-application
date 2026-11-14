import { NextRequest } from 'next/server';
import { connectDB } from '@/config/database';
import { userRepository } from '@/db/repositories/user.repository';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return errorResponse('Email address is required', 400);
    }

    if (!password || typeof password !== 'string') {
      return errorResponse('Password is required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Look up user in MongoDB database
    const user = await userRepository.findByEmail(cleanEmail);
    if (!user) {
      return errorResponse('No account found with this email address. Please create an account first.', 401);
    }

    // 2. Strictly compare entered password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse('Incorrect password. Please verify your credentials and try again.', 401);
    }

    // 3. Update last login timestamp
    try {
      await userRepository.updateLastLogin(user._id.toString());
    } catch (e) {
      // Non-blocking log update
    }

    return successResponse({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Login API Error:', err);
    return errorResponse(err.message || 'Authentication error. Please check your database connection.', 500);
  }
}
