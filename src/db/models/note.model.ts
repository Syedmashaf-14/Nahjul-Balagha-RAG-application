import mongoose, { Schema, Document } from 'mongoose';
import { INote } from '../../types/api.types';

export interface INoteDocument extends Omit<INote, '_id'>, Document {}

const NoteSchema = new Schema<INoteDocument>(
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
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    passageRef: {
      type: {
        type: String,
        enum: ['sermon', 'letter', 'saying'],
      },
      number: {
        type: Number,
      },
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
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    sourceMessageId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ userId: 1, updatedAt: -1 });
NoteSchema.index({ title: 'text', content: 'text' });

export const NoteModel = mongoose.models.Note || mongoose.model<INoteDocument>('Note', NoteSchema);
