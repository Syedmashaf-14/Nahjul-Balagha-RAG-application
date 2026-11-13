export class TextCleaner {
  /**
   * Sanitizes input text by removing control characters, zero-width spaces, and normalizing linebreaks.
   */
  public static clean(text: string): string {
    if (!text) return '';

    return (
      text
        // Remove null bytes and non-printable control characters (except tabs and newlines)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Remove zero-width spaces, joiners, non-joiners
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Normalize linebreaks to \n
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Collapse 3+ newlines to max 2
        .replace(/\n{3,}/g, '\n\n')
        // Trim trailing spaces from each line
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim()
    );
  }

  /**
   * Strips HTML/markdown tags if present in plain raw imports
   */
  public static stripTags(text: string): string {
    return text.replace(/<[^>]*>?/gm, '');
  }
}
