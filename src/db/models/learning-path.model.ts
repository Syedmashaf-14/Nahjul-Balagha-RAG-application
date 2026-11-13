import mongoose, { Schema, Document } from 'mongoose';
import { ILearningPath } from '../../types/learning.types';

export interface ILearningPathDocument extends Omit<ILearningPath, '_id'>, Document {}

const LessonPassageRefSchema = new Schema(
  {
    type: { type: String, required: true },
    number: { type: Number, required: true },
    relevance: { type: String, required: true },
  },
  { _id: false }
);

const LessonSchema = new Schema(
  {
    lessonId: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    passageRefs: { type: [LessonPassageRefSchema], default: [] },
    objectives: { type: [String], default: [] },
    estimatedMinutes: { type: Number, default: 15 },
    status: {
      type: String,
      enum: ['locked', 'available', 'in_progress', 'completed'],
      default: 'locked',
    },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const LearningPathSchema = new Schema<ILearningPathDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    lessons: {
      type: [LessonSchema],
      default: [],
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    isAIGenerated: {
      type: Boolean,
      default: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

LearningPathSchema.index({ userId: 1, topic: 1 });
LearningPathSchema.index({ userId: 1, updatedAt: -1 });

export const LearningPathModel =
  mongoose.models.LearningPath ||
  mongoose.model<ILearningPathDocument>('LearningPath', LearningPathSchema);
