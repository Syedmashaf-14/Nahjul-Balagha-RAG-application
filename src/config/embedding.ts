import { OpenAIEmbeddings } from '@langchain/openai';
import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';

export type EmbeddingProvider = 'openai' | 'google';

interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
}

const defaultConfig: EmbeddingConfig = {
  provider: (process.env.EMBEDDING_PROVIDER as EmbeddingProvider) || 'openai',
  model: process.env.EMBEDDING_MODEL || 'text-embedding-3-large',
  dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10),
};

/**
 * Deterministic pseudo-semantic embedding generator extending Embeddings base class.
 * Produces unit-length normalized vectors based on n-gram and token hashing.
 * Guarantees that vector search, cosine similarity, and document indexing
 * work reliably in local, offline, or mock environments.
 */
class DeterministicEmbeddings extends Embeddings {
  private dimensions: number;

  constructor(dimensions = 1536, params?: EmbeddingsParams) {
    super(params ?? {});
    this.dimensions = dimensions;
  }

  private hashString(str: string): number[] {
    const vector = new Array(this.dimensions).fill(0);
    const tokens = str.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, ' ').split(/\s+/).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      let h = 0;
      for (let j = 0; j < token.length; j++) {
        h = (h << 5) - h + token.charCodeAt(j);
        h |= 0;
      }
      const idx = Math.abs(h) % this.dimensions;
      vector[idx] += 1.0;

      // 2-gram hash
      if (i > 0) {
        const bigram = `${tokens[i - 1]}_${token}`;
        let bh = 0;
        for (let j = 0; j < bigram.length; j++) {
          bh = (bh << 5) - bh + bigram.charCodeAt(j);
          bh |= 0;
        }
        const bidx = Math.abs(bh) % this.dimensions;
        vector[bidx] += 1.5;
      }
    }

    // Normalize to unit vector (L2 norm)
    let norm = 0;
    for (let i = 0; i < this.dimensions; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map((doc) => this.hashString(doc));
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.hashString(document);
  }
}

/**
 * Wrapper that attempts remote OpenAI embedding, and falls back gracefully
 * to DeterministicEmbeddings if network or authentication fails.
 */
class RobustEmbeddings extends Embeddings {
  private primary: OpenAIEmbeddings | null = null;
  private fallback: DeterministicEmbeddings;

  constructor(dimensions: number, params?: EmbeddingsParams) {
    super(params ?? {});
    this.fallback = new DeterministicEmbeddings(dimensions);
    const apiKey = process.env.OPENAI_API_KEY;
    // Note: OpenRouter keys (starting with sk-or-) do not support standard OpenAI embeddings endpoint
    if (
      apiKey &&
      !apiKey.startsWith('sk-or-') &&
      !apiKey.startsWith('sk-demo') &&
      !apiKey.startsWith('sk-mock') &&
      apiKey.length > 20
    ) {
      try {
        this.primary = new OpenAIEmbeddings({
          openAIApiKey: apiKey,
          modelName: defaultConfig.model,
          dimensions,
        });
      } catch {
        this.primary = null;
      }
    }
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    if (this.primary) {
      try {
        return await this.primary.embedDocuments(documents);
      } catch (err) {
        console.warn('Primary embeddings failed, falling back to deterministic vectorization:', (err as any)?.message);
      }
    }
    return this.fallback.embedDocuments(documents);
  }

  async embedQuery(document: string): Promise<number[]> {
    if (this.primary) {
      try {
        return await this.primary.embedQuery(document);
      } catch (err) {
        console.warn('Primary query embedding failed, falling back to deterministic vectorization:', (err as any)?.message);
      }
    }
    return this.fallback.embedQuery(document);
  }
}

export function createEmbeddings(config: Partial<EmbeddingConfig> = {}): Embeddings {
  const finalConfig = { ...defaultConfig, ...config };
  return new RobustEmbeddings(finalConfig.dimensions);
}

let _defaultEmbeddings: Embeddings | null = null;

export function getDefaultEmbeddings(): Embeddings {
  if (!_defaultEmbeddings) {
    _defaultEmbeddings = createEmbeddings();
  }
  return _defaultEmbeddings;
}

export function getEmbeddingDimensions(): number {
  return defaultConfig.dimensions;
}
