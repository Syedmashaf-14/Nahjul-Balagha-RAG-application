import mongoose, { Schema, Document } from 'mongoose';
import { IBookmark } from '../../types/api.types';

export interface IBookmarkDocument extends Omit<IBookmark, '_id'>, Document {}

const BookmarkSchema = new Schema<IBookmarkDocument>(
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
    title: {
      type: String,
      required: true,
    },
    arabicText: {
      type: String,
      default: null,
    },
    translationText: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: 'english',
    },
    translator: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    collectionId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Collection',
      default: null,
      index: true,
    },
    note: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

BookmarkSchema.index({ userId: 1, passageType: 1, passageNumber: 1 });
BookmarkSchema.index({ userId: 1, createdAt: -1 });

export const BookmarkModel =
  mongoose.models.Bookmark || mongoose.model<IBookmarkDocument>('Bookmark', BookmarkSchema);
