import { z } from 'zod';

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationInput = z.infer<typeof PaginationSchema>;

// ─── Bookmark ────────────────────────────────────────────────────────────────

export const CreateBookmarkSchema = z.object({
  passageType: z.enum(['sermon', 'letter', 'saying']),
  passageNumber: z.number().int().positive(),
  title: z.string().min(1).max(300),
  arabicText: z.string().nullable().optional(),
  translationText: z.string().nullable().optional(),
  language: z.string().default('english'),
  translator: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  collectionId: z.string().nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
});
export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;

export interface IBookmark {
  _id: string;
  userId: string;
  passageType: string;
  passageNumber: number;
  title: string;
  arabicText: string | null;
  translationText: string | null;
  language: string;
  translator: string | null;
  tags: string[];
  collectionId: string | null;
  note: string | null;
  createdAt: Date;
}

// ─── Note ────────────────────────────────────────────────────────────────────

export const CreateNoteSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(50000),
  passageRef: z.object({
    type: z.enum(['sermon', 'letter', 'saying']),
    number: z.number().int().positive(),
  }).nullable().optional(),
  tags: z.array(z.string()).default([]),
  collectionId: z.string().nullable().optional(),
  isAIGenerated: z.boolean().default(false),
  sourceMessageId: z.string().nullable().optional(),
});
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).max(50000).optional(),
  tags: z.array(z.string()).optional(),
  collectionId: z.string().nullable().optional(),
});
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;

export interface INote {
  _id: string;
  userId: string;
  title: string;
  content: string;
  passageRef: { type: string; number: number } | null;
  tags: string[];
  collectionId: string | null;
  isAIGenerated: boolean;
  sourceMessageId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Collection ──────────────────────────────────────────────────────────────

export const CreateCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
});
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;

export const UpdateCollectionSchema = CreateCollectionSchema.partial();

export interface ICollection {
  _id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  bookmarkCount: number;
  noteCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Reading History ─────────────────────────────────────────────────────────

export const InteractionTypeEnum = z.enum(['viewed', 'explored', 'discussed', 'bookmarked']);

export interface IReadingHistory {
  _id: string;
  userId: string;
  passageType: string;
  passageNumber: number;
  interactionType: string;
  duration: number | null;
  createdAt: Date;
}

// ─── Daily Wisdom ────────────────────────────────────────────────────────────

export interface IDailyWisdom {
  _id: string;
  userId: string;
  passageType: string;
  passageNumber: number;
  arabicText: string | null;
  translationText: string;
  urduTranslation?: string | null;
  language: string;
  reflectionQuestion: string | null;
  topic: string;
  deliveredAt: Date;
  interacted: boolean;
  createdAt: Date;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
