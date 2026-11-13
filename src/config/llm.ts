import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export type LLMProvider = 'openai' | 'openrouter' | 'google';

interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

const defaultModel =
  process.env.LLM_MODEL ||
  (process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-') || process.env.OPENROUTER_API_KEY
    ? 'openai/gpt-4o-mini'
    : 'gpt-4o');

const defaultConfig: LLMConfig = {
  provider:
    (process.env.LLM_PROVIDER as LLMProvider) ||
    (process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-') || process.env.OPENROUTER_API_KEY
      ? 'openrouter'
      : 'openai'),
  model: defaultModel,
  temperature: 0.3,
  maxTokens: 4096,
};

export function createLLM(config: Partial<LLMConfig> = {}): BaseChatModel {
  const finalConfig = { ...defaultConfig, ...config };
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    'sk-mock-key-for-local-build';

  const isOpenRouter =
    apiKey.startsWith('sk-or-v1-') ||
    finalConfig.provider === 'openrouter' ||
    Boolean(process.env.OPENROUTER_API_KEY);

  if (isOpenRouter) {
    return new ChatOpenAI({
      modelName: finalConfig.model,
      temperature: finalConfig.temperature,
      maxTokens: finalConfig.maxTokens,
      apiKey: apiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Nahj al-Balagha Knowledge Platform',
        },
      },
    });
  }

  return new ChatOpenAI({
    modelName: finalConfig.model,
    temperature: finalConfig.temperature,
    maxTokens: finalConfig.maxTokens,
    openAIApiKey: apiKey,
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
