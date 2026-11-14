import { Language } from '../../types/user.types';

export class LanguageDetector {
  /**
   * Accurately detects whether text is Urdu, Arabic, or English.
   * Strictly 2 translation languages (English and Urdu) + Classical Arabic source text.
   */
  public static detect(text: string): 'english' | 'urdu' {
    if (!text || text.trim().length === 0) {
      return 'english';
    }

    const trimmed = text.trim();

    // Check for Arabic / Perso-Arabic script
    const arabicScriptRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
    const arabicMatches = trimmed.match(arabicScriptRegex);
    const totalChars = trimmed.replace(/\s+/g, '').length;

    if (arabicMatches && arabicMatches.length / totalChars > 0.25) {
      return 'urdu';
    }

    // Default to English for queries asked in English
    return 'english';
  }
}
