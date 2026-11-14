import mongoose, { Schema, Document } from 'mongoose';
import { IDailyWisdom } from '../../types/api.types';

export interface IDailyWisdomDocument extends Omit<IDailyWisdom, '_id'>, Document {}

const DailyWisdomSchema = new Schema<IDailyWisdomDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    passageType: {
      type: String,
      enum: ['sermon', 'letter', 'saying'],
      required: true,
    },
    passageNumber: {
      type: Number,
      required: true,
    },
    arabicText: {
      type: String,
      default: null,
    },
    translationText: {
      type: String,
      required: true,
    },
    urduTranslation: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: 'english',
    },
    reflectionQuestion: {
      type: String,
      default: null,
    },
    topic: {
      type: String,
      required: true,
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
    interacted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

DailyWisdomSchema.index({ userId: 1, deliveredAt: -1 });

export const DailyWisdomModel =
  mongoose.models.DailyWisdom ||
  mongoose.model<IDailyWisdomDocument>('DailyWisdom', DailyWisdomSchema);
