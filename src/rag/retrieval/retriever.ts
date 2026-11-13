import { getVectorStore } from '../../config/vector-store';
import { RetrievedDocument, PassageType } from '../../types/passage.types';

export interface RetrievalFilters {
  passageType?: PassageType;
  passageNumber?: number;
  language?: string;
  translator?: string;
  topics?: string[];
}

export class KnowledgeRetriever {
  /**
   * Retrieves relevant passages from the vector store based on query text and optional filters.
   */
  public async retrieve(
    queryText: string,
    limit: number = 6,
    filters?: RetrievalFilters
  ): Promise<RetrievedDocument[]> {
    const vectorStore = getVectorStore();

    const vectorFilter: Record<string, any> = {};
    if (filters?.passageType) {
      vectorFilter.passageType = filters.passageType;
    }
    if (filters?.passageNumber !== undefined) {
      vectorFilter.passageNumber = filters.passageNumber;
    }
    if (filters?.language) {
      vectorFilter.language = filters.language;
    }

    try {
      const docs = await vectorStore.similaritySearchByText(
        queryText,
        limit,
        Object.keys(vectorFilter).length > 0 ? vectorFilter : undefined
      );

      // If user also provided topic filters, give bonus relevance or filter
      if (filters?.topics && filters.topics.length > 0) {
        return docs.filter((doc) =>
          doc.metadata.topics?.some((t) => filters.topics?.includes(t))
        );
      }

      return docs;
    } catch (error) {
      console.error('Retrieval error in KnowledgeRetriever:', error);
      return [];
    }
  }
}

export const knowledgeRetriever = new KnowledgeRetriever();
