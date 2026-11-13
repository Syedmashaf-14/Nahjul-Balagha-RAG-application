import { z } from 'zod';

// ─── Passage Types ───────────────────────────────────────────────────────────

export const PassageTypeEnum = z.enum(['sermon', 'letter', 'saying', 'dua']);
export type PassageType = z.infer<typeof PassageTypeEnum>;

export const ContentTypeEnum = z.enum(['original', 'translation', 'commentary']);
export type ContentType = z.infer<typeof ContentTypeEnum>;

export const DocumentStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);
export type DocumentStatus = z.infer<typeof DocumentStatusEnum>;

// ─── Passage Reference ──────────────────────────────────────────────────────

export const PassageRefSchema = z.object({
  type: PassageTypeEnum,
  number: z.number().int().positive(),
});
export type PassageRef = z.infer<typeof PassageRefSchema>;

// ─── Citation ────────────────────────────────────────────────────────────────

export const CitationSchema = z.object({
  sourceId: z.string(),
  passageType: PassageTypeEnum,
  passageNumber: z.number(),
  text: z.string(),
  arabicText: z.string().nullable(),
  translator: z.string().nullable(),
  language: z.string(),
  sourceType: ContentTypeEnum,
  confidence: z.number().min(0).max(1),
});
export type Citation = z.infer<typeof CitationSchema>;

// ─── Chunk Metadata (Vector Store) ──────────────────────────────────────────

export interface ChunkMetadata {
  book: string;
  sourceId: string;
  passageType: PassageType;
  passageNumber: number;
  passageTitle: string | null;
  language: 'arabic' | 'english' | 'urdu';
  translator: string | null;
  contentType: ContentType;
  commentaryAuthor: string | null;
  chapter: string | null;
  section: string | null;
  chunkIndex: number;
  totalChunks: number;
  arabicOriginal: string | null;
  urduTranslation?: string | null;
  romanUrduTranslation?: string | null;
  topics: string[];
  ingestedAt: string;
  chunkSize: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
  embedding?: number[];
}

// ─── Document Source ─────────────────────────────────────────────────────────

export interface IDocumentSource {
  _id: string;
  filename: string;
  sourceType: PassageType;
  language: 'arabic' | 'english' | 'urdu';
  translator: string | null;
  book: string;
  edition: string | null;
  totalChunks: number;
  status: DocumentStatus;
  error: string | null;
  processedAt: Date | null;
  createdAt: Date;
  createdBy: string;
}

// ─── Search & Retrieval ──────────────────────────────────────────────────────

export const PassageSearchSchema = z.object({
  query: z.string().min(1).max(1000),
  language: z.enum(['arabic', 'english', 'urdu', 'roman_urdu']).optional(),
  passageType: PassageTypeEnum.optional(),
  translator: z.string().optional(),
  topics: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(50).default(10),
  contentType: ContentTypeEnum.optional(),
});
export type PassageSearchInput = z.infer<typeof PassageSearchSchema>;

export interface RetrievedDocument {
  id: string;
  content: string;
  metadata: ChunkMetadata;
  score: number;
}

// ─── Ingestion ───────────────────────────────────────────────────────────────

export const IngestDocumentSchema = z.object({
  sourceType: PassageTypeEnum,
  language: z.enum(['arabic', 'english', 'urdu']),
  translator: z.string().nullable().optional(),
  book: z.string().default('Nahj al-Balagha'),
  edition: z.string().nullable().optional(),
});
export type IngestDocumentInput = z.infer<typeof IngestDocumentSchema>;

export interface RawPassage {
  number: number;
  title?: string;
  arabicText?: string;
  translationText?: string;
  urduTranslation?: string;
  romanUrduTranslation?: string;
  language: string;
  translator?: string;
  commentary?: string;
  commentaryAuthor?: string;
  topics?: string[];
  chapter?: string;
  section?: string;
}
