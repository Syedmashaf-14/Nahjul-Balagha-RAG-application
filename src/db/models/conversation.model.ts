import mongoose, { Schema, Document } from 'mongoose';
import { IConversation } from '../../types/conversation.types';

export interface IConversationDocument extends Omit<IConversation, '_id'>, Document {}

const ConversationSchema = new Schema<IConversationDocument>(
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
    type: {
      type: String,
      enum: ['general', 'passage_exploration', 'learning', 'quiz'],
      default: 'general',
      index: true,
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
    summary: {
      type: String,
      default: null,
    },
    topicsCovered: {
      type: [String],
      default: [],
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });

export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
