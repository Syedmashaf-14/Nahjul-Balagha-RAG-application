import { connectDB } from '../config/database';
import { DailyWisdomModel } from '../db/models/daily-wisdom.model';
import { userPreferencesRepository } from '../db/repositories/user-preferences.repository';
import { getCreativeLLM } from '../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { IDailyWisdom } from '../types/api.types';
import { SEED_PASSAGES } from '../ingestion/seed-data';

// Islamic month themes mapping
const ISLAMIC_MONTH_THEMES: Record<string, { theme: string; focus: string }> = {
  Muharram: { theme: 'Justice, sacrifice, and steadfastness against tyranny', focus: 'justice' },
  Safar: { theme: 'Patience, reliance on God, and endurance through trials', focus: 'patience' },
  'Rabi I': { theme: 'Prophethood, noble character, and following the Messenger', focus: 'prophethood' },
  'Rabi al-Awwal': { theme: 'Prophethood, noble character, and following the Messenger', focus: 'prophethood' },
  'Rabi II': { theme: 'Truthfulness, brotherhood, and righteous companions', focus: 'character' },
  'Jumada I': { theme: 'Integrity, moral leadership, and standing for truth', focus: 'governance' },
  'Jumada al-Awwal': { theme: 'Integrity, moral leadership, and standing for truth', focus: 'governance' },
  'Jumada II': { theme: 'Humility, self-discipline, and devotion to God', focus: 'piety' },
  'Jumada al-Thani': { theme: 'Humility, self-discipline, and devotion to God', focus: 'piety' },
  Rajab: { theme: 'Repentance, supplication, and seeking divine forgiveness', focus: 'dua' },
  "Sha'ban": { theme: 'Spiritual preparation, prayer, and hope in divine mercy', focus: 'spirituality' },
  Ramadan: { theme: 'Fasting, piety (Taqwa), Quranic contemplation, and charity', focus: 'piety' },
  Shawwal: { theme: 'Steadfastness after Ramadan, gratitude, and moral vigilance', focus: 'wisdom' },
  'Dhu al-Qi`dah': { theme: 'Reconciliation, inner peace, and preparing for pilgrimage', focus: 'character' },
  'Dhu al-Hijjah': { theme: 'Hajj, divine covenant, leadership (Wilayah), and sacrifice', focus: 'leadership' },
};

export class DailyWisdomService {
  /**
   * Helper to get current Islamic month and date string
   */
  public getIslamicDate(): { islamicDateStr: string; islamicMonth: string; day: number } {
    try {
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const parts = formatter.formatToParts(new Date());
      const monthPart = parts.find((p) => p.type === 'month')?.value || 'Jumada II';
      const dayPart = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
      const yearPart = parts.find((p) => p.type === 'year')?.value || '1448 AH';
      return {
        islamicDateStr: `${monthPart} ${dayPart}, ${yearPart}`,
        islamicMonth: monthPart,
        day: dayPart,
      };
    } catch {
      return {
        islamicDateStr: 'Jumada II 4, 1448 AH',
        islamicMonth: 'Jumada II',
        day: 4,
      };
    }
  }

  /**
   * Retrieves today's personalized wisdom or generates a fresh AI-selected wisdom based on the Islamic month.
   */
  public async getDailyWisdom(userId: string, forceRefresh: boolean = false): Promise<IDailyWisdom> {
    const { islamicDateStr, islamicMonth, day } = this.getIslamicDate();
    const monthConfig = ISLAMIC_MONTH_THEMES[islamicMonth] || {
      theme: 'Wisdom, justice, and character in life',
      focus: 'wisdom',
    };

    // Filter available sayings and khutbat from full database
    const availableSayings = SEED_PASSAGES.filter((p) => p.chapter?.toLowerCase() === 'saying');
    const availableSermons = SEED_PASSAGES.filter((p) => p.chapter?.toLowerCase() === 'sermon');
    const pool = availableSayings.length > 0 ? availableSayings : SEED_PASSAGES;

    // Deterministic yet daily-rotating selection: hash of day + date + userId length
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const selectedIdx = (dayOfYear * 7 + day * 13) % pool.length;
    const candidate = pool[selectedIdx] || pool[0];

    const fallbackWisdom: IDailyWisdom = {
      _id: `daily-wisdom-${candidate.number}-${dayOfYear}`,
      userId,
      passageType: (candidate.chapter?.toLowerCase() || 'saying') as any,
      passageNumber: candidate.number,
      arabicText: candidate.arabicText || 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ.',
      translationText: candidate.translationText || candidate.title || '',
      urduTranslation: candidate.urduTranslation || undefined,
      language: 'english',
      reflectionQuestion: `In this blessed month of ${islamicMonth}, reflect on how Imam Ali's teaching inspires excellence and ethical conduct today.`,
      topic: monthConfig.focus,
      deliveredAt: new Date(),
      createdAt: new Date(),
      interacted: false,
    };

    try {
      await connectDB();

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // Check if already delivered today (unless forceRefresh is true)
      if (!forceRefresh) {
        const existing = await DailyWisdomModel.findOne({
          userId,
          deliveredAt: { $gte: startOfToday },
        }).exec();

        if (existing) {
          const obj = existing.toObject() as unknown as IDailyWisdom;
          // Attach urduTranslation if available
          if (!obj.urduTranslation && candidate.urduTranslation) {
            obj.urduTranslation = candidate.urduTranslation;
          }
          return obj;
        }
      }

      // Generate insightful reflection question using AI
      let reflectionQuestion = fallbackWisdom.reflectionQuestion;
      try {
        const llm = getCreativeLLM();
        const response = await llm.invoke([
          new SystemMessage(
            `You are a wise Islamic scholar and mentor of Nahj al-Balagha.
The current Islamic month is ${islamicMonth} (${monthConfig.theme}).
Given the following saying/sermon of Imam Ali (AS), compose ONE short, profound contemplative reflection (under 35 words) that connects this wisdom to the seeker's daily life and conscience. Do not output preamble or quotation marks.`
          ),
          new HumanMessage(
            `Passage: "${candidate.translationText || candidate.title}"\nArabic: "${candidate.arabicText || ''}"`
          ),
        ]);
        reflectionQuestion = response.content.toString().trim();
      } catch (aiErr) {
        console.warn('AI reflection question generation skipped, using canonical reflection.');
      }

      // Store in MongoDB
      const wisdomDoc = await DailyWisdomModel.create({
        userId,
        passageType: candidate.chapter?.toLowerCase() || 'saying',
        passageNumber: candidate.number,
        arabicText: candidate.arabicText || null,
        translationText: candidate.translationText || candidate.title,
        urduTranslation: candidate.urduTranslation || null,
        language: 'english',
        reflectionQuestion,
        topic: monthConfig.focus,
        deliveredAt: new Date(),
        interacted: false,
      });

      return wisdomDoc.toObject() as unknown as IDailyWisdom;
    } catch (err) {
      console.warn('DailyWisdom using dynamic canonical selection:', (err as any)?.message);
      return fallbackWisdom;
    }
  }
}

export const dailyWisdomService = new DailyWisdomService();
