import { RawPassage, DocumentChunk } from '../types/passage.types';
import { PassageChunker } from './chunking/passage-chunker';
import { getVectorStore } from '../config/vector-store';
import { v4 as uuidv4 } from 'uuid';

export interface IngestionOptions {
  sourceName: string;
  language: 'arabic' | 'english' | 'urdu';
  translator?: string;
  book?: string;
  edition?: string;
}

export class IngestionPipeline {
  /**
   * Processes a collection of raw passages, generates semantic chunks with metadata,
   * embeds and stores them directly into the Vector Database.
   */
  public async ingestPassages(
    passages: RawPassage[],
    options: IngestionOptions
  ): Promise<{ totalPassages: number; totalChunks: number; sourceId: string }> {
    const sourceId = `src_${uuidv4().substring(0, 8)}`;
    const allChunks: DocumentChunk[] = [];

    for (const passage of passages) {
      const chunks = PassageChunker.chunkPassage(
        {
          ...passage,
          language: options.language,
          translator: options.translator || passage.translator,
        },
        {
          sourceId,
          book: options.book || 'Nahj al-Balagha',
        }
      );
      allChunks.push(...chunks);
    }

    // Upsert into Vector Database
    const vectorStore = getVectorStore();
    await vectorStore.upsertChunks(allChunks);

    return {
      totalPassages: passages.length,
      totalChunks: allChunks.length,
      sourceId,
    };
  }
}

export const ingestionPipeline = new IngestionPipeline();
