import { connectDB } from '../config/database';
import { DailyWisdomModel } from '../db/models/daily-wisdom.model';
import { userPreferencesRepository } from '../db/repositories/user-preferences.repository';
import { getCreativeLLM } from '../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { IDailyWisdom } from '../types/api.types';
import { SEED_PASSAGES } from '../ingestion/seed-data';
import canonicalPassages from '../ingestion/canonical-passages.json';

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

    // Use complete canonical library
    const allPassages = (canonicalPassages && canonicalPassages.length > 0)
      ? (canonicalPassages as any[])
      : SEED_PASSAGES;

    // Beautiful, short, authentic duas of Amir al-Mu'minin (compact invocations)
    const shortDuas = [
      {
        chapter: 'dua',
        number: 215,
        title: 'Supplication for Honor & Self-Sufficiency',
        arabicText: 'اللَّهُمَّ صُنْ وَجْهِي بِالْيَسَارِ، وَلاَ تَبْذُلْ جَاهِيَ بِالْإِقْتَارِ، فَأَسْتَرْزِقَ طَالِبِي رِزْقِكَ، وَأَسْتَعْطِفَ شِرَارَ خَلْقِكَ.',
        translationText: 'O Lord! Preserve my dignity with independence, and let not poverty humiliate my honor, so that I may not have to seek sustenance from those who themselves seek sustenance from You.',
        urduTranslation: 'اے پروردگار! میرے وقار و عزت کو خودداری سے محفوظ فرما، اور مجھے ناداری کے ذریعے دوسروں کے سامنے ہاتھ پھیلانے سے بچا۔',
      },
      {
        chapter: 'dua',
        number: 115,
        title: 'Supplication for Rain & Divine Compassion',
        arabicText: 'اللَّهُمَّ اسْقِنَا ذُلَلَ السَّحَابِ دُونَ صِعَابِهَا، وَانْشُرْ عَلَيْنَا رَحْمَتَكَ، وَأَسْبِغْ عَلَيْنَا نِعْمَتَكَ بِالْغَيْثِ الْمُغِيثِ.',
        translationText: 'O Allah! Quench us with gentle, beneficial clouds and not destructive storms, and spread Your divine mercy upon us through life-giving rain.',
        urduTranslation: 'اے اللہ! ہم پر رحمت کی بارانِ کرم نازل فرما اور ہمیں اپنی بخشش و مغفرت سے شاداب و سیراب فرما۔',
      },
      {
        chapter: 'dua',
        number: 7,
        title: 'Supplication for Sincere Forgiveness',
        arabicText: 'اللَّهُمَّ اغْفِرْ لِي مَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، فَإِنْ عُدْتُ فَعُدْ عَلَيَّ بِمَغْفِرَتِكَ، وَاغْفِرْ لِي مَا وَأَيْتُ مِنْ نَفْسِي.',
        translationText: 'O Allah! Forgive in me what You know better than I; and if I falter again, renew Your forgiveness toward me.',
        urduTranslation: 'اے اللہ! میرے ان گناہوں کو معاف فرما جنہیں تو مجھ سے بہتر جانتا ہے، اور اپنے عفو و کرم سے میری توبہ قبول فرما۔',
      },
      {
        chapter: 'dua',
        number: 3,
        title: 'Munajat: Seeking Divine Sanctuary',
        arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الأَمَانَ يَوْمَ لاَ يَنْفَعُ مَالٌ وَلاَ بَنُونَ إِلاَّ مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ.',
        translationText: 'O Allah, I beseech You for sanctuary on the Day when neither wealth nor sons shall avail, except one who brings to Allah a sound heart.',
        urduTranslation: 'اے اللہ! میں تجھ سے اس دن کی پناہ مانگتا ہوں جس دن نہ مال کام آئے گا نہ اولاد، سوائے اس کے جو قلبِ سلیم لے کر حاضر ہو۔',
      },
      {
        chapter: 'dua',
        number: 1,
        title: 'Invocation of Encompassing Mercy',
        arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ، وَبِقُوَّتِكَ الَّتِي قَهَرْتَ بِهَا كُلَّ شَيْءٍ، وَخَضَعَ لَهَا كُلُّ شَيْءٍ.',
        translationText: 'O Allah, I beseech You by Your mercy which encompasses all things, and by Your power by which You dominate all things.',
        urduTranslation: 'اے اللہ! میں تجھ سے تیری اس رحمت کے وسیلے سے سوال کرتا ہوں جو ہر شے پر محیط ہے اور تیری اس قوت کے صدقے جو ہر چیز پر غالب ہے۔',
      },
      {
        chapter: 'dua',
        number: 2,
        title: 'Supplication of Dawn & Gratitude',
        arabicText: 'اللَّهُمَّ يَا مَنْ دَلَعَ لِسَانَ الصَّبَاحِ بِنُطْقِ تَبَلُّجِهِ، صَلِّ عَلَى مُحَمَّدٍ وَآلِهِ، وَافْتَحْ لَنَا أَبْوَابَ الْخَيْرِ وَالرَّحْمَةِ.',
        translationText: 'O Allah, O He who unrolled the tongue of morning with the radiance of dawn, open for us the gates of goodness and divine mercy.',
        urduTranslation: 'اے اللہ! جس نے صبح کی زبان کو روشنی کی تجلی سے گویا کیا، ہمارے لیے خیر و رحمت کے دروازے کشادہ فرما۔',
      },
    ];

    // Filter strictly for SHORT sayings of Imam Ali (under 260 characters)
    // Strictly exclude long sermons or bulky treatises so wisdom cards remain punchy and bite-sized
    const shortSayings = allPassages.filter((p) => {
      const ch = p.chapter?.toLowerCase();
      if (ch !== 'saying') return false;
      const arLen = (p.arabicText || '').length;
      const enLen = (p.translationText || '').length;
      const urLen = (p.urduTranslation || '').length;
      return arLen > 15 && arLen <= 260 && enLen > 10 && enLen <= 280 && urLen > 10 && urLen <= 280;
    });

    // Combined concise pool of short duas and short sayings of Imam Ali
    const activePool = [...shortDuas, ...shortSayings];

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );

    // If user clicked "New Wisdom" (forceRefresh), pick a truly random short quote or short dua!
    let candidate;
    if (forceRefresh) {
      const randomIdx = Math.floor(Math.random() * activePool.length);
      candidate = activePool[randomIdx];
    } else {
      const selectedIdx = (dayOfYear * 7 + day * 13) % activePool.length;
      candidate = activePool[selectedIdx] || activePool[0];
    }

    const fallbackWisdom: IDailyWisdom = {
      _id: `daily-wisdom-${candidate.chapter}-${candidate.number}-${Date.now()}`,
      userId,
      passageType: (candidate.chapter?.toLowerCase() || 'saying') as any,
      passageNumber: candidate.number,
      arabicText: candidate.arabicText || 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ.',
      translationText: candidate.translationText || candidate.title || '',
      urduTranslation: candidate.urduTranslation || undefined,
      language: 'english',
      reflectionQuestion: `In this blessed month of ${islamicMonth}, reflect on how Imam Ali's teaching inspires excellence, sincere prayer, and ethical conduct today.`,
      topic: candidate.chapter === 'dua' ? 'supplication' : monthConfig.focus,
      deliveredAt: new Date(),
      createdAt: new Date(),
      interacted: false,
    };

    // If forceRefresh, return immediately with the fresh candidate (no Mongo caching delay)
    if (forceRefresh) {
      return fallbackWisdom;
    }

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
