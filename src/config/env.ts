import { z } from 'zod';

const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().url(),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  
  // LLM
  OPENAI_API_KEY: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),
  LLM_PROVIDER: z.enum(['openai', 'google']).default('openai'),
  LLM_MODEL: z.string().default('gpt-4o'),
  
  // Embeddings
  EMBEDDING_PROVIDER: z.enum(['openai', 'google']).default('openai'),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-large'),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(3072),
  
  // Vector DB
  VECTOR_DB_PROVIDER: z.enum(['pinecone', 'mongodb']).default('pinecone'),
  PINECONE_API_KEY: z.string().min(1).optional(),
  PINECONE_INDEX: z.string().default('nahj-al-balagha'),
  PINECONE_NAMESPACE: z.string().default('default'),
  
  // Reranker
  COHERE_API_KEY: z.string().min(1).optional(),
  USE_RERANKER: z.coerce.boolean().default(false),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Rate Limiting
  RATE_LIMIT_CHAT_PER_MIN: z.coerce.number().default(30),
  RATE_LIMIT_API_PER_MIN: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration. Check your .env file.');
  }
  
  // Validate that at least one LLM API key is provided
  const env = parsed.data;
  if (env.LLM_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER is "openai"');
  }
  if (env.LLM_PROVIDER === 'google' && !env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is required when LLM_PROVIDER is "google"');
  }
  
  // Validate vector DB config
  if (env.VECTOR_DB_PROVIDER === 'pinecone' && !env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is required when VECTOR_DB_PROVIDER is "pinecone"');
  }
  
  return env;
}

export const env = validateEnv();
