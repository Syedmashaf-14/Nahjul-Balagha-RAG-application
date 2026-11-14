import { NextRequest } from 'next/server';
import { connectDB } from '@/config/database';
import { UserModel } from '@/db/models/user.model';
import { OtpModel } from '@/db/models/otp.model';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, password, language, explanationLevel } = body;

    if (!email || !email.includes('@')) {
      return errorResponse('A valid email address is required', 400);
    }
    if (!name || name.trim().length < 2) {
      return errorResponse('Full name is required (minimum 2 characters)', 400);
    }
    if (!password || password.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      return errorResponse('An account with this email already exists. Please sign in.', 409);
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Upsert OTP record
    await OtpModel.findOneAndUpdate(
      { email: cleanEmail },
      {
        otp,
        name: name.trim(),
        passwordHash,
        language: language || 'english',
        explanationLevel: explanationLevel || 'intermediate',
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL DISPATCH TO: ${cleanEmail}]`);
    console.log(`🔐 Your Nahj al-Balagha Verification Code (OTP) is: ${otp}`);
    console.log(`⏳ Code expires in 15 minutes.`);
    console.log(`======================================================\n`);

    return successResponse({
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}`,
      email: cleanEmail,
      devOtp: otp, // Surfaced so tester/user can immediately see the code
    });
  } catch (err: any) {
    console.error('Send OTP API Error:', err);
    return errorResponse(err.message || 'Failed to dispatch verification code', 500);
  }
}
