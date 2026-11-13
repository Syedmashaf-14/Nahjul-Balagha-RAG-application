import mongoose, { Schema, Document } from 'mongoose';
import { IUserPreferences } from '../../types/user.types';

export interface IUserPreferencesDocument extends Omit<IUserPreferences, '_id'>, Document {}

const UserPreferencesSchema = new Schema<IUserPreferencesDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['arabic', 'english', 'urdu', 'roman_urdu'],
      default: 'english',
    },
    explanationLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'researcher'],
      default: 'intermediate',
    },
    responseLength: {
      type: String,
      enum: ['short', 'moderate', 'detailed'],
      default: 'moderate',
    },
    learningObjectives: {
      type: [String],
      default: ['general_knowledge'],
    },
    topicsOfInterest: {
      type: [String],
      default: [],
    },
    preferredTranslator: {
      type: String,
      default: null,
    },
    explanationStyle: {
      type: String,
      enum: ['analytical', 'reflective', 'simplified', 'scholarly'],
      default: 'reflective',
    },
    dailyWisdom: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
      preferredTopics: { type: [String], default: [] },
      preferredTime: { type: String, default: null },
    },
    accessibility: {
      showArabicText: { type: Boolean, default: true },
      showTransliteration: { type: Boolean, default: false },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreferencesModel =
  mongoose.models.UserPreferences ||
  mongoose.model<IUserPreferencesDocument>('UserPreferences', UserPreferencesSchema);
