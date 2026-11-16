import { getDefaultLLM } from '../../config/llm';
import { userPreferencesRepository } from '../../db/repositories/user-preferences.repository';
import { readingHistoryRepository } from '../../db/repositories/reading-history.repository';
import { queryRewriter } from '../query/query-rewriter';
import { knowledgeRetriever } from '../retrieval/retriever';
import { HybridSearchEngine } from '../retrieval/hybrid-search';
import { CitationBuilder } from '../postprocessing/citation-builder';
import { PromptBuilder } from './prompt-builder';
import { LanguageDetector } from '../../ingestion/processors/language-detector';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { RAGResponse, ChatRequest } from '../../types/conversation.types';
import { UserPreferences, UserPreferencesSchema } from '../../types/user.types';
import { RetrievedDocument } from '../../types/passage.types';

function isOutOfDomainQuery(query: string): boolean {
  const lower = query.toLowerCase();

  // Sacred/domain terms that should never be blocked (English & Urdu)
  const inDomainKeywords = [
    'ali', 'imam', 'nahj', 'balagha', 'balaghah', 'sermon', 'khutbah', 'khutba',
    'letter', 'maktoob', 'saying', 'hikmah', 'wisdom', 'justice', 'malik', 'ashtar',
    'kumayl', 'hasan', 'hussain', 'islam', 'allah', 'prophet', 'governance', 'caliph',
    'sabr', 'patience', 'taqwa', 'piety', 'aqil', 'muttaqeen', 'dua', 'prayer', 'ziyad',
    'muhammad', 'quran', 'hadith', 'nahjul', 'balagah', 'ahlulbayt', 'shia', 'sunni',
    'ghadir', 'kufa', 'siffin', 'jamal', 'nehj', 'nehjul', 'image', 'picture', 'photo',
    'علي', 'امام', 'امیر المومنین', 'نہج', 'بلاغہ', 'خطبہ', 'مکتوب', 'خط', 'حکمت',
    'قول', 'اقوال', 'دعا', 'مناجات', 'تصویر', 'عکس', 'کتاب', 'وصیت', 'حسن', 'حسین',
    'تقویٰ', 'تقوی', 'عدل', 'صبر', 'مالک', 'اشتر', 'کوفہ', 'صفین', 'جمل'
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

function cleanPassageText(text: string, maxLength: number = 400): string {
  if (!text) return '';
  const cleaned = text
    .replace(/Please visit[\s\S]*/i, '')
    .replace(/www\.[^\s]+/g, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
}

function getDiscourseSummary(doc: RetrievedDocument, lang: 'english' | 'urdu'): string {
  const pType = doc.metadata.passageType;
  const pNum = doc.metadata.passageNumber;

  // Specific canonical high-profile discourses
  if (pType === 'letter' && pNum === 31) {
    return lang === 'urdu'
      ? `نہج البلاغہ کا **مکتوب نمبر ۳۱** (*امام حسن مجتبیٰ علیہ السلام کے نام وصیت و اخلاقی منشور*) اخلاق، تربیت اور روحانی بصیرت کا عظیم ترین شاہکار ہے۔ امیر المومنین علیہ السلام نے جنگ صفین سے واپسی پر مقام حاضرین میں یہ وصیت نامہ تحریر فرمایا۔\n\nاس کلام میں آپ نے تقویٰ الٰہی، دنیا کی بے ثباتی، خود احتسابی، نیک اخلاق کی ترویج، حقوق العباد کی پاسداری، اور آخرت کے لیے زادِ راہ جمع کرنے کی جامع اور اثر انگیز ہدایات عطا فرمائی ہیں۔`
      : `**Letter 31** (*A Father's Advice and Moral Testament to Imam al-Hasan*) is one of the most celebrated ethical and spiritual discourses in Nahj al-Balagha. Written at al-Hadirayn upon returning from the Battle of Siffin, Imam Ali (a.s.) imparts comprehensive guidance to his son on cultivating noble character, constant awareness of Allah (Taqwa), the transience and deceptions of worldly attachments, preparation for the Hereafter, and enduring hardship with steadfast patience.`;
  }

  if (pType === 'letter' && pNum === 53) {
    return lang === 'urdu'
      ? `نہج البلاغہ کا **مکتوب نمبر ۵۳** (*مالک اشتر کے نام تاریخی عہد نامہ*) عدل و انصاف، مثالی حکمرانی، عوامی حقوق، اور رعایا بالخصوص کمزور طبقات کی نگہداشت کا تاریخی اور جامع ترین دستور ہے۔`
      : `**Letter 53** (*Imam Ali's Covenant to Malik al-Ashtar*) is the preeminent Islamic treatise on justice, public administration, judicial impartiality, taxation with equity, and safeguarding the rights of the poor and oppressed.`;
  }

  if (pType === 'sermon' && pNum === 3) {
    return lang === 'urdu'
      ? `نہج البلاغہ کا **خطبہ نمبر ۳** (*خطبہ شقشقیہ*) تاریخ اسلام کے اہم ترین خطبات میں سے ہے، جس میں امیر المومنین علیہ السلام نے خلافت کے ابتدائی مراحل، اپنے تاریخی صبر، اور بالآخر عوامی اصرار پر منصبِ خلافت قبول کرنے کے حالات بیان فرمائے ہیں۔`
      : `**Sermon 3** (*Khutbah ash-Shiqshiqiyyah*) is one of the most renowned historical discourses in Nahj al-Balagha, articulating Imam Ali's (a.s.) reflections on the early caliphate, his steadfast patience, and his assumption of governance upon popular demand.`;
  }

  if (pType === 'sermon' && pNum === 193) {
    return lang === 'urdu'
      ? `نہج البلاغہ کا **خطبہ ۱۹۳** (*خطبہ متقین / خطبہ ہمام*) متقین اور پرہیزگاروں کے اوصاف میں عدیم المثال خطبہ ہے، جس میں امیر المومنین علیہ السلام نے اپنے صحابی ہمام کی درخواست پر اہل تقویٰ کے شب و روز، عبادات اور اخلاقی کمالات کو بیان فرمایا ہے۔`
      : `**Sermon 193** (*Khutbah al-Muttaqeen / Hammam*) is the famous sermon delineating the profound spiritual, moral, and social virtues of the truly pious (Muttaqeen) delivered at the request of his companion Hammam.`;
  }

  if (pType === 'letter' && pNum === 8) {
    return lang === 'urdu'
      ? `نہج البلاغہ کا **مکتوب نمبر ۸** امیر المومنین علیہ السلام کا اپنے قاصد **جرير بن عبد الله البجلی** کے نام وہ دو ٹوک اور حتمی مکتوب ہے جب آپ نے انہیں شام میں معاویہ کے پاس بیعت کا پیغام دے کر بھیجا تھا۔\n\nاس مکتوب میں آپ نے جریر کو حکم دیا کہ معاویہ سے فوری اور قطعی جواب طلب کریں اور اسے دو ٹوک فیصلہ کرنے پر مجبور کریں: یا بیعت کر کے اطاعت قبول کرے یا پھر جنگ کے لیے تیار ہو جائے۔`
      : `**Letter 8** is Imam Ali's (a.s.) decisive mandate to his envoy **Jarir ibn Abdillah al-Bajali** while in Damascus awaiting Mu'awiyah's response to the Caliphate.\n\nIn this letter, Imam Ali (a.s.) instructs Jarir to deliver an unequivocal ultimatum to Mu'awiyah: compel him to make an immediate, definitive choice between peaceful submission through sworn allegiance to the legitimate Caliphate, or facing total war.`;
  }

  // Dynamic summary for all other discourses
  const title = doc.metadata.passageTitle || `${pType} #${pNum}`;
  const topics = doc.metadata.topics?.length ? doc.metadata.topics.join(', ') : 'wisdom, ethics, and virtue';
  const excerpt = cleanPassageText(doc.content, 260);

  if (lang === 'urdu') {
    const urduCat = pType === 'sermon' ? 'خطبہ' : pType === 'letter' ? 'مکتوب' : pType === 'saying' ? 'حکمت' : 'دعا';
    const urduExcerpt = cleanPassageText(doc.metadata.urduTranslation || doc.content, 260);
    return `نہج البلاغہ کے **${urduCat} #${pNum}** (*«${title}»*) میں امیر المومنین علیہ السلام نے اسلامی تعلیمات اور حکمت کے بنیادی اصول بیان فرمائے ہیں۔\n\nاس کلام کا کلیدی پیغام:\n> *«${urduExcerpt}»*`;
  }

  return `In **${pType.toUpperCase()} #${pNum}** (*"${title}"*), Imam Ali (a.s.) imparts timeless guidance focusing on **${topics}**.\n\nCore passage teaching:\n> *"${excerpt}"*`;
}

function detectUserIntent(query: string): 'name_only' | 'summary' | 'full_text' | 'general' {
  const q = query.toLowerCase().trim();

  // Full text / Content requests
  if (
    /\b(full|complete|entire|unabridged|whole text|read full|content|text of|what was the content|show me the content|what is the content|what was written|read the letter|read the sermon)\b/i.test(q) ||
    /مکمل|پورا|تمام متن|متن|کیا لکھا ہے/i.test(q)
  ) {
    return 'full_text';
  }

  // Name / title only requests
  if (
    /\b(name of|what is the name|tell me only name|only name|just name|only the name|just the title|give me the name|name the|which sermon is|which letter is|what is it called)\b/i.test(q) ||
    /^name\b/i.test(q) ||
    /نام کیا ہے|صرف نام|نام بتائیں|کونسا خطبہ|خطبے کا نام/i.test(q)
  ) {
    return 'name_only';
  }

  // Summary / overview requests
  if (
    /\b(tell me about|what is|what was|overview of|summarize|summary of|explain|meaning of)\b/i.test(q) ||
    /کے بارے میں بتائیں|خلاصہ|کیا ہے|وضاحت فرمائیں/i.test(q)
  ) {
    return 'summary';
  }

  return 'general';
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

    // 1. Detect query language first with preference support
    const userPrefLanguage =
      request.overrides?.language === 'urdu' || request.overrides?.language === 'english'
        ? request.overrides.language
        : undefined;
    const detectedLang = LanguageDetector.detect(request.message, userPrefLanguage);

    // 2. Strict Domain Guardrail Check (bypassed if user is asking about an uploaded image)
    if (!request.image && isOutOfDomainQuery(request.message)) {
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

    // 5. Retrieve candidate documents using Hybrid Search (Dense Vector + BM25 Lexical + Entity Resolution)
    const explicitPassage =
      request.passageRef ||
      HybridSearchEngine.resolveContextualPassage(request.message, conversationHistorySummary) ||
      (searchReadyQuery ? HybridSearchEngine.extractExplicitPassage(searchReadyQuery) : null);

    const retrievalFilters = explicitPassage
      ? {
          passageType: (explicitPassage as any).type || (explicitPassage as any).passageType,
          passageNumber: (explicitPassage as any).number !== undefined ? (explicitPassage as any).number : (explicitPassage as any).passageNumber,
        }
      : undefined;

    const retrievedDocs = await knowledgeRetriever.retrieve(
      request.message,
      6,
      retrievalFilters,
      searchReadyQuery
    );

    // 6. Build structured citations
    const citations = CitationBuilder.buildCitations(retrievedDocs);

    // 7. Detect precise user intent to format context and prompt
    const userIntent = detectUserIntent(request.message);

    // 8. Formulate system and context prompts (truncate bulky context unless full text is requested)
    const systemPrompt = PromptBuilder.buildPersonalizedSystemPrompt(preferences, detectedLang);
    const contextText = PromptBuilder.formatContextDocuments(
      retrievedDocs,
      detectedLang,
      userIntent === 'full_text'
    );

    const languageInstruction =
      detectedLang === 'urdu'
        ? `🔴 لازمی ہدایت برائے زبان (URDU MANDATE):
صارف کا سوال اردو میں ہے۔ آپ کا مکمل جواب (تفصیل، تشریح، اخلاقی رہنمائی، اور تمام حوالہ جات) صرف اور صرف باوقار اور شائستہ اردو زبان (اردو رسم الخط) میں ہونا چاہیے۔ انگریزی میں ہرگز جواب نہ دیں۔`
        : `🔴 MANDATORY LANGUAGE INSTRUCTION (ENGLISH MANDATE):
The user's query is in English. Your entire response (explanation, analysis, and references) must be in clear, dignified English.`;

    const promptMessage = `USER QUESTION:
${request.message}

DETECTED INTENT: ${userIntent.toUpperCase()}

VERIFIED NAHJ AL-BALAGHA CONTEXT:
${contextText}

${languageInstruction}

INSTRUCTIONS ACCORDING TO INTENT:
${
  userIntent === 'name_only'
    ? `- THE USER ASKS ONLY FOR THE NAME / NUMBER.
- Answer in 1 to 2 direct, concise sentences directly naming the sermon/letter and its number (e.g., "The most famous sermon in Nahj al-Balagha is **Sermon 3**, known as **Khutbah ash-Shiqshiqiyyah (خطبہ شقشقیہ)**.").
- DO NOT dump the full text, raw paragraphs, or multi-page essays!
- Promptly offer follow-up options: "Would you like an overview of its historical context, a summary of its key themes, or the full Arabic and English/Urdu translation?"`
    : userIntent === 'summary'
    ? `- THE USER ASKS FOR AN OVERVIEW / SUMMARY.
- DO NOT dump the full text! Provide an articulate 2-3 paragraph summary of why it is famous, its historical context, and core themes, quoting only 1-2 lines.`
    : userIntent === 'full_text'
    ? `- The user requested full text. Present the complete unabridged discourse.`
    : `- Answer the specific question directly, citing pertinent excerpts without raw full-text dumps.`
}

Always conclude with a clean, concise Book Reference.
At the end of your response, on a new line, add:
FOLLOW_UPS: <Question 1> | <Question 2> | <Question 3>
TOPICS: <topic1>, <topic2>`;

    // 9. Invoke LLM with multimodal vision capability and resilient fallback
    let cleanAnswer = '';
    let suggestedFollowUps: string[] = [];
    let relatedTopics: string[] = [];

    try {
      const llm = getDefaultLLM();

      let humanMessage: HumanMessage;
      if (request.image) {
        humanMessage = new HumanMessage({
          content: [
            {
              type: 'text',
              text: `${promptMessage}\n\n[USER HAS ATTACHED AN IMAGE]:
The user has uploaded an image (such as an Arabic manuscript, calligraphy, book page, or excerpt).
1. Inspect the image carefully: identify any Arabic calligraphy, Quranic/Nahj al-Balagha script, or manuscript text.
2. Transcribe and explain the text visible in the image.
3. Detail how it relates to Nahj al-Balagha and the teachings of Imam Ali (a.s.).
4. Respond strictly in the designated language: ${detectedLang === 'urdu' ? 'URDU (اردو)' : 'ENGLISH'}.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: request.image,
              },
            },
          ],
        });
      } else {
        humanMessage = new HumanMessage(promptMessage);
      }

      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        humanMessage,
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
      // Offline/Local synthesis based on authentic retrieved passages with strict intent awareness
      if (retrievedDocs.length > 0) {
        const topDoc = retrievedDocs[0];
        const urduCat =
          topDoc.metadata.passageType === 'sermon' ? 'خطبہ' :
          topDoc.metadata.passageType === 'letter' ? 'مکتوب' :
          topDoc.metadata.passageType === 'saying' ? 'حکمت' : 'دعا';

        if (userIntent === 'name_only') {
          if (detectedLang === 'urdu') {
            cleanAnswer = `نہج البلاغہ میں آپ کا مطلوبہ کلام **${urduCat} #${topDoc.metadata.passageNumber}** ہے، جس کا عنوان **«${topDoc.metadata.passageTitle || ''}»** ہے۔\n\nکیا آپ اس کا خلاصہ، تاریخی پس منظر یا مکمل عربی متن اور اردو ترجمہ ملاحظہ فرمانا چاہتے ہیں؟`;
          } else {
            cleanAnswer = `The discourse you inquired about in Nahj al-Balagha is **${topDoc.metadata.passageType.toUpperCase()} #${topDoc.metadata.passageNumber}**: **${topDoc.metadata.passageTitle || ''}**.\n\n*Would you like an overview of its historical context, a summary of its key themes, or the complete Arabic text and translation?*`;
          }
        } else if (userIntent === 'summary') {
          const discourseOverview = getDiscourseSummary(topDoc, detectedLang);
          const arabicSnippet = topDoc.metadata.arabicOriginal
            ? `\n\n> **«${cleanPassageText(topDoc.metadata.arabicOriginal, 220)}»**`
            : '';

          if (detectedLang === 'urdu') {
            cleanAnswer = `${discourseOverview}${arabicSnippet}\n\nکیا آپ اس کلام کا تفصیلی تجزیہ یا مکمل عربی و اردو متن پڑھنا چاہتے ہیں؟`;
          } else {
            cleanAnswer = `${discourseOverview}${arabicSnippet}\n\n*Would you like to explore its core themes, historical setting, or read the full text with Arabic and English translation?*`;
          }
        } else if (userIntent === 'full_text') {
          const arabicText = topDoc.metadata.arabicOriginal ? cleanPassageText(topDoc.metadata.arabicOriginal, 3000) : '';
          const englishText = cleanPassageText(topDoc.content, 3000);
          const urduText = topDoc.metadata.urduTranslation ? cleanPassageText(topDoc.metadata.urduTranslation, 3000) : '';

          if (detectedLang === 'urdu') {
            cleanAnswer = `### نہج البلاغہ — ${urduCat} نمبر ${topDoc.metadata.passageNumber} کا متن:
*«${topDoc.metadata.passageTitle}»*

${arabicText ? `> **«${arabicText}»**\n\n` : ''}**اردو ترجمہ:**
«${urduText || englishText}»`;
          } else {
            cleanAnswer = `### Nahj al-Balagha — Content of ${topDoc.metadata.passageType.toUpperCase()} #${topDoc.metadata.passageNumber}:
*${topDoc.metadata.passageTitle}*

${arabicText ? `> **«${arabicText}»**\n\n` : ''}**Translation (English):**
"${englishText}"

${urduText ? `\n**Urdu Translation:**\n«${urduText}»` : ''}`;
          }
        } else {
          // General question
          const discourseOverview = getDiscourseSummary(topDoc, detectedLang);
          cleanAnswer = discourseOverview;
        }
      } else {
        cleanAnswer =
          detectedLang === 'urdu'
            ? `میں نے نہج البلاغہ کے تمام مستند ذخیرے میں تلاش کی ہے۔ کلامِ امیر المومنین کی تقدس اور درستی کو برقرار رکھنے کے لیے، یہ واضح کرنا ضروری ہے کہ موجودہ نالج بیس میں اس مخصوص سوال کا براہ راست متن دستیاب نہیں ہے۔`
            : `I have consulted the corpus of Nahj al-Balagha. To preserve strict religious integrity and avoid fabrication, I acknowledge that the specific reference directly answering this is not in the active knowledge base.`;
      }
    }

    // 10. Guarantee that every answer includes the formal Book Reference block
    if (citations.length > 0 && !cleanAnswer.includes('Book Reference') && !cleanAnswer.includes('کتابی حوالہ') && !cleanAnswer.includes('ماخذ:')) {
      const topCitation = citations[0];
      const topDoc = retrievedDocs[0];

      if (userIntent === 'name_only') {
        const urduCat =
          topCitation.passageType === 'sermon' ? 'خطبہ' :
          topCitation.passageType === 'letter' ? 'مکتوب' :
          topCitation.passageType === 'saying' ? 'حکمت' : 'دعا';

        cleanAnswer += detectedLang === 'urdu'
          ? `\n\n---\n**ماخذ:** نہج البلاغہ، ${urduCat} #${topCitation.passageNumber} («${topDoc?.metadata?.passageTitle || ''}»)`
          : `\n\n---\n**Source:** Nahj al-Balagha, ${topCitation.passageType.toUpperCase()} #${topCitation.passageNumber} (*"${topDoc?.metadata?.passageTitle}"*)`;
      } else {
        const arabicSnippet = topCitation.arabicText
          ? `«${topCitation.arabicText.substring(0, 120)}...»`
          : 'اصل عربی متن محفوظ ہے';

        const translationSnippet =
          detectedLang === 'urdu' && topDoc?.metadata?.urduTranslation
            ? topDoc.metadata.urduTranslation.substring(0, 160) + '...'
            : topCitation.text.substring(0, 160) + '...';

        let referenceBlock: string;
        if (detectedLang === 'urdu') {
          const urduCat =
            topCitation.passageType === 'sermon' ? 'خطبہ' :
            topCitation.passageType === 'letter' ? 'مکتوب' :
            topCitation.passageType === 'saying' ? 'حکمت / قول' : 'دعا';

          referenceBlock = `\n\n---\n### 📖 کتابی حوالہ و مستند ماخذ:
- **کتاب:** نہج البلاغہ (*کلام امیر المومنین*) — جمع و تدوین: علامہ شریف رضی (وفات 406ھ)
- **ماخذ و نمبر:** ${urduCat} #${topCitation.passageNumber}
- **عنوان:** "${topDoc?.metadata?.passageTitle || `${urduCat} #${topCitation.passageNumber}`}"
- **اصل عربی متن:** ${arabicSnippet}
- **اردو ترجمہ:** "${translationSnippet}"
- **مستند مترجم:** علامہ ذیشان حیدر جوادی / مفتی جعفر حسین`;
        } else {
          referenceBlock = `\n\n---\n### 📖 Book Reference & Canonical Source:
- **Book:** Nahj al-Balagha (*Peak of Eloquence*) — Compiled by al-Sharif al-Radi (d. 406 AH)
- **Source Category & Number:** ${topCitation.passageType.toUpperCase()} #${topCitation.passageNumber}
- **Passage Title:** "${topDoc?.metadata?.passageTitle || `${topCitation.passageType} #${topCitation.passageNumber}`}"
- **Original Arabic Reference:** ${arabicSnippet}
- **Translation (English):** "${translationSnippet}"
- **Compiler / Translator Reference:** ${topCitation.translator || 'Syed Ali Reza / al-Sharif al-Radi'}`;
        }

        cleanAnswer += referenceBlock;
      }
    }

    // Fallbacks if LLM omitted them
    if (suggestedFollowUps.length === 0) {
      suggestedFollowUps =
        detectedLang === 'urdu'
          ? [
              'خط نمبر 53 میں عدل و انصاف کے بارے میں امام علی علیہ السلام کی کیا ہدایات ہیں؟',
              'اس کلام کے پس پردہ کیا گہرے روحانی و اخلاقی معانی ہیں؟',
              'نہج البلاغہ میں اسی موضوع سے متعلق دیگر کونسے خطبات یا اقوال ہیں؟',
            ]
          : [
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
