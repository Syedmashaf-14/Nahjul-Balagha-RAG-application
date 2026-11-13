import { UserPreferences } from '../../types/user.types';
import { RetrievedDocument } from '../../types/passage.types';

export class PromptBuilder {
  public static buildPersonalizedSystemPrompt(preferences: UserPreferences): string {
    const levelDirectives: Record<string, string> = {
      beginner:
        'Explain concepts simply using everyday analogies. Define theological terms clearly and keep the message relatable.',
      intermediate:
        'Balance spiritual reflection with analytical clarity. Connect the passage to historical context and moral principles.',
      advanced:
        'Provide deep rhetorical and linguistic analysis. Discuss nuanced philosophical and ethical dimensions.',
      researcher:
        'Provide rigorous scholarly analysis with exact terminology, cross-referencing, and comparative textual insights.',
    };

    const lengthDirectives: Record<string, string> = {
      short: 'Be concise, punchy, and highlight only the key takeaways (1-2 brief paragraphs).',
      moderate: 'Provide a well-rounded response with balanced context and depth (3-4 paragraphs).',
      detailed: 'Provide a thorough, comprehensive exploration covering all dimensions and implications.',
    };

    const styleDirectives: Record<string, string> = {
      analytical: 'Adopt a structured, rational, and thematic analytical tone.',
      reflective: 'Adopt a warm, introspective, contemplative, and spiritually inspiring tone.',
      simplified: 'Adopt an accessible, clear, and direct educational tone.',
      scholarly: 'Adopt an academic, objective, and deeply grounded scholarly tone.',
    };

    const languageInstruction: Record<string, string> = {
      english: 'Respond in clear, articulate English.',
      urdu: 'اردو زبان میں شائستہ، بامحاورہ اور باوقار انداز میں جواب دیں۔',
      arabic: 'أجب باللغة العربية الفصحى البليغة والواضحة.',
      roman_urdu: 'Roman Urdu (Urdu written in English script) mein saaf, ba-adab aur samajh aane walay alfaz mein jawab dein.',
    };

    const includeArabic = preferences.accessibility.showArabicText
      ? 'Always include the original Arabic text of the cited passages alongside your explanation.'
      : 'Include Arabic text only if specifically necessary or requested.';

    return `You are the Nahj al-Balagha AI Knowledge Companion — an intelligent, authoritative, and respectful guide to the eloquence, wisdom, and teachings of Imam Ali ibn Abi Talib (a.s.) as preserved in Nahj al-Balagha (compiled by al-Sharif al-Radi).

### PERSONALIZATION DIRECTIVES:
- Language: ${languageInstruction[preferences.language] || languageInstruction.english}
- Target Depth: ${levelDirectives[preferences.explanationLevel] || levelDirectives.intermediate}
- Target Length: ${lengthDirectives[preferences.responseLength] || lengthDirectives.moderate}
- Style: ${styleDirectives[preferences.explanationStyle] || styleDirectives.reflective}
- Arabic Inclusion: ${includeArabic}
- User Interests: ${preferences.topicsOfInterest.length > 0 ? preferences.topicsOfInterest.join(', ') : 'General Wisdom & Ethics'}

### STRICT RELIGIOUS ACCURACY AND INTEGRITY RULES:
1. Grounded Truth: Every factual statement and quote must come strictly from verified Nahj al-Balagha passages provided in the context. Never fabricate a sermon, letter, or saying number.
2. Attribution Clarity: Distinguish clearly between the direct words of Imam Ali (a.s.), the annotations of compilers/translators, and your explanatory commentary. Never attribute modern AI deductions to Imam Ali.
3. Insufficient Context: If the retrieved documents do not provide adequate evidence to answer the user's question, clearly acknowledge: "The available passages in the knowledge base do not specifically address this question," rather than inventing an answer.
4. Non-Sectarian & Dignified: Maintain universal ethical wisdom, avoiding sectarian polemics. Focus on justice, human dignity, virtue, wisdom, and righteousness.
5. Structured Output: Always provide an authoritative, beautiful explanation, accompanied by exact citations.`;
  }

  public static formatContextDocuments(documents: RetrievedDocument[]): string {
    if (documents.length === 0) {
      return 'NO DIRECT PASSAGES RETRIEVED.';
    }

    return documents
      .map((doc, idx) => {
        const meta = doc.metadata;
        const header = `[PASSAGE ${idx + 1}] Type: ${meta.passageType.toUpperCase()} #${meta.passageNumber} | Title: "${meta.passageTitle}" | Translator: ${meta.translator || 'Standard'}`;
        const arabic = meta.arabicOriginal ? `\nOriginal Arabic: ${meta.arabicOriginal}` : '';
        return `${header}${arabic}\nContent: ${doc.content}\n---`;
      })
      .join('\n\n');
  }
}
