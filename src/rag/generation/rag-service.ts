import { getDefaultLLM, createLLM } from '../../config/llm';
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
import { RetrievedDocument, PassageType, Citation } from '../../types/passage.types';

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

function checkGreetingOrCourtesy(query: string): { type: 'greeting' | 'gratitude' | null } {
  if (!query) return { type: null };
  const trimmed = query.trim();
  if (trimmed.length === 0) return { type: null };

  const clean = trimmed
    .toLowerCase()
    .replace(/[-\u2010-\u2015]/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=_`~()؟?!\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Pattern for pure greeting + optional pleasantries like "bro", "bhai", "dear", "how are you"
  const pureGreetingRegex = /^(as\s+salamu|as\s+salam|asslamu|assalamu|as-salamu|assalam|aslam|salam|salaam|slam|slm|saalam)\s*(o\s*|u\s*)?(alaikum|alaykum|alikum|alekum|alykum)?(\s+(bro|brother|bhai|sir|dear|janab|sahab|ji))?(\s+(how are you|kaise ho|kya haal hai|kese ho))?$/i;

  const englishGreetingRegex = /^(hello|hi|hey|hey\s+there|good\s*(morning|afternoon|evening|day))(\s+(bro|brother|bhai|sir|dear))?(\s+(how are you))?$/i;

  const urduGreetingRegex = /^(السلام\s*علیکم|سلام\s*علیکم|وعلیکم\s*السلام|سلام|آداب)(\s*(ورحمۃ\s*اللہ(\s*وبرکاتہ)?)?)?(\s*(بھائی|جناب|محترم|صاحب|دوست))?(\s*(کیسے\s*ہیں|کیا\s*حال\s*ہے))?$/;

  if (
    pureGreetingRegex.test(clean) ||
    englishGreetingRegex.test(clean) ||
    urduGreetingRegex.test(clean)
  ) {
    return { type: 'greeting' };
  }

  // Pure gratitude regex
  const gratitudeRegex = /^(thank\s*you|thanks|thank\s*u|jazakallah|jazak\s*allah|jazakallahu\s*khair|jazakallah\s*khair|shukriya)(\s+(so\s*much|a\s*lot|brother|bro|bhai|janab|sahab))?$/i;
  const urduGratitudeRegex = /^(شکریہ|بہت\s*شکریہ|جزاک\s*اللہ(\s*خیرا)?|نوازش|مہربانی)(\s*(بھائی|جناب|صاحب))?$/;

  if (gratitudeRegex.test(clean) || urduGratitudeRegex.test(clean)) {
    return { type: 'gratitude' };
  }

  return { type: null };
}

function checkCorpusMetaQuestion(
  query: string
): 'letters_count' | 'sermons_count' | 'sayings_count' | 'corpus_breakdown' | 'compiler_info' | null {
  const q = query.toLowerCase().trim();

  // Letters count (English & Urdu)
  if (
    /how many (letters|letter|maktub|maktoob|maktubat)\b/i.test(q) ||
    /number of (letters|letter|maktub|maktoob|maktubat)\b/i.test(q) ||
    /total (letters|letter|maktub|maktoob|maktubat)\b/i.test(q) ||
    /(کتنے|کتنا)\s*(مکتوب|مکتوبات|خطوط|خط)/.test(q)
  ) {
    return 'letters_count';
  }

  // Sermons count (English & Urdu)
  if (
    /how many (sermons|sermon|khutba|khutbah|khutbat)\b/i.test(q) ||
    /number of (sermons|sermon|khutba|khutbah|khutbat)\b/i.test(q) ||
    /total (sermons|sermon|khutba|khutbah|khutbat)\b/i.test(q) ||
    /(کتنے|کتنا)\s*(خطبے|خطبات|خطبہ)/.test(q)
  ) {
    return 'sermons_count';
  }

  // Sayings count (English & Urdu)
  if (
    /how many (sayings|saying|hikam|hikmah|aphorisms|quotes|maxims)\b/i.test(q) ||
    /number of (sayings|saying|hikam|hikmah|aphorisms|quotes|maxims)\b/i.test(q) ||
    /total (sayings|saying|hikam|hikmah|aphorisms|quotes|maxims)\b/i.test(q) ||
    /(کتنی|کتنے)\s*(حکمتیں|حکمت|اقوال|قول)/.test(q)
  ) {
    return 'sayings_count';
  }

  // Total corpus breakdown
  if (
    /how many (discourses|parts|sections|passages|total)\b/i.test(q) ||
    /total (discourses|parts|sections|passages|chapters|contents)\b/i.test(q) ||
    /نہج البلاغہ میں کل (کتنے|کتنی)/.test(q) ||
    /کتنے ابواب/.test(q)
  ) {
    return 'corpus_breakdown';
  }

  // Compiler / Author
  if (
    /who (compiled|wrote|authored|assembled|collected) nahj/i.test(q) ||
    /compiler of nahj/i.test(q) ||
    /نہج البلاغہ کس نے (مرتب|لکھی|جمع)/.test(q)
  ) {
    return 'compiler_info';
  }

  return null;
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

    // 2. Greeting & Courtesy Handling (Immediate graceful reply without searching or dumping sermons)
    if (!request.image) {
      const greetingCheck = checkGreetingOrCourtesy(request.message);
      if (greetingCheck.type === 'greeting') {
        const isUrdu = detectedLang === 'urdu' || /[\u0600-\u06FF]/.test(request.message);
        const greetingResponse = isUrdu
          ? `وعلیکم السلام و رحمۃ اللہ و برکاتہ!

خوش آمدید! میں نہج البلاغہ اور امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے فرمودات، خطبات، مکتوبات اور حکمتوں پر مبنی آپ کا رفیق ہوں۔

آپ مجھ سے نہج البلاغہ کے کسی بھی خطبے (جیسے خطبہ شقشقیہ یا خطبہ متقین)، مکتوب (جیسے خط نمبر 53 بنام مالک اشتر یا خط نمبر 31 بنام امام حسنؑ)، یا اخلاقی و روحانی حکمتوں اور دعاؤں کے متعلق استفسار فرما سکتے ہیں۔

آج آپ کس کلامِ مبارک یا موضوع پر رہنمائی حاصل کرنا چاہتے ہیں؟`
          : `Wa Alaikum Assalam wa Rahmatullah wa Barakatuh (وعلیکم السلام و رحمۃ اللہ و برکاتہ).

Welcome! Peace and blessings be upon you. I am your dedicated knowledge companion for Nahj al-Balagha and the eternal teachings and wisdom of Ameer al-Momineen Imam Ali ibn Abi Talib (a.s.).

You may ask me about any canonical discourse in Nahj al-Balagha—such as his celebrated letters on governance and justice (e.g. Letter 53 to Malik al-Ashtar, Letter 31 to Imam al-Hasan), profound sermons on theology and virtue (e.g. Sermon 3 or Sermon 193), or his maxims on human character and ethics.

How may I assist your contemplation or study today?`;

        return {
          answer: greetingResponse,
          citations: [],
          relatedTopics: [
            'Letter 53 (Governance)',
            'Sermon 3 (ash-Shiqshiqiyyah)',
            'Saying 147 (Knowledge)',
            'Letter 31 (Moral Advice)',
          ],
          suggestedFollowUps: isUrdu
            ? [
                'مالک اشتر کے نام خط نمبر 53 کے بنیادی اصول کیا ہیں؟',
                'خطبہ نمبر 3 (خطبہ شقشقیہ) کا تاریخی پس منظر کیا ہے؟',
                'حکمت نمبر 147 میں علم اور مال کا موازنہ کیسے فرمایا گیا ہے؟',
                'امام حسن علیہ السلام کے نام خط نمبر 31 کا خلاصہ فرمائیں',
              ]
            : [
                'Explain the core advice in Letter 53 to Malik al-Ashtar',
                'What is the historical context of Sermon 3 (Khutbah ash-Shiqshiqiyyah)?',
                'What does Imam Ali say about knowledge in Saying 147?',
                'Summarize Letter 31: Advice and Moral Testament to Imam al-Hasan',
              ],
          confidenceLevel: 'high',
          disclaimer: null,
        };
      }

      if (greetingCheck.type === 'gratitude') {
        const isUrdu = detectedLang === 'urdu' || /[\u0600-\u06FF]/.test(request.message);
        const gratitudeResponse = isUrdu
          ? `آپ کا بہت شکریہ اور جزاکم اللہ خیراً و أحسن الجزاء!

امیر المومنین حضرت علی علیہ السلام کے فرمودات اور نہج البلاغہ کی لازوال حکمتوں سے استفادہ کرنا ہم سب کے لیے خیر و برکت اور روحانی بصیرت کا ذریعہ ہے۔ اگر آپ کا کوئی اور سوال ہو یا کسی خطبے، مکتوب یا حکمت کی مزید وضاحت درکار ہو، تو میں حاضر ہوں۔`
          : `You are most welcome, and may Allah bless you with continuous wisdom and virtue (Jazakum Allahu Khayran).

Reflecting upon the profound eloquence and teachings of Ameer al-Momineen Imam Ali (a.s.) in Nahj al-Balagha is a rewarding spiritual journey. Please let me know whenever you would like to explore any other sermon, letter, or saying!`;

        return {
          answer: gratitudeResponse,
          citations: [],
          relatedTopics: [
            'Letter 53 on Governance',
            'Saying 81 on Human Worth',
            'Sermon 193 (Pious Virtues)',
            'Supplications of Imam Ali',
          ],
          suggestedFollowUps: isUrdu
            ? [
                'نہج البلاغہ کا سب سے مشہور خطبہ کون سا ہے؟',
                'خط نمبر 53 کے اہم نکات کیا ہیں؟',
                'حکمت نمبر 81 کی وضاحت فرمائیں',
              ]
            : [
                'What is the most famous sermon in Nahj al-Balagha?',
                'Explain Letter 53 on governance and justice',
                'What does Imam Ali say about patience and character?',
              ],
          confidenceLevel: 'high',
          disclaimer: null,
        };
      }
    }

    // 2.5. Corpus Structure & Statistical Questions (Immediate canonical accuracy)
    if (!request.image) {
      const metaType = checkCorpusMetaQuestion(request.message);
      if (metaType) {
        const isUrdu = detectedLang === 'urdu' || /[\u0600-\u06FF]/.test(request.message);
        let metaAnswer = '';

        if (metaType === 'letters_count') {
          metaAnswer = isUrdu
            ? `شریف الرضی رحمۃ اللہ علیہ کی مرتب کردہ نہج البلاغہ میں امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے کل **۷۹ مکتوبات (خطوط و فرامین)** شامل ہیں۔

ان مکتوبات میں مختلف گورنروں، عمال، اور امرا کے نام تاریخی فرامین، جنگی ہدایات، عدل و انصاف کے احکامات، اور اخلاقی وصایا شامل ہیں۔ ان میں **خط نمبر ۵۳** (مالک اشتر کے نام تاریخی عہد نامہ) اور **خط نمبر ۳۱** (امام حسن مجتبیٰ علیہ السلام کے نام وصیت نامہ) سب سے زیادہ شہرت کے حامل ہیں۔

### 📖 نہج البلاغہ کی کلامی تقسیم (کل ۷۹۹ فرمودات):
- **۲۴۱ خطبات** (خطبہ ۱ تا ۲۴۱)
- **۷۹ مکتوبات** (مکتوب ۱ تا ۷۹)
- **۴۸۹ حکمتیں و اقوال** (حکمت ۱ تا ۴۸۹)

کیا آپ کسی مخصوص مکتوب (جیسے خط نمبر ۵۳ یا خط نمبر ۳۱) کا خلاصہ یا متن ملاحظہ فرمانا چاہتے ہیں؟`
            : `In Nahj al-Balagha (*Peak of Eloquence*), compiled by al-Sharif al-Radi (d. 406 AH), there are canonically **79 Letters (Maktubat)** written by Ameer al-Momineen Imam Ali ibn Abi Talib (a.s.).

These letters comprise official decrees, covenants of governance (such as the renowned Letter 53 to Malik al-Ashtar), moral testaments (such as Letter 31 to his son Imam al-Hasan), diplomatic correspondence (e.g. to Mu'awiyah), and instructions to tax collectors and governors across the Islamic realm.

### 📖 Structure of Nahj al-Balagha (799 Total Discourses):
- **241 Sermons (Khutbat)** — Sermons 1 to 241
- **79 Letters (Maktubat)** — Letters 1 to 79
- **489 Sayings (Hikam)** — Sayings 1 to 489

*Would you like an overview or analysis of a specific letter, such as Letter 53 on governance or Letter 31 on ethical character?*`;
        } else if (metaType === 'sermons_count') {
          metaAnswer = isUrdu
            ? `نہج البلاغہ میں امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے کل **۲۴۱ خطبات** شامل ہیں۔

ان خطبات میں توحید و معرفتِ الٰہی، کائنات کی خلقت، متقین کے اوصاف (جیسے خطبہ ۱۹۳ / خطبہ ہمام)، اور تاریخی حقائق (جیسے خطبہ ۳ / خطبہ شقشقیہ) پر مشتمل عدیم المثال کلام موجود ہے۔

### 📖 نہج البلاغہ کے کل ابواب (۷۹۹ فرمودات):
- **۲۴۱ خطبات**
- **۷۹ مکتوبات**
- **۴۸۹ حکمتیں**

کیا آپ کسی مشہور خطبے (جیسے خطبہ ۳ یا خطبہ ۱۹۳) کا جائزہ لینا چاہتے ہیں؟`
            : `In Nahj al-Balagha, there are canonically **241 Sermons (Khutbat)** delivered by Ameer al-Momineen Imam Ali ibn Abi Talib (a.s.).

These include sublime discourses on divine theology (Tawhid), the creation of the heavens and earth, virtues of the pious (such as Sermon 193 / Khutbah al-Muttaqeen), historical reflections (such as Sermon 3 / Khutbah ash-Shiqshiqiyyah), and moral guidance.

### 📖 Complete Canonical Structure (799 Total Discourses):
- **241 Sermons (Khutbat)**
- **79 Letters (Maktubat)**
- **489 Sayings (Hikam)**

*Would you like to explore a famous sermon, such as Sermon 3 (ash-Shiqshiqiyyah) or Sermon 193 (on the pious)?*`;
        } else if (metaType === 'sayings_count') {
          metaAnswer = isUrdu
            ? `نہج البلاغہ میں امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کی کل **۴۸۹ حکمتیں (قصار الحکم و مختصر اقوال)** شامل ہیں۔

یہ کلماتِ حکمت عقل، علم، صبر، خودداری، دوستی اور اخلاقی تربیت کے بے مثال موتی ہیں۔

### 📖 نہج البلاغہ کے کل ابواب (۷۹۹ فرمودات):
- **۲۴۱ خطبات**
- **۷۹ مکتوبات**
- **۴۸۹ حکمتیں**

کیا آپ کسی مخصوص حکمت (جیسے حکمت ۱۴۷ برائے علم یا حکمت ۸۱) کی تشریح ملاحظہ فرمانا چاہتے ہیں؟`
            : `In Nahj al-Balagha, there are canonically **489 Sayings (Hikam / Short Maxims)** of Ameer al-Momineen Imam Ali ibn Abi Talib (a.s.).

These concise, memorable aphorisms encapsulate timeless wisdom on the intellect, human character, patience (Sabr), wealth, friendship, and spiritual fortitude.

### 📖 Complete Canonical Structure (799 Total Discourses):
- **241 Sermons (Khutbat)**
- **79 Letters (Maktubat)**
- **489 Sayings (Hikam)**

*Would you like to examine a famous maxim, such as Saying 147 on knowledge or Saying 81 on human worth?*`;
        } else if (metaType === 'compiler_info' || metaType === 'corpus_breakdown') {
          metaAnswer = isUrdu
            ? `نہج البلاغہ کو عظیم اسلامی عالم، فقیہ اور ادیب **شریف الرضی** (سید رضی - الشريف الرضي، وفات ۴۰۶ھ) نے بغداد میں **سن ۴۰۰ ہجری** میں امیر المومنین حضرت علی ابن ابی طالب علیہ السلام کے فرمودات میں سے منتخب فرما کر مرتب کیا۔

یہ کتاب تین بنیادی ابواب اور کل **۷۹۹ کلامی فرمودات** پر مشتمل ہے:
۱. **۲۴۱ خطبات** (خطبہ ۱ تا ۲۴۱)
۲. **۷۹ مکتوبات (خطوط)** (مکتوب ۱ تا ۷۹)
۳. **۴۸۹ حکمتیں (قصار الحکم)** (حکمت ۱ تا ۴۸۹)

آج آپ نہج البلاغہ کے کس باب یا کلام مبارک کا مطالعہ فرمانا چاہتے ہیں؟`
            : `Nahj al-Balagha (*The Peak of Eloquence*) was compiled in Baghdad in **400 AH (1000 CE)** by the eminent Islamic scholar, jurist, and poet **al-Sharif al-Radi (Sayyid Razi - الشريف الرضي)**, who passed away in 406 AH.

He selected the most eloquent and profound words of Ameer al-Momineen Imam Ali ibn Abi Talib (a.s.) and arranged them into three canonical sections comprising **799 total discourses**:
1. **241 Sermons (Khutbat)**
2. **79 Letters (Maktubat)**
3. **489 Sayings & Maxims (Hikam)**

Which section or discourse would you like to explore today?`;
        }

        return {
          answer: metaAnswer,
          citations: [],
          relatedTopics: [
            '79 Letters of Imam Ali',
            '241 Sermons of Nahj al-Balagha',
            '489 Sayings & Maxims',
            'Al-Sharif al-Radi (Compiler)',
          ],
          suggestedFollowUps: isUrdu
            ? [
                'مالک اشتر کے نام خط نمبر 53 کے بنیادی اصول کیا ہیں؟',
                'امام حسن علیہ السلام کے نام خط نمبر 31 کا خلاصہ فرمائیں',
                'خطبہ نمبر 3 (خطبہ شقشقیہ) کا تاریخی پس منظر کیا ہے؟',
                'حکمت نمبر 147 میں علم کی کیا فضیلت بیان ہوئی ہے؟',
              ]
            : [
                'Explain the core advice in Letter 53 to Malik al-Ashtar',
                'Summarize Letter 31: Advice and Moral Testament to Imam al-Hasan',
                'What is the historical context of Sermon 3 (ash-Shiqshiqiyyah)?',
                'What does Imam Ali say about knowledge in Saying 147?',
              ],
          confidenceLevel: 'high',
          disclaimer: null,
        };
      }
    }

    // 3. Strict Domain Guardrail Check (bypassed if user is asking about an uploaded image)
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
      HybridSearchEngine.extractExplicitPassage(request.message) ||
      HybridSearchEngine.resolveEntityPassage(request.message) ||
      HybridSearchEngine.resolveContextualPassage(request.message, conversationHistorySummary) ||
      (conversationHistorySummary ? HybridSearchEngine.resolveEntityPassage(conversationHistorySummary) : null) ||
      (searchReadyQuery ? HybridSearchEngine.extractExplicitPassage(searchReadyQuery) : null) ||
      (searchReadyQuery ? HybridSearchEngine.resolveEntityPassage(searchReadyQuery) : null);

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

      let retrySucceeded = false;
      try {
        const fallbackLlm = createLLM({ maxTokens: 400, temperature: 0.2 });
        const retryRes = await fallbackLlm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(request.message),
        ]);
        const retryText = retryRes.content?.toString().trim();
        if (retryText && retryText.length > 25) {
          cleanAnswer = retryText;
          retrySucceeded = true;
        }
      } catch (retryErr) {
        console.warn('Fallback LLM retry also failed:', (retryErr as any)?.message);
      }

      if (!retrySucceeded) {
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
  }

    // 10. Guarantee that every answer includes the formal Book Reference block
    if (citations.length > 0 && !cleanAnswer.includes('Book Reference') && !cleanAnswer.includes('کتابی حوالہ') && !cleanAnswer.includes('ماخذ:')) {
      let topCitation = citations[0];
      let topDoc = retrievedDocs[0];

      // Align citation to discourse explicitly mentioned in the response if found
      const discourseMatch = cleanAnswer.match(/\b(sermon|letter|saying|خطبہ|مکتوب|حکمت)\s*#?\s*(\d+)\b/i);
      if (discourseMatch) {
        const dType = discourseMatch[1].toLowerCase();
        const dNum = parseInt(discourseMatch[2], 10);
        const matchIdx = retrievedDocs.findIndex(
          (d) =>
            d.metadata.passageNumber === dNum &&
            (dType.includes('sermon') || dType.includes('خطبہ')
              ? d.metadata.passageType === 'sermon'
              : dType.includes('letter') || dType.includes('مکتوب')
              ? d.metadata.passageType === 'letter'
              : d.metadata.passageType === 'saying')
        );
        if (matchIdx !== -1) {
          topCitation = citations[matchIdx] || topCitation;
          topDoc = retrievedDocs[matchIdx] || topDoc;
        }
      }

      if (userIntent === 'name_only') {
        if (!discourseMatch || topCitation.passageNumber === parseInt(discourseMatch[2], 10)) {
          const urduCat =
            topCitation.passageType === 'sermon' ? 'خطبہ' :
            topCitation.passageType === 'letter' ? 'مکتوب' :
            topCitation.passageType === 'saying' ? 'حکمت' : 'دعا';

          cleanAnswer += detectedLang === 'urdu'
            ? `\n\n---\n**ماخذ:** نہج البلاغہ، ${urduCat} #${topCitation.passageNumber} («${topDoc?.metadata?.passageTitle || ''}»)`
            : `\n\n---\n**Source:** Nahj al-Balagha, ${topCitation.passageType.toUpperCase()} #${topCitation.passageNumber} (*"${topDoc?.metadata?.passageTitle}"*)`;
        }
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

    // 11. Strict Post-Generation Citation Alignment
    // Ensure the citation(s) returned in the API and displayed in the UI Sources area
    // exactly match the discourse(s) identified in cleanAnswer or explicit query targeting!
    let alignedCitations = [...citations];
    const discourseRegex = /\b(sermon|letter|saying|khutba|khutbah|maktoob|hikmah|خطبہ|مکتوب|حکمت)\s*#?\s*(\d+)\b/gi;
    const matches = Array.from(cleanAnswer.matchAll(discourseRegex));

    const referencedDiscourses: { type: PassageType; number: number }[] = [];

    // If an explicit or contextual discourse was resolved, place it at Rank 1
    if (explicitPassage) {
      const eType = (explicitPassage as any).type || (explicitPassage as any).passageType;
      const eNum = (explicitPassage as any).number !== undefined ? (explicitPassage as any).number : (explicitPassage as any).passageNumber;
      if (eType && eNum !== undefined) {
        referencedDiscourses.push({ type: eType, number: eNum });
      }
    }

    for (const m of matches) {
      const rawType = m[1].toLowerCase();
      const pNum = parseInt(m[2], 10);
      const pType: PassageType =
        rawType.includes('sermon') || rawType.includes('khutba') || rawType.includes('خطبہ')
          ? 'sermon'
          : rawType.includes('letter') || rawType.includes('maktoob') || rawType.includes('مکتوب')
          ? 'letter'
          : 'saying';

      if (!referencedDiscourses.some((d) => d.type === pType && d.number === pNum)) {
        referencedDiscourses.push({ type: pType, number: pNum });
      }
    }

    if (referencedDiscourses.length > 0) {
      const prioritizedCitations: Citation[] = [];

        for (const ref of referencedDiscourses) {
          const existing = alignedCitations.find(
            (c) => c.passageType === ref.type && c.passageNumber === ref.number
          );

          if (existing) {
            prioritizedCitations.push(existing);
          } else {
            const exactDoc = HybridSearchEngine.getExactPassage(ref.type, ref.number);
            if (exactDoc) {
              prioritizedCitations.push({
                sourceId: exactDoc.metadata.sourceId || `${ref.type}_${ref.number}`,
                passageType: exactDoc.metadata.passageType,
                passageNumber: exactDoc.metadata.passageNumber,
                text: exactDoc.content.length > 300 ? exactDoc.content.substring(0, 300) + '...' : exactDoc.content,
                arabicText: exactDoc.metadata.arabicOriginal || null,
                translator: exactDoc.metadata.translator || 'Syed Ali Reza / Allama Zeeshan Haider Jawadi',
                language: exactDoc.metadata.language || 'english',
                sourceType: 'translation',
                confidence: 1.0,
              });
            }
          }
        }

        for (const c of alignedCitations) {
          if (!prioritizedCitations.some((p) => p.passageType === c.passageType && p.passageNumber === c.passageNumber)) {
            if (userIntent !== 'name_only' && userIntent !== 'full_text') {
              prioritizedCitations.push(c);
            }
          }
        }

        if (prioritizedCitations.length > 0) {
          alignedCitations = prioritizedCitations;
        }
      }

    // 12. Asynchronously record reading history for personalization tracking
    if (alignedCitations.length > 0) {
      readingHistoryRepository
        .recordInteraction({
          userId,
          passageType: alignedCitations[0].passageType,
          passageNumber: alignedCitations[0].passageNumber,
          interactionType: 'explored',
          duration: Math.round((Date.now() - startTime) / 1000),
        })
        .catch(() => {});
    }

    return {
      answer: cleanAnswer,
      citations: alignedCitations,
      relatedTopics,
      suggestedFollowUps,
      confidenceLevel,
      disclaimer,
    };
  }
}

export const ragService = new RAGService();
