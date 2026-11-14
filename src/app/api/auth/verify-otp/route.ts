import { NextRequest } from 'next/server';
import { connectDB } from '@/config/database';
import { UserModel } from '@/db/models/user.model';
import { OtpModel } from '@/db/models/otp.model';
import { userPreferencesRepository } from '@/db/repositories/user-preferences.repository';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return errorResponse('Email and 6-digit OTP code are required', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Find pending OTP record
    const otpRecord = await OtpModel.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return errorResponse('No pending verification found or the code has expired. Please request a new code.', 404);
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpModel.deleteOne({ _id: otpRecord._id });
      return errorResponse('Verification code has expired. Please request a fresh code.', 410);
    }

    if (otpRecord.otp !== cleanOtp) {
      return errorResponse('Incorrect verification code. Please check your email and try again.', 400);
    }

    // OTP matches! Check if user already got created in parallel
    let user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      user = await UserModel.create({
        email: cleanEmail,
        name: otpRecord.name,
        passwordHash: otpRecord.passwordHash,
        emailVerified: new Date(),
        role: 'user',
        isActive: true,
      });
    }

    // Initialize User Preferences in MongoDB
    try {
      await userPreferencesRepository.updateByUserId(user._id.toString(), {
        language: (otpRecord.language as any) || 'english',
        explanationLevel: (otpRecord.explanationLevel as any) || 'intermediate',
      });
    } catch {
      await userPreferencesRepository.getByUserId(user._id.toString());
    }

    // Clean up used OTP
    await OtpModel.deleteOne({ _id: otpRecord._id });

    return successResponse({
      message: 'Account successfully verified and activated!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Verify OTP API Error:', err);
    return errorResponse(err.message || 'Failed to verify code', 500);
  }
}
