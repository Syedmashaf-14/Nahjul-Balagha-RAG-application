import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../../types/conversation.types';

export interface IMessageDocument extends Omit<IMessage, '_id'>, Document {}

const CitationSubSchema = new Schema(
  {
    sourceId: { type: String, required: true },
    passageType: { type: String, required: true },
    passageNumber: { type: Number, required: true },
    text: { type: String, required: true },
    arabicText: { type: String, default: null },
    translator: { type: String, default: null },
    language: { type: String, required: true },
    confidence: { type: Number, default: 1 },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: {
      type: [CitationSubSchema],
      default: [],
    },
    metadata: {
      model: { type: String, default: 'gpt-4o' },
      tokensUsed: { type: Number, default: null },
      retrievalQuery: { type: String, default: null },
      documentsRetrieved: { type: Number, default: 0 },
      latencyMs: { type: Number, default: null },
      personalizationApplied: { type: Boolean, default: false },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: null },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel =
  mongoose.models.Message || mongoose.model<IMessageDocument>('Message', MessageSchema);
