import { Pinecone } from '@pinecone-database/pinecone';
import { DocumentChunk, ChunkMetadata, RetrievedDocument } from '../types/passage.types';
import { getDefaultEmbeddings } from './embedding';

export interface IVectorStore {
  upsertChunks(chunks: DocumentChunk[]): Promise<void>;
  similaritySearch(
    queryVector: number[],
    limit?: number,
    filter?: Record<string, any>
  ): Promise<RetrievedDocument[]>;
  similaritySearchByText(
    queryText: string,
    limit?: number,
    filter?: Record<string, any>
  ): Promise<RetrievedDocument[]>;
  deleteBySourceId(sourceId: string): Promise<void>;
}

export class PineconeVectorStore implements IVectorStore {
  private client: Pinecone | null = null;
  private indexName: string;
  private namespace: string;

  constructor() {
    this.indexName = process.env.PINECONE_INDEX || 'nahj-al-balagha';
    this.namespace = process.env.PINECONE_NAMESPACE || 'default';
  }

  private getClient(): Pinecone {
    if (!this.client) {
      const apiKey = process.env.PINECONE_API_KEY;
      if (!apiKey) {
        throw new Error('PINECONE_API_KEY is not configured in environment variables');
      }
      this.client = new Pinecone({ apiKey });
    }
    return this.client;
  }

  private getIndex() {
    return this.getClient().index(this.indexName).namespace(this.namespace);
  }

  async upsertChunks(chunks: DocumentChunk[]): Promise<void> {
    const embeddingsService = getDefaultEmbeddings();
    const index = this.getIndex();

    // Batch upsert in sizes of 50 to respect payload limits
    const batchSize = 50;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Calculate embeddings if not already attached
      const vectors = await Promise.all(
        batch.map(async (chunk) => {
          const vector = chunk.embedding ?? (await embeddingsService.embedQuery(chunk.content));
          return {
            id: chunk.id,
            values: vector,
            metadata: {
              ...chunk.metadata,
              content: chunk.content,
            } as Record<string, any>,
          };
        })
      );

      await (index as any).upsert(vectors);
    }
  }

  async similaritySearch(
    queryVector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<RetrievedDocument[]> {
    const index = this.getIndex();

    const response = await index.query({
      vector: queryVector,
      topK: limit,
      filter: filter,
      includeMetadata: true,
    });

    return (response.matches || []).map((match) => {
      const metadata = match.metadata || {};
      const content = (metadata.content as string) || '';
      // Exclude text content from raw metadata to prevent duplication
      const { content: _, ...cleanMetadata } = metadata;

      return {
        id: match.id,
        content,
        metadata: cleanMetadata as unknown as ChunkMetadata,
        score: match.score ?? 0,
      };
    });
  }

  async similaritySearchByText(
    queryText: string,
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<RetrievedDocument[]> {
    const embeddingsService = getDefaultEmbeddings();
    const queryVector = await embeddingsService.embedQuery(queryText);
    return this.similaritySearch(queryVector, limit, filter);
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    const index = this.getIndex();
    await (index as any).deleteMany({
      sourceId: { $eq: sourceId },
    });
  }
}

// In-Memory Vector Store implementation as a fallback for local testing & development without remote Pinecone credentials
export class InMemoryVectorStore implements IVectorStore {
  private store: Map<string, { chunk: DocumentChunk; vector: number[] }> = new Map();

  async upsertChunks(chunks: DocumentChunk[]): Promise<void> {
    const embeddings = getDefaultEmbeddings();
    for (const chunk of chunks) {
      const vector = chunk.embedding ?? (await embeddings.embedQuery(chunk.content));
      this.store.set(chunk.id, { chunk, vector });
    }
  }

  async similaritySearch(
    queryVector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<RetrievedDocument[]> {
    const results: RetrievedDocument[] = [];

    for (const [id, entry] of this.store.entries()) {
      // Apply filters if provided
      if (filter) {
        let match = true;
        for (const [key, val] of Object.entries(filter)) {
          if ((entry.chunk.metadata as any)[key] !== val) {
            match = false;
            break;
          }
        }
        if (!match) continue;
      }

      const score = this.cosineSimilarity(queryVector, entry.vector);
      results.push({
        id,
        content: entry.chunk.content,
        metadata: entry.chunk.metadata,
        score,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  async similaritySearchByText(
    queryText: string,
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<RetrievedDocument[]> {
    const embeddings = getDefaultEmbeddings();
    const queryVector = await embeddings.embedQuery(queryText);
    return this.similaritySearch(queryVector, limit, filter);
  }

  async deleteBySourceId(sourceId: string): Promise<void> {
    for (const [id, entry] of this.store.entries()) {
      if (entry.chunk.metadata.sourceId === sourceId) {
        this.store.delete(id);
      }
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}

let _vectorStoreInstance: IVectorStore | null = null;

export function getVectorStore(): IVectorStore {
  if (!_vectorStoreInstance) {
    if (process.env.VECTOR_DB_PROVIDER === 'pinecone' && process.env.PINECONE_API_KEY) {
      _vectorStoreInstance = new PineconeVectorStore();
    } else {
      console.warn('⚠️ PINECONE_API_KEY not detected. Using high-performance InMemoryVectorStore for Vector Search.');
      _vectorStoreInstance = new InMemoryVectorStore();
    }
  }
  return _vectorStoreInstance;
}
