import { RetrievedDocument, PassageType } from '../../types/passage.types';
import canonicalPassagesJson from '../../ingestion/canonical-passages.json';

export interface EntityMatch {
  passageType?: PassageType;
  passageNumbers?: number[];
  canonicalTerms: string[];
  entityName: string;
}

export const HISTORICAL_ENTITIES: EntityMatch[] = [
  {
    entityName: 'Muawiyah / Ameer-e-Sham (Governor of Syria)',
    passageType: 'letter',
    passageNumbers: [6, 10, 17, 28, 32, 55, 64, 75],
    canonicalTerms: [
      'muawiya', 'muawiyah', 'moawiya', 'ameer e sham', 'ameer-e-sham', 'ameer sham',
      'ammere sham', 'amir e sham', 'amir sham', 'governor of syria', 'syria', 'sham',
      'معاویہ', 'معاوية', 'امیر شام', 'امیرِ شام', 'شام کے والی', 'اہل شام'
    ],
  },
  {
    entityName: 'Malik al-Ashtar (Governor of Egypt)',
    passageType: 'letter',
    passageNumbers: [53, 38],
    canonicalTerms: [
      'malik ashtar', 'malik al-ashtar', 'malik-e-ashtar', 'malik al ashtar',
      'ashtar', 'governor of egypt', 'egypt', 'مالک اشتر', 'مالک الاشتر', 'مصر', 'والی مصر'
    ],
  },
  {
    entityName: 'Moral Testament to Imam al-Hasan (a.s.)',
    passageType: 'letter',
    passageNumbers: [31],
    canonicalTerms: [
      'letter to son', 'advice to son', 'hasan', 'hassan', 'imam hasan',
      'وصیت نامہ', 'امام حسن', 'فرزند'
    ],
  },
  {
    entityName: 'Sermon of the Pious (Khutba al-Muttaqeen / Hammam)',
    passageType: 'sermon',
    passageNumbers: [193],
    canonicalTerms: [
      'muttaqeen', 'muttaqin', 'pious', 'qualities of pious', 'hammam',
      'متقین', 'ہمام', 'خطبہ متقین', 'پرہیزگار'
    ],
  },
  {
    entityName: 'Shaqshaqiyya (Sermon on Caliphate and Patience)',
    passageType: 'sermon',
    passageNumbers: [3],
    canonicalTerms: [
      'shaqshaqiyya', 'shaqshaqia', 'shaqshaqiya', 'caliphate',
      'شقشقیہ', 'خطبہ شقشقیہ'
    ],
  },
  {
    entityName: 'Al-Qasi\'ah (The Sermon of Disparagement on Pride and Iblis)',
    passageType: 'sermon',
    passageNumbers: [192],
    canonicalTerms: [
      'qasiah', 'qasi\'ah', 'disparagement', 'pride', 'iblis', 'satan',
      'قاصعہ', 'خطبہ قاصعہ', 'تکبر', 'ابلیس'
    ],
  },
  {
    entityName: 'Al-Ashbah (The Sermon of Skeletons / Angels and Creation)',
    passageType: 'sermon',
    passageNumbers: [91],
    canonicalTerms: [
      'ashbah', 'skeletons', 'ghosts', 'creation', 'angels',
      'اشباح', 'خطبہ اشباح', 'فرشتے'
    ],
  },
  {
    entityName: 'Qadi Shurayh (Purchase of House for 80 Dinars)',
    passageType: 'letter',
    passageNumbers: [3],
    canonicalTerms: [
      'shurayh', 'qadi shurayh', 'judge', 'house for 80 dinars', '80 dinars',
      'شریح', 'قاضی شریح', 'مکان'
    ],
  },
  {
    entityName: 'Uthman ibn Hunayf (Governor of Basra / Feast of the Wealthy)',
    passageType: 'letter',
    passageNumbers: [45],
    canonicalTerms: [
      'uthman ibn hunayf', 'uthman bin hunaif', 'basra', 'feast', 'banquet',
      'عثمان بن حنیف', 'والی بصرہ', 'دعوت'
    ],
  },
  {
    entityName: 'Kumayl ibn Ziyad (Nature and Divisions of Knowledge)',
    passageType: 'saying',
    passageNumbers: [147],
    canonicalTerms: [
      'kumayl', 'kumail', 'knowledge vs wealth', 'containers of knowledge',
      'کمیل', 'کمیل بن زیاد'
    ],
  },
  {
    entityName: 'Ziyad ibn Abihi (Accountability and Strict Governance)',
    passageType: 'letter',
    passageNumbers: [20, 21, 44],
    canonicalTerms: [
      'ziyad', 'ziyad ibn abihi', 'زیاد بن ابیہ'
    ],
  },
  {
    entityName: 'Battle of the Camel (Jamal / Talha, Zubayr, Aisha)',
    passageType: 'sermon',
    passageNumbers: [1, 8, 13, 31, 54, 137],
    canonicalTerms: [
      'jamal', 'camel', 'talha', 'zubayr', 'aisha', 'basra',
      'جمل', 'طلحہ', 'زبیر', 'عائشہ'
    ],
  },
  {
    entityName: 'Battle of Siffin (Arbitration and Syrians)',
    passageType: 'sermon',
    passageNumbers: [35, 51, 56, 122, 124, 125],
    canonicalTerms: [
      'siffin', 'arbitration', 'tahkeem', 'quran on spears',
      'صفین', 'تحکیم', 'نیزوں پر قرآن'
    ],
  },
  {
    entityName: 'Kharijites / Battle of Nahrawan',
    passageType: 'sermon',
    passageNumbers: [36, 40, 58, 59, 60, 92, 122],
    canonicalTerms: [
      'khawarij', 'kharijites', 'nahrawan', 'no judgment but god',
      'خوارج', 'نہروان', 'لا حکم الا للہ'
    ],
  },
  {
    entityName: 'Saying 81: Real Worth of a Human Being',
    passageType: 'saying',
    passageNumbers: [81],
    canonicalTerms: [
      'saying 81', 'worth of every person', 'value in what they do well',
      'قيمة كل امرئ', 'قدر و قیمت', 'حکمت 81'
    ],
  },
];

export class HybridSearchEngine {
  private static allPassages: any[] = canonicalPassagesJson as any[];

  /**
   * Performs high-precision lexical and entity search across the entire 792 canonical corpus.
   */
  public static searchLexical(
    query: string,
    limit: number = 6,
    filters?: { passageType?: PassageType; passageNumber?: number }
  ): RetrievedDocument[] {
    const rawLower = query.toLowerCase().trim();
    if (!rawLower) return [];

    // 1. Detect Category Intent from query keywords
    let requestedType: PassageType | undefined = filters?.passageType;
    if (!requestedType) {
      if (/\bletter\b|\bletters\b|خط\b|مکتوب\b|مکتوبات\b/.test(rawLower)) {
        requestedType = 'letter';
      } else if (/\bsermon\b|\bsermons\b|خطبہ\b|خطبات\b/.test(rawLower)) {
        requestedType = 'sermon';
      } else if (/\bsaying\b|\bsayings\b|\bmaxim\b|\baphorism\b|حکمت\b|قول\b|اقوال\b/.test(rawLower)) {
        requestedType = 'saying';
      } else if (/\bdua\b|\bprayer\b|\bsupplication\b|دعا\b|مناجات\b/.test(rawLower)) {
        requestedType = 'dua';
      }
    }

    // 2. Extract Specific Number if mentioned (e.g. "letter 6", "sermon 193", "قول 81")
    let requestedNumber: number | undefined = filters?.passageNumber;
    if (requestedNumber === undefined) {
      const numMatch = rawLower.match(/(?:letter|sermon|saying|khutba|خط|مکتوب|حکمت)\s*(?:#|no\.?|number)?\s*(\d+)/i) ||
                       rawLower.match(/(\d+)\s*(?:نمبر|خط|خطبہ|حکمت)/i);
      if (numMatch) {
        requestedNumber = parseInt(numMatch[1], 10);
      }
    }

    // 3. Resolve Historical Entities & Aliases
    const matchedEntities: EntityMatch[] = [];
    for (const entity of HISTORICAL_ENTITIES) {
      for (const term of entity.canonicalTerms) {
        if (rawLower.includes(term.toLowerCase())) {
          matchedEntities.push(entity);
          break;
        }
      }
    }

    // Tokenize terms (ignoring common grammatical noise)
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'that', 'to', 'for', 'show', 'me', 'what', 'imam', 'ali', 'write', 'wrote', 'says', 'said', 'tell']);
    const tokens = rawLower
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !stopWords.has(t));

    const scoredPassages: { passage: any; score: number }[] = [];

    for (const p of this.allPassages) {
      const pType = (p.chapter || 'saying').toLowerCase() as PassageType;
      const pNum = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);

      // If user specified an exact number and type, prioritize directly
      if (requestedNumber !== undefined && pNum === requestedNumber) {
        if (!requestedType || pType === requestedType) {
          scoredPassages.push({ passage: p, score: 100.0 });
          continue;
        }
      }

      let score = 0;

      // Entity match bonus
      for (const entity of matchedEntities) {
        if (entity.passageNumbers?.includes(pNum) && (!entity.passageType || entity.passageType === pType)) {
          score += 15.0;
        }
      }

      // Category match
      if (requestedType && pType === requestedType) {
        score += 2.0;
      }

      const pTitle = (p.title || '').toLowerCase();
      const pArabic = (p.arabicText || '').toLowerCase();
      const pEnglish = (p.translationText || '').toLowerCase();
      const pUrdu = (p.urduTranslation || '').toLowerCase();
      const pTopics = (p.topics || []).join(' ').toLowerCase();

      // Token matching
      for (const token of tokens) {
        if (pTitle.includes(token)) score += 3.5;
        if (pArabic.includes(token)) score += 2.5;
        if (pUrdu.includes(token)) score += 2.5;
        if (pEnglish.includes(token)) score += 2.0;
        if (pTopics.includes(token)) score += 1.5;
      }

      if (score > 1.5) {
        scoredPassages.push({ passage: p, score });
      }
    }

    // Sort descending by relevance score
    scoredPassages.sort((a, b) => b.score - a.score);

    // Map to RetrievedDocument format
    return scoredPassages.slice(0, limit).map(({ passage: p, score }) => {
      const pType = (p.chapter || 'saying').toLowerCase() as PassageType;
      const pNum = typeof p.number === 'number' ? p.number : parseInt(p.number, 10);

      return {
        id: `lexical_${pType}_${pNum}`,
        content: p.translationText || p.urduTranslation || p.arabicText || '',
        metadata: {
          book: 'Nahj al-Balagha',
          sourceId: `src_${pType}_${pNum}`,
          passageType: pType,
          passageNumber: pNum,
          passageTitle: p.title || null,
          language: 'english',
          translator: p.translator || 'Syed Ali Reza / Allama Zeeshan Haider Jawadi',
          contentType: 'translation',
          commentaryAuthor: null,
          chapter: pType,
          section: p.section || pType,
          chunkIndex: 0,
          totalChunks: 1,
          arabicOriginal: p.arabicText || null,
          urduTranslation: p.urduTranslation || null,
          topics: p.topics || [],
          ingestedAt: new Date().toISOString(),
          chunkSize: (p.translationText || p.arabicText || '').length,
        },
        score: Math.min(1.0, score / 15.0),
      };
    });
  }
}
