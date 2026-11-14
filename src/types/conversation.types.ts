import { z } from 'zod';
import { PassageRefSchema, CitationSchema, ContentTypeEnum, PassageTypeEnum } from './passage.types';

// ─── Conversation Types ──────────────────────────────────────────────────────

export const ConversationTypeEnum = z.enum(['general', 'passage_exploration', 'learning', 'quiz']);
export type ConversationType = z.infer<typeof ConversationTypeEnum>;

export const MessageRoleEnum = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleEnum>;

// ─── Conversation ────────────────────────────────────────────────────────────

export interface IConversation {
  _id: string;
  userId: string;
  title: string;
  type: ConversationType;
  passageRef: { type: string; number: number } | null;
  summary: string | null;
  topicsCovered: string[];
  messageCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface IMessage {
  _id: string;
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  imageUrl?: string | null;
  citations: Array<{
    sourceId: string;
    passageType: string;
    passageNumber: number;
    text: string;
    arabicText: string | null;
    translator: string | null;
    language: string;
    confidence: number;
  }>;
  metadata: {
    model: string;
    tokensUsed: number | null;
    retrievalQuery: string | null;
    documentsRetrieved: number;
    latencyMs: number | null;
    personalizationApplied: boolean;
  };
  feedback: {
    rating: number | null;
    comment: string | null;
  } | null;
  createdAt: Date;
}

// ─── Chat Request / Response ─────────────────────────────────────────────────

export const ChatRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(5000),
  image: z.string().optional(), // Base64 Data URL or image URL for multimodal vision analysis
  passageRef: PassageRefSchema.optional(),
  overrides: z.object({
    language: z.enum(['arabic', 'english', 'urdu']).optional(),
    explanationLevel: z.enum(['beginner', 'intermediate', 'advanced', 'researcher']).optional(),
    responseLength: z.enum(['short', 'moderate', 'detailed']).optional(),
  }).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatFeedbackSchema = z.object({
  messageId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
export type ChatFeedback = z.infer<typeof ChatFeedbackSchema>;

// ─── RAG Response ────────────────────────────────────────────────────────────

export const ConfidenceLevelEnum = z.enum(['high', 'medium', 'low', 'insufficient']);

export const RAGResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(CitationSchema),
  relatedTopics: z.array(z.string()),
  suggestedFollowUps: z.array(z.string()),
  confidenceLevel: ConfidenceLevelEnum,
  disclaimer: z.string().nullable(),
});
export type RAGResponse = z.infer<typeof RAGResponseSchema>;

export interface ChatResponsePayload {
  conversationId: string;
  messageId: string;
  content: string;
  citations: z.infer<typeof CitationSchema>[];
  relatedTopics: string[];
  suggestedFollowUps: string[];
  confidenceLevel: string;
  disclaimer: string | null;
}

// ─── Conversation API ────────────────────────────────────────────────────────

export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;

export const ConversationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: ConversationTypeEnum.optional(),
  archived: z.coerce.boolean().optional(),
});
