import { NextRequest } from 'next/server';
import { connectDB } from '@/config/database';
import { UserModel } from '@/db/models/user.model';
import { OtpModel } from '@/db/models/otp.model';
import { emailService } from '@/services/email.service';
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

    // Upsert OTP record in MongoDB
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

    // Send the verification code via Gmail SMTP + Nodemailer
    try {
      await emailService.sendOtpEmail({
        to: cleanEmail,
        name: name.trim(),
        otp,
      });
    } catch (emailErr: any) {
      console.error('Failed sending email via Nodemailer:', emailErr.message);
      // Even if Gmail SMTP fails due to credentials or rate limits, don't crash registration;
      // return a clear message so the user knows what to do.
      return errorResponse(
        `Unable to send OTP via Gmail SMTP: ${emailErr.message}. Please ensure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env.local.`,
        500
      );
    }

    console.log(`✅ Verification OTP generated and dispatched for ${cleanEmail}`);

    return successResponse({
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error('Send OTP API Error:', err);
    return errorResponse(err.message || 'Failed to dispatch verification code', 500);
  }
}
