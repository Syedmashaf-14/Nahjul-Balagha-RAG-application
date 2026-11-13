import { Language } from '../../types/user.types';

export class LanguageDetector {
  private static readonly ROMAN_URDU_MARKERS = new Set([
    'kya', 'hai', 'hain', 'tha', 'thi', 'the', 'ke', 'ka', 'ki', 'ko', 'se', 'me', 'mein',
    'aur', 'par', 'bhi', 'nahin', 'nahi', 'karo', 'karna', 'farmaya', 'khutba', 'hisaab',
    'adalat', 'insaf', 'sabar', 'hikmat', 'hazrat', 'mola', 'maula', 'khuda', 'allah',
    'duniya', 'aakhrat', 'zindagi', 'insan', 'baat', 'logon', 'hukumat', 'rehnumai'
  ]);

  /**
   * Accurately detects whether text is Arabic, Urdu, English, or Roman Urdu.
   */
  public static detect(text: string): Language {
    if (!text || text.trim().length === 0) {
      return 'english';
    }

    const trimmed = text.trim();

    // 1. Check for Arabic / Perso-Arabic script
    const arabicScriptRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
    const arabicMatches = trimmed.match(arabicScriptRegex);
    const totalChars = trimmed.replace(/\s+/g, '').length;

    if (arabicMatches && arabicMatches.length / totalChars > 0.4) {
      // Differentiate between Urdu and Arabic
      // Urdu specific characters: ٹ, ڈ, ڑ, ں, ے, ہ, چ, پ, ژ, گ
      const urduSpecificRegex = /[\u0679\u0688\u0691\u06BA\u06D2\u06C1\u0686\u067E\u0698\u06AF]/;
      if (urduSpecificRegex.test(trimmed)) {
        return 'urdu';
      }
      return 'arabic';
    }

    // 2. Check for Roman Urdu vs English
    const words = trimmed
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.length > 0) {
      let romanUrduHits = 0;
      for (const word of words) {
        if (this.ROMAN_URDU_MARKERS.has(word)) {
          romanUrduHits++;
        }
      }

      // If more than 20% of words match Roman Urdu indicators, classify as roman_urdu
      if (romanUrduHits / words.length >= 0.2 || (romanUrduHits >= 2 && words.length <= 5)) {
        return 'roman_urdu';
      }
    }

    return 'english';
  }
}
