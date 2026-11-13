import { DocumentChunk, RawPassage, PassageType, ContentType } from '../../types/passage.types';
import { ArabicNormalizer } from '../processors/arabic-normalizer';
import { TextCleaner } from '../processors/text-cleaner';
import { v4 as uuidv4 } from 'uuid';

export interface ChunkerOptions {
  sourceId: string;
  book?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export class PassageChunker {
  /**
   * Chunks a raw passage into one or more vector-store ready DocumentChunk objects.
   */
  public static chunkPassage(passage: RawPassage, options: ChunkerOptions): DocumentChunk[] {
    const book = options.book || 'Nahj al-Balagha';
    const sourceId = options.sourceId;
    const passageType = this.inferPassageType(passage);
    const targetSize = options.chunkSize || 1000;
    const overlap = options.chunkOverlap || 150;

    const chunks: DocumentChunk[] = [];
    const now = new Date().toISOString();

    const arabicClean = passage.arabicText ? TextCleaner.clean(passage.arabicText) : null;
    const translationClean = passage.translationText ? TextCleaner.clean(passage.translationText) : null;

    // Sayings (Hikam) are typically concise; keep them as a single chunk whenever possible
    if (passageType === 'saying' || (!translationClean && arabicClean && arabicClean.length <= targetSize)) {
      const content = translationClean || arabicClean || '';
      chunks.push({
        id: `chunk_${passageType}_${passage.number}_0_${uuidv4().substring(0, 8)}`,
        content: content,
        metadata: {
          book,
          sourceId,
          passageType,
          passageNumber: passage.number,
          passageTitle: passage.title || `${passageType.toUpperCase()} ${passage.number}`,
          language: (passage.language as any) || 'english',
          translator: passage.translator || null,
          contentType: passage.translationText ? 'translation' : 'original',
          commentaryAuthor: passage.commentaryAuthor || null,
          chapter: passage.chapter || null,
          section: passage.section || null,
          chunkIndex: 0,
          totalChunks: 1,
          arabicOriginal: arabicClean,
          topics: passage.topics || [],
          ingestedAt: now,
          chunkSize: content.length,
        },
      });
      return chunks;
    }

    // For longer sermons and letters, split by paragraphs first
    const textToChunk = translationClean || arabicClean || '';
    const paragraphs = textToChunk.split(/\n\n+/).filter((p) => p.trim().length > 0);

    const textSegments: string[] = [];
    let currentSegment = '';

    for (const paragraph of paragraphs) {
      if ((currentSegment + '\n\n' + paragraph).length <= targetSize) {
        currentSegment = currentSegment ? currentSegment + '\n\n' + paragraph : paragraph;
      } else {
        if (currentSegment) {
          textSegments.push(currentSegment);
        }
        // If an individual paragraph exceeds targetSize, split by sentence
        if (paragraph.length > targetSize) {
          const sentences = paragraph.split(/(?<=[.?!۔])\s+/);
          let sentenceSeg = '';
          for (const s of sentences) {
            if ((sentenceSeg + ' ' + s).length <= targetSize) {
              sentenceSeg = sentenceSeg ? sentenceSeg + ' ' + s : s;
            } else {
              if (sentenceSeg) textSegments.push(sentenceSeg);
              sentenceSeg = s;
            }
          }
          if (sentenceSeg) textSegments.push(sentenceSeg);
          currentSegment = '';
        } else {
          currentSegment = paragraph;
        }
      }
    }
    if (currentSegment) {
      textSegments.push(currentSegment);
    }

    const total = textSegments.length;
    textSegments.forEach((seg, idx) => {
      chunks.push({
        id: `chunk_${passageType}_${passage.number}_${idx}_${uuidv4().substring(0, 8)}`,
        content: seg,
        metadata: {
          book,
          sourceId,
          passageType,
          passageNumber: passage.number,
          passageTitle: passage.title || `${passageType.toUpperCase()} ${passage.number} (Part ${idx + 1})`,
          language: (passage.language as any) || 'english',
          translator: passage.translator || null,
          contentType: passage.translationText ? 'translation' : 'original',
          commentaryAuthor: passage.commentaryAuthor || null,
          chapter: passage.chapter || null,
          section: passage.section || null,
          chunkIndex: idx,
          totalChunks: total,
          arabicOriginal: arabicClean,
          topics: passage.topics || [],
          ingestedAt: now,
          chunkSize: seg.length,
        },
      });
    });

    return chunks;
  }

  private static inferPassageType(passage: RawPassage): PassageType {
    if (passage.chapter?.toLowerCase().includes('letter')) return 'letter';
    if (passage.chapter?.toLowerCase().includes('saying') || passage.chapter?.toLowerCase().includes('maxim')) return 'saying';
    return 'sermon';
  }
}
