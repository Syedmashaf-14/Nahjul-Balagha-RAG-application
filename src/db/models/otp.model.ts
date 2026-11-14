import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpDocument extends Document {
  email: string;
  otp: string;
  name: string;
  passwordHash: string;
  language: string;
  explanationLevel: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'english',
    },
    explanationLevel: {
      type: String,
      default: 'intermediate',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '15m' }, // Auto delete after 15 minutes
    },
  },
  {
    timestamps: true,
  }
);

export const OtpModel =
  mongoose.models.OtpVerification ||
  mongoose.model<IOtpDocument>('OtpVerification', OtpSchema);
