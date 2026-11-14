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

function isOutOfDomainQuery(query: string): boolean {
  const lower = query.toLowerCase();

  // Sacred/domain terms that should never be blocked
  const inDomainKeywords = [
    'ali', 'imam', 'nahj', 'balagha', 'balaghah', 'sermon', 'khutbah', 'khutba',
    'letter', 'maktoob', 'saying', 'hikmah', 'wisdom', 'justice', 'malik', 'ashtar',
    'kumayl', 'hasan', 'hussain', 'islam', 'allah', 'prophet', 'governance', 'caliph',
    'sabr', 'patience', 'taqwa', 'piety', 'aqil', 'muttaqeen', 'dua', 'prayer', 'ziyad',
    'muhammad', 'quran', 'hadith', 'nahjul', 'balagah', 'ahlulbayt', 'shia', 'sunni',
    'ghadir', 'kufa', 'siffin', 'jamal', 'nehj', 'nehjul'
  ];
  const hasInDomainKeyword = inDomainKeywords.some((kw) => lower.includes(kw));
  if (hasInDomainKeyword) return false;

  // Patterns that indicate general worldly questions outside Nahj al-Balagha
  const outOfDomainPatterns = [
    /\bcapital of\b/i,
    /\bweather in\b/i,
    /\bpopulation of\b/i,
    /\bcurrency of\b/i,
    /\brecipe for\b/i,
    /\bwrite a python\b/i,
    /\bwrite code\b/i,
    /\bwho won the\b/i,
    /\bpresident of\b/i,
    /\bprime minister of\b/i,
    /\bscore of\b/i,
    /\bstock price\b/i,
    /\bcricket\b/i,
    /\bfootball\b/i,
    /\bmovie\b/i,
  ];

  return outOfDomainPatterns.some((pattern) => pattern.test(query));
}

export class RAGService {
  /**
   * Executes the full Personalized RAG pipeline with strict religious accuracy
   * and out-of-domain guardrail enforcement.
   */
  public async generateAnswer(
    userId: string,
    request: ChatRequest,
    conversationHistorySummary?: string | null
  ): Promise<RAGResponse> {
    const startTime = Date.now();

    // 1. Detect query language first
    const detectedLang = LanguageDetector.detect(request.message);

    // 2. Strict Domain Guardrail Check
    if (isOutOfDomainQuery(request.message)) {
      const refusalMessage =
        detectedLang === 'urdu'
          ? 'میں صرف نہج البلاغہ اور امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے خطبات، مکتوبات، حکمتوں اور دعاؤں کے لیے وقف ہوں۔ میں دنیاوی و عمومی معلومات (جیسے جغرافیہ، سیاست، کھیل وغیرہ) کا جواب نہیں دے سکتا۔\n\nآپ نہج البلاغہ سے متعلق کسی بھی خطبے، مکتوب (جیسے خط نمبر 53 بنام مالک اشتر)، حکمت یا دعا کے بارے میں بلا جھجھک دریافت فرما سکتے ہیں۔'
          : 'I am dedicated exclusively to Nahj al-Balagha and the sacred teachings, sermons, letters, sayings, and supplications of Imam Ali ibn Abi Talib (a.s.). I cannot answer general worldly queries outside this sacred scope (such as geography, general trivia, or modern topics).\n\nPlease feel free to ask about any sermon (Khutbah), letter on governance (such as Letter 53 to Malik al-Ashtar), maxim on wisdom, supplication (Du\'a), or moral guidance from Nahj al-Balagha.';

      return {
        answer: refusalMessage,
        citations: [],
        relatedTopics: ['Letter 53 on Governance', 'Saying 147 on Knowledge', 'Khutba al-Muttaqeen', 'Supplications of Imam Ali'],
        suggestedFollowUps:
          detectedLang === 'urdu'
            ? [
                'خط نمبر 53 میں حکمرانی کے بنیادی اصول کیا ہیں؟',
                'حکمت نمبر 147 میں علم اور مال کا موازنہ کیسے کیا گیا ہے؟',
                'خطبہ 193 (خطبہ متقین) میں پرہیزگاروں کے کیا اوصاف بیان ہوئے ہیں؟',
              ]
            : [
                'What are the core principles of governance in Letter 53?',
                'How does Imam Ali describe knowledge vs wealth in Saying 147?',
                'What are the characteristics of the pious in Sermon 193?',
              ],
        confidenceLevel: 'insufficient',
        disclaimer: 'Out-of-domain query deflected to preserve strict focus on Nahj al-Balagha.',
      };
    }

    // 3. Fetch user preferences from MongoDB (with graceful fallback if database is connecting)
    let preferences: UserPreferences;
    try {
      const userPrefsDoc = await userPreferencesRepository.getByUserId(userId);
      preferences = UserPreferencesSchema.parse(userPrefsDoc.toObject());
    } catch {
      preferences = UserPreferencesSchema.parse({});
    }

    // Ensure preferred language dynamically reflects query language
    preferences.language = detectedLang;

    // Apply per-request overrides if provided
    if (request.overrides) {
      preferences = {
        ...preferences,
        ...request.overrides,
      } as UserPreferences;
    }

    // 4. Query reformulation
    const searchReadyQuery = await queryRewriter.rewrite(
      request.message,
      conversationHistorySummary,
      detectedLang
    );

    // 5. Retrieve candidate documents from the Vector Database
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

    // 6. Build structured citations
    const citations = CitationBuilder.buildCitations(retrievedDocs);

    // 7. Formulate system and context prompts
    const systemPrompt = PromptBuilder.buildPersonalizedSystemPrompt(preferences, detectedLang);
    const contextText = PromptBuilder.formatContextDocuments(retrievedDocs, detectedLang);

    const promptMessage = `USER QUESTION:
${request.message}

VERIFIED NAHJ AL-BALAGHA CONTEXT:
${contextText}

INSTRUCTIONS:
Provide an inspiring, accurate, and faithful response. If context is insufficient, explicitly state so.
Always conclude your response with the formal Book Reference block as instructed in your system prompt.
At the end of your response, on a new line, add:
FOLLOW_UPS: <Question 1> | <Question 2> | <Question 3>
TOPICS: <topic1>, <topic2>`;

    // 8. Invoke LLM with resilient fallback
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
      console.warn('RAG LLM invocation fallback:', (llmErr as any)?.message);
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

    // 9. Guarantee that every answer includes the formal Book Reference block
    if (citations.length > 0 && !cleanAnswer.includes('Book Reference')) {
      const topCitation = citations[0];
      const topDoc = retrievedDocs[0];
      const arabicSnippet = topCitation.arabicText
        ? `«${topCitation.arabicText.substring(0, 120)}...»`
        : 'Available in original Arabic compilation';

      const translationSnippet =
        detectedLang === 'urdu' && topDoc?.metadata?.urduTranslation
          ? topDoc.metadata.urduTranslation.substring(0, 160) + '...'
          : topCitation.text.substring(0, 160) + '...';

      const referenceBlock = `\n\n---\n### 📖 Book Reference & Canonical Source:
- **Book:** Nahj al-Balagha (*Peak of Eloquence*) — Compiled by al-Sharif al-Radi (d. 406 AH)
- **Source Category & Number:** ${topCitation.passageType.toUpperCase()} #${topCitation.passageNumber}
- **Passage Title:** "${topDoc?.metadata?.passageTitle || `${topCitation.passageType} #${topCitation.passageNumber}`}"
- **Original Arabic Reference:** ${arabicSnippet}
- **Translation (${detectedLang === 'urdu' ? 'Urdu' : 'English'}):** "${translationSnippet}"
- **Compiler / Translator Reference:** ${
        detectedLang === 'urdu'
          ? 'علامہ ذیشان حیدر جوادی / مفتی جعفر حسین'
          : topCitation.translator || 'Syed Ali Reza / al-Sharif al-Radi'
      }`;
      cleanAnswer += referenceBlock;
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

    // 10. Asynchronously record reading history for personalization tracking
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
