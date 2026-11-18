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
  process.env.LLM_MODEL && process.env.LLM_MODEL !== 'google/gemini-2.5-flash'
    ? process.env.LLM_MODEL
    : 'openrouter/free';

const defaultConfig: LLMConfig = {
  provider:
    (process.env.LLM_PROVIDER as LLMProvider) ||
    (process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-') || process.env.OPENROUTER_API_KEY
      ? 'openrouter'
      : 'openai'),
  model: defaultModel,
  temperature: 0.3,
  maxTokens: 1500,
};

export function createLLM(config: Partial<LLMConfig> = {}): BaseChatModel {
  const finalConfig = { ...defaultConfig, ...config };
  
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  
  // Determine provider: OpenRouter if key is sk-or-v1 or provider explicitly openrouter
  const isOpenRouter =
    finalConfig.provider === 'openrouter' ||
    Boolean(openRouterKey && !openAIKey) ||
    Boolean(openAIKey?.startsWith('sk-or-v1-'));

  const apiKey = isOpenRouter
    ? (openRouterKey || openAIKey || 'sk-mock-key')
    : (openAIKey || openRouterKey || 'sk-mock-key');

  if (isOpenRouter || apiKey.startsWith('sk-or-v1-')) {
    // OpenRouter requires provider prefix, e.g. "openai/gpt-4o" or "openai/gpt-4o-mini"
    let modelName = finalConfig.model;
    if (!modelName.includes('/')) {
      modelName = `openai/${modelName}`;
    }

    return new ChatOpenAI({
      modelName,
      temperature: finalConfig.temperature,
      maxTokens: finalConfig.maxTokens,
      apiKey: apiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://nehjulbalagah.vercel.app',
          'X-Title': 'Nahj al-Balagha Knowledge Platform',
        },
      },
      modelKwargs: {
        reasoning: { effort: 'low' },
      },
    });
  }

  // Direct OpenAI endpoint
  const cleanOpenAIModel = finalConfig.model.replace(/^openai\//, '');
  return new ChatOpenAI({
    modelName: cleanOpenAIModel,
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
