import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export type LLMProvider = 'openai' | 'google';

interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const defaultConfig: LLMConfig = {
  provider: (process.env.LLM_PROVIDER as LLMProvider) || 'openai',
  model: process.env.LLM_MODEL || 'gpt-4o',
  temperature: 0.3,
  maxTokens: 4096,
};

export function createLLM(config: Partial<LLMConfig> = {}): BaseChatModel {
  const finalConfig = { ...defaultConfig, ...config };

  // Default to standard ChatOpenAI instance with safe mock key handling
  return new ChatOpenAI({
    modelName: finalConfig.model,
    temperature: finalConfig.temperature,
    maxTokens: finalConfig.maxTokens,
    openAIApiKey: process.env.OPENAI_API_KEY || 'sk-mock-key-for-local-build',
  });
}

// Singleton instance for general use
let _defaultLLM: BaseChatModel | null = null;

export function getDefaultLLM(): BaseChatModel {
  if (!_defaultLLM) {
    _defaultLLM = createLLM();
  }
  return _defaultLLM;
}

// Lower temperature instance for factual tasks
export function getFactualLLM(): BaseChatModel {
  return createLLM({ temperature: 0.1 });
}

// Higher temperature for creative tasks (quiz generation, reflections)
export function getCreativeLLM(): BaseChatModel {
  return createLLM({ temperature: 0.7 });
}
