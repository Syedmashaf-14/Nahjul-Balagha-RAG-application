import { getVectorStore } from '../../config/vector-store';
import { RetrievedDocument, PassageType } from '../../types/passage.types';
import { HybridSearchEngine } from './hybrid-search';

export interface RetrievalFilters {
  passageType?: PassageType;
  passageNumber?: number;
  language?: string;
  translator?: string;
  topics?: string[];
}

export class KnowledgeRetriever {
  /**
   * Retrieves relevant passages using Hybrid Search (Dense Vector + BM25 Lexical + Entity Resolution).
   */
  public async retrieve(
    queryText: string,
    limit: number = 6,
    filters?: RetrievalFilters,
    secondaryQuery?: string
  ): Promise<RetrievedDocument[]> {
    const vectorStore = getVectorStore();

    // Check for explicit passage reference in query (e.g. "letter 31", "sermon 193", "حکمت 81")
    const explicit = HybridSearchEngine.extractExplicitPassage(queryText) ||
      (secondaryQuery ? HybridSearchEngine.extractExplicitPassage(secondaryQuery) : null);

    const effectiveType = filters?.passageType || explicit?.type;
    const effectiveNumber = filters?.passageNumber !== undefined ? filters.passageNumber : explicit?.number;

    // 1. High-Precision Lexical & Entity Search across all canonical passages
    const primaryLexical = HybridSearchEngine.searchLexical(queryText, limit * 2, {
      passageType: effectiveType,
      passageNumber: effectiveNumber,
    });

    const secondaryLexical = secondaryQuery && secondaryQuery !== queryText
      ? HybridSearchEngine.searchLexical(secondaryQuery, limit, {
          passageType: effectiveType,
          passageNumber: effectiveNumber,
        })
      : [];

    const lexicalDocs = [...primaryLexical];
    for (const doc of secondaryLexical) {
      if (!lexicalDocs.some(d => d.metadata.passageType === doc.metadata.passageType && d.metadata.passageNumber === doc.metadata.passageNumber)) {
        lexicalDocs.push(doc);
      }
    }

    // 2. Dense Semantic Vector Search
    let vectorDocs: RetrievedDocument[] = [];
    try {
      const vectorFilter: Record<string, any> = {};
      if (effectiveType) vectorFilter.passageType = effectiveType;
      if (effectiveNumber !== undefined) vectorFilter.passageNumber = effectiveNumber;

      vectorDocs = await vectorStore.similaritySearchByText(
        queryText,
        limit * 2,
        Object.keys(vectorFilter).length > 0 ? vectorFilter : undefined
      );
    } catch (err) {
      console.warn('Vector retrieval fallback, using lexical matches:', err);
    }

    // 3. Reciprocal Rank Fusion (RRF) & Merging
    const docMap = new Map<string, { doc: RetrievedDocument; rrfScore: number }>();
    const k = 60; // Standard RRF smoothing constant

    // Process lexical results
    lexicalDocs.forEach((doc, rank) => {
      const key = `${doc.metadata.passageType}_${doc.metadata.passageNumber}`;
      const isExactMatch =
        effectiveNumber !== undefined &&
        doc.metadata.passageNumber === effectiveNumber &&
        (!effectiveType || doc.metadata.passageType === effectiveType);

      // Exact passage request receives unassailable top score
      const rrf = isExactMatch ? 1000.0 : (1.5 / (k + rank + 1));
      docMap.set(key, { doc, rrfScore: rrf });
    });

    // Process vector results
    vectorDocs.forEach((doc, rank) => {
      const key = `${doc.metadata.passageType}_${doc.metadata.passageNumber}`;
      const isExactMatch =
        effectiveNumber !== undefined &&
        doc.metadata.passageNumber === effectiveNumber &&
        (!effectiveType || doc.metadata.passageType === effectiveType);

      const rrf = isExactMatch ? 1000.0 : (1.0 / (k + rank + 1));
      if (docMap.has(key)) {
        const existing = docMap.get(key)!;
        existing.rrfScore += rrf;
        if (!existing.doc.metadata.arabicOriginal && doc.metadata.arabicOriginal) {
          existing.doc.metadata.arabicOriginal = doc.metadata.arabicOriginal;
        }
        if (!existing.doc.metadata.urduTranslation && doc.metadata.urduTranslation) {
          existing.doc.metadata.urduTranslation = doc.metadata.urduTranslation;
        }
      } else {
        docMap.set(key, { doc, rrfScore: rrf });
      }
    });

    const merged = Array.from(docMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map((entry) => ({
        ...entry.doc,
        score: entry.rrfScore >= 1000.0 ? 1.0 : Math.min(1.0, entry.rrfScore * 30),
      }));

    return merged.slice(0, limit);
  }
}

export const knowledgeRetriever = new KnowledgeRetriever();
