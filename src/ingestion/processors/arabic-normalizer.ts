export class ArabicNormalizer {
  // Regex to match Arabic diacritics (tashkeel/harakat)
  private static readonly TASHKEEL_REGEX = /[\u064B-\u0652\u0670\u0640]/g;

  /**
   * Normalizes Arabic text for semantic & keyword indexing while keeping original text intact.
   * Strips tashkeel (diacritics), unifies hamza variants, normalizes alif maqsura and ta marbuta.
   */
  public static normalize(text: string): string {
    if (!text) return '';

    return (
      text
        // 1. Remove diacritical marks (Tashkeel: Fatha, Damma, Kasra, Sukun, Shadda, Tanween, Tatweel)
        .replace(this.TASHKEEL_REGEX, '')
        // 2. Normalize Alif variations (أ, إ, آ, ٱ -> ا)
        .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
        // 3. Normalize Alif Maqsura (ى -> ي)
        .replace(/\u0649/g, '\u064A')
        // 4. Normalize Ta Marbuta (ة -> ه)
        .replace(/\u0629/g, '\u0647')
        // 5. Normalize Persian/Urdu Kaf and Yeh to standard Arabic equivalents
        .replace(/\u06A9/g, '\u0643')
        .replace(/\u06CC/g, '\u064A')
        // 6. Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * Checks whether a given string contains Arabic characters.
   */
  public static isArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(text);
  }

  /**
   * Cleans punctuation and numbers from Arabic text for lexical search tokenization.
   */
  public static tokenize(text: string): string[] {
    const normalized = this.normalize(text);
    return normalized
      .replace(/[^\u0621-\u064A\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }
}
