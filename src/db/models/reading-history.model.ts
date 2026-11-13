import mongoose, { Schema, Document } from 'mongoose';
import { IReadingHistory } from '../../types/api.types';

export interface IReadingHistoryDocument extends Omit<IReadingHistory, '_id'>, Document {}

const ReadingHistorySchema = new Schema<IReadingHistoryDocument>(
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
    interactionType: {
      type: String,
      enum: ['viewed', 'explored', 'discussed', 'bookmarked'],
      default: 'viewed',
    },
    duration: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ReadingHistorySchema.index({ userId: 1, createdAt: -1 });
ReadingHistorySchema.index({ userId: 1, passageType: 1, passageNumber: 1 });

export const ReadingHistoryModel =
  mongoose.models.ReadingHistory ||
  mongoose.model<IReadingHistoryDocument>('ReadingHistory', ReadingHistorySchema);
