import mongoose, { Schema, Document } from 'mongoose';
import { IQuizResult } from '../../types/learning.types';

export interface IQuizResultDocument extends Omit<IQuizResult, '_id'>, Document {}

const QuizQuestionSchema = new Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    userAnswer: { type: Number, default: null },
    explanation: { type: String, required: true },
    passageRef: {
      type: { type: String, required: true },
      number: { type: Number, required: true },
    },
  },
  { _id: false }
);

const QuizResultSchema = new Schema<IQuizResultDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    learningPathId: {
      type: Schema.Types.ObjectId as any,
      ref: 'LearningPath',
      default: null,
    },
    lessonId: {
      type: String,
      default: null,
    },
    topic: {
      type: String,
      required: true,
    },
    questions: {
      type: [QuizQuestionSchema],
      default: [],
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

QuizResultSchema.index({ userId: 1, completedAt: -1 });

export const QuizResultModel =
  mongoose.models.QuizResult ||
  mongoose.model<IQuizResultDocument>('QuizResult', QuizResultSchema);
