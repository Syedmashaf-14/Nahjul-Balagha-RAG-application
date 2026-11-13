import { RetrievedDocument, Citation } from '../../types/passage.types';

export class CitationBuilder {
  /**
   * Transforms raw retrieved documents into verified, structured citations
   * while filtering out duplicates.
   */
  public static buildCitations(documents: RetrievedDocument[]): Citation[] {
    const seen = new Set<string>();
    const citations: Citation[] = [];

    for (const doc of documents) {
      const key = `${doc.metadata.passageType}_${doc.metadata.passageNumber}`;
      if (seen.has(key)) continue;
      seen.add(key);

      citations.push({
        sourceId: doc.metadata.sourceId || doc.id,
        passageType: doc.metadata.passageType,
        passageNumber: doc.metadata.passageNumber,
        text: doc.content.length > 300 ? doc.content.substring(0, 300) + '...' : doc.content,
        arabicText: doc.metadata.arabicOriginal || null,
        translator: doc.metadata.translator || 'Syed Ali Reza',
        language: doc.metadata.language || 'english',
        sourceType: doc.metadata.contentType || 'translation',
        confidence: Number(doc.score.toFixed(3)),
      });
    }

    return citations;
  }
}
