import { getFactualLLM } from '../../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { Language } from '../../types/user.types';

export class QueryRewriter {
  /**
   * Rewrites user queries, handling conversational references and translating
   * Roman Urdu / Urdu / colloquial queries into optimized semantic retrieval search queries.
   */
  public async rewrite(
    query: string,
    historySummary?: string | null,
    detectedLanguage: Language = 'english'
  ): Promise<string> {
    if (!historySummary && query.length < 25 && detectedLanguage === 'english') {
      return query;
    }

    const llm = getFactualLLM();

    const systemPrompt = `You are a query reformulation assistant for a Nahj al-Balagha retrieval system.
Your job is to rewrite the user's input into an optimal semantic search query.
If the query is in Roman Urdu, Urdu, or Arabic, extract the core themes, theological concepts, and Arabic terminology (e.g. adalat, hikmah, taqwa, sabr, hukumat, Malik al-Ashtar) to maximize retrieval precision.
If conversational history is provided, resolve pronouns like "that sermon", "he", "the next letter".
Return ONLY the reformulated query string. Do not include quotes, explanations, or punctuation.`;

    const userMessageContent = historySummary
      ? `Conversation Context: ${historySummary}\n\nCurrent User Query: ${query}`
      : `User Query: ${query}`;

    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessageContent),
      ]);

      const rewritten = response.content.toString().trim();
      return rewritten || query;
    } catch (err) {
      console.warn('Query rewriting fallback to original query:', err);
      return query;
    }
  }
}

export const queryRewriter = new QueryRewriter();
