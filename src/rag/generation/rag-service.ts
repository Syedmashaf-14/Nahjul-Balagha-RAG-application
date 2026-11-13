import { getDefaultLLM } from '../../config/llm';
import { userPreferencesRepository } from '../../db/repositories/user-preferences.repository';
import { readingHistoryRepository } from '../../db/repositories/reading-history.repository';
import { queryRewriter } from '../query/query-rewriter';
import { knowledgeRetriever } from '../retrieval/retriever';
import { CitationBuilder } from '../postprocessing/citation-builder';
import { PromptBuilder } from './prompt-builder';
import { LanguageDetector } from '../../ingestion/processors/language-detector';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { RAGResponse, ChatRequest } from '../../types/conversation.types';
import { UserPreferences, UserPreferencesSchema } from '../../types/user.types';

export class RAGService {
  /**
   * Executes the full Personalized RAG pipeline.
   */
  public async generateAnswer(
    userId: string,
    request: ChatRequest,
    conversationHistorySummary?: string | null
  ): Promise<RAGResponse> {
    const startTime = Date.now();

    // 1. Fetch user preferences from MongoDB (with graceful fallback if database is connecting)
    let preferences: UserPreferences;
    try {
      const userPrefsDoc = await userPreferencesRepository.getByUserId(userId);
      preferences = UserPreferencesSchema.parse(userPrefsDoc.toObject());
    } catch {
      preferences = UserPreferencesSchema.parse({});
    }

    // Apply per-request overrides if provided
    if (request.overrides) {
      preferences = {
        ...preferences,
        ...request.overrides,
      } as UserPreferences;
    }

    // 2. Detect query language
    const detectedLang = LanguageDetector.detect(request.message);

    // 3. Query reformulation
    const searchReadyQuery = await queryRewriter.rewrite(
      request.message,
      conversationHistorySummary,
      detectedLang
    );

    // 4. Retrieve candidate documents from the Vector Database
    const retrievedDocs = await knowledgeRetriever.retrieve(
      searchReadyQuery,
      6,
      request.passageRef
        ? {
            passageType: request.passageRef.type,
            passageNumber: request.passageRef.number,
          }
        : undefined
    );

    // 5. Build structured citations
    const citations = CitationBuilder.buildCitations(retrievedDocs);

    // 6. Formulate system and context prompts
    const systemPrompt = PromptBuilder.buildPersonalizedSystemPrompt(preferences);
    const contextText = PromptBuilder.formatContextDocuments(retrievedDocs);

    const promptMessage = `USER QUESTION:
${request.message}

VERIFIED NAHJ AL-BALAGHA CONTEXT:
${contextText}

INSTRUCTIONS:
Provide an inspiring, accurate, and faithful response. If context is insufficient, explicitly state so.
At the end of your response, on a new line, add:
FOLLOW_UPS: <Question 1> | <Question 2> | <Question 3>
TOPICS: <topic1>, <topic2>`;

    // 7. Invoke LLM with resilient fallback
    let cleanAnswer = '';
    let suggestedFollowUps: string[] = [];
    let relatedTopics: string[] = [];

    try {
      const llm = getDefaultLLM();
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(promptMessage),
      ]);
      const fullText = response.content.toString();

      // 8. Extract follow-ups, topics, and clean answer
      cleanAnswer = fullText;

      const followUpMatch = fullText.match(/FOLLOW_UPS:\s*(.*)/i);
      if (followUpMatch) {
        suggestedFollowUps = followUpMatch[1]
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean);
        cleanAnswer = cleanAnswer.replace(/FOLLOW_UPS:[\s\S]*/i, '').trim();
      }

      const topicsMatch = fullText.match(/TOPICS:\s*(.*)/i);
      if (topicsMatch) {
        relatedTopics = topicsMatch[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        cleanAnswer = cleanAnswer.replace(/TOPICS:[\s\S]*/i, '').trim();
      }
    } catch (llmErr) {
      console.warn('RAG LLM invocation failed:', (llmErr as any)?.message);
      // Offline/Local synthesis based on authentic retrieved passages
      if (retrievedDocs.length > 0) {
        const topDoc = retrievedDocs[0];
        const arabicPart = topDoc.metadata.arabicOriginal
          ? `\n\n> **${topDoc.metadata.arabicOriginal}**\n\n`
          : '\n\n';
        cleanAnswer = `Regarding your inquiry, Imam Ali states in **${topDoc.metadata.passageType.toUpperCase()} #${topDoc.metadata.passageNumber}** (${topDoc.metadata.passageTitle || 'Nahj al-Balagha'}):${arabicPart}*"${topDoc.content}"*\n\nThis passage emphasizes the profound commitment to justice, spiritual discernment, and ethical integrity that characterizes the path of eloquence.`;
      } else {
        cleanAnswer = `I have consulted the corpus of Nahj al-Balagha. To preserve strict religious integrity and avoid fabrication, I acknowledge that the specific reference directly answering this is not in the active knowledge base.`;
      }
    }

    // Fallbacks if LLM omitted them
    if (suggestedFollowUps.length === 0) {
      suggestedFollowUps = [
        'How does Imam Ali define the role of justice in governance?',
        'Can you explain the deeper spiritual meaning behind this passage?',
        'What are other sermons or sayings with similar themes?',
      ];
    }

    if (relatedTopics.length === 0) {
      relatedTopics = ['Justice', 'Wisdom', 'Character Development', 'Leadership'];
    }

    const confidenceLevel =
      retrievedDocs.length === 0
        ? 'insufficient'
        : retrievedDocs[0].score > 0.7
        ? 'high'
        : 'medium';

    const disclaimer =
      confidenceLevel === 'insufficient'
        ? 'This explanation is general as no exact matching passages were found in the current knowledge base.'
        : null;

    // 9. Asynchronously record reading history for personalization tracking
    if (citations.length > 0) {
      readingHistoryRepository
        .recordInteraction({
          userId,
          passageType: citations[0].passageType,
          passageNumber: citations[0].passageNumber,
          interactionType: 'explored',
          duration: Math.round((Date.now() - startTime) / 1000),
        })
        .catch(() => {});
    }

    return {
      answer: cleanAnswer,
      citations,
      relatedTopics,
      suggestedFollowUps,
      confidenceLevel,
      disclaimer,
    };
  }
}

export const ragService = new RAGService();
