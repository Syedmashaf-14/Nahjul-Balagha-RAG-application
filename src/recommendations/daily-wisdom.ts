import { connectDB } from '../config/database';
import { DailyWisdomModel } from '../db/models/daily-wisdom.model';
import { userPreferencesRepository } from '../db/repositories/user-preferences.repository';
import { knowledgeRetriever } from '../rag/retrieval/retriever';
import { getCreativeLLM } from '../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { IDailyWisdom } from '../types/api.types';

export class DailyWisdomService {
  /**
   * Retrieves today's personalized wisdom or generates a fresh one.
   */
  public async getDailyWisdom(userId: string): Promise<IDailyWisdom> {
    const fallbackWisdom: IDailyWisdom = {
      _id: 'daily-wisdom-default-1',
      userId,
      passageType: 'saying',
      passageNumber: 81,
      arabicText: 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ.',
      translationText: 'The worth of every person is in what they do well.',
      language: 'english',
      reflectionQuestion: 'A brief teaching on excellence, purpose, and recognizing the value carried in one’s abilities.',
      topic: 'Wisdom',
      deliveredAt: new Date(),
      createdAt: new Date(),
      interacted: false,
    };

    try {
      await connectDB();

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      // 1. Check if already generated for today
      const existing = await DailyWisdomModel.findOne({
        userId,
        deliveredAt: { $gte: startOfToday },
      }).exec();

      if (existing) {
        return existing.toObject() as unknown as IDailyWisdom;
      }

      // 2. Fetch user preferences
      const prefs = await userPreferencesRepository.getByUserId(userId);
      const favoriteTopic =
        prefs.topicsOfInterest?.[0] || prefs.learningObjectives?.[0] || 'wisdom';

      // 3. Retrieve an inspiring passage
      const docs = await knowledgeRetriever.retrieve(
        `Pious wisdom, ethics, and character in Nahj al-Balagha regarding ${favoriteTopic}`,
        4
      );

      const doc = docs[Math.floor(Math.random() * (docs.length || 1))] || {
        content: fallbackWisdom.translationText,
        metadata: {
          passageType: fallbackWisdom.passageType,
          passageNumber: fallbackWisdom.passageNumber,
          arabicOriginal: fallbackWisdom.arabicText,
          language: fallbackWisdom.language,
          topics: [favoriteTopic],
        },
      };

      // 4. Generate an introspective reflection question
      let reflectionQuestion = fallbackWisdom.reflectionQuestion;

      try {
        const llm = getCreativeLLM();
        const response = await llm.invoke([
          new SystemMessage(
            'You are a spiritual mentor. Write a single short, deeply reflective question for a seeker contemplating this passage from Nahj al-Balagha. Return ONLY the question.'
          ),
          new HumanMessage(`Passage: "${doc.content}"`),
        ]);
        reflectionQuestion = response.content.toString().trim();
      } catch {
        // Use fallback question
      }

      // 5. Store in MongoDB
      const wisdom = await DailyWisdomModel.create({
        userId,
        passageType: doc.metadata.passageType,
        passageNumber: doc.metadata.passageNumber,
        arabicText: doc.metadata.arabicOriginal || null,
        translationText: doc.content,
        language: doc.metadata.language || 'english',
        reflectionQuestion,
        topic: favoriteTopic,
        deliveredAt: new Date(),
        interacted: false,
      });

      return wisdom.toObject() as unknown as IDailyWisdom;
    } catch (err) {
      console.warn('DailyWisdom falling back to static authentic passage:', (err as any)?.message);
      return fallbackWisdom;
    }
  }
}

export const dailyWisdomService = new DailyWisdomService();
