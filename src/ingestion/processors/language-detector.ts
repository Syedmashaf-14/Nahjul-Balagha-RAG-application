import { Language } from '../../types/user.types';

export class LanguageDetector {
  /**
   * Accurately detects whether a user's question is in Urdu or English.
   * If the question contains Perso-Arabic script or common Urdu phrasing, it routes to Urdu.
   * If a preference is explicitly passed, it is respected.
   */
  public static detect(text: string, preferredLanguage?: 'english' | 'urdu'): 'english' | 'urdu' {
    if (!text || text.trim().length === 0) {
      return preferredLanguage || 'english';
    }

    const trimmed = text.trim();

    // 1. Check for Arabic / Perso-Arabic script characters (Urdu, Arabic, Persian alphabet)
    const arabicScriptRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
    const arabicMatches = trimmed.match(arabicScriptRegex);
    if (arabicMatches && arabicMatches.length > 0) {
      return 'urdu';
    }

    const lower = trimmed.toLowerCase();

    // 2. Strong English indicators take immediate priority for Latin text
    const englishPatterns = [
      /\bwhat\b/, /\bhow\b/, /\bwhy\b/, /\bexplain\b/, /\bwho\b/, /\bwhich\b/,
      /\bdescribe\b/, /\btell\b/, /\bwhere\b/, /\bwhen\b/, /\bprinciples\b/,
      /\bgovernance\b/, /\bjustice\b/, /\bcharacter\b/, /\bwisdom\b/
    ];
    if (englishPatterns.some((pattern) => pattern.test(lower))) {
      return 'english';
    }

    // 3. Check for distinct Roman Urdu grammatical constructs (requires 2+ markers or strong Urdu verb)
    const distinctUrduPhrases = [
      /\bke bare mein\b/, /\bki fazilat\b/, /\bka matlab\b/, /\bkya hai\b/, /\bkya hain\b/,
      /\bkaise hai\b/, /\bkyun hai\b/, /\bbatao\b/, /\bbataiye\b/, /\bbatayein\b/,
      /\bfarmaya\b/, /\bfarmate\b/
    ];
    if (distinctUrduPhrases.some((pattern) => pattern.test(lower))) {
      return 'urdu';
    }

    // 4. Fallback to user explicit preference if provided
    if (preferredLanguage) {
      return preferredLanguage;
    }

    // 5. Default to English for general Latin queries
    return 'english';
  }
}
