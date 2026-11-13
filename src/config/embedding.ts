import { OpenAIEmbeddings } from '@langchain/openai';
import { Embeddings } from '@langchain/core/embeddings';

export type EmbeddingProvider = 'openai' | 'google';

interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
}

const defaultConfig: EmbeddingConfig = {
  provider: (process.env.EMBEDDING_PROVIDER as EmbeddingProvider) || 'openai',
  model: process.env.EMBEDDING_MODEL || 'text-embedding-3-large',
  dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '3072', 10),
};

export function createEmbeddings(config: Partial<EmbeddingConfig> = {}): Embeddings {
  const finalConfig = { ...defaultConfig, ...config };

  return new OpenAIEmbeddings({
    modelName: finalConfig.model,
    dimensions: finalConfig.dimensions,
    openAIApiKey: process.env.OPENAI_API_KEY || 'sk-mock-key-for-local-build',
  });
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
