import { knowledgeRetriever } from '../rag/retrieval/retriever';
import { learningRepository } from '../db/repositories/learning.repository';
import { getCreativeLLM } from '../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { Difficulty, ILearningPath, ILesson } from '../types/learning.types';
import { v4 as uuidv4 } from 'uuid';

export class PathGenerator {
  /**
   * Generates a personalized, structured learning journey grounded in authentic Nahj al-Balagha passages.
   */
  public async generatePath(
    userId: string,
    topic: string,
    difficulty: Difficulty = 'beginner',
    maxLessons: number = 5
  ): Promise<ILearningPath> {
    // 1. Retrieve most relevant passages for this topic from Vector Store
    const passages = await knowledgeRetriever.retrieve(
      `Teachings of Imam Ali in Nahj al-Balagha regarding ${topic} morals ethics governance`,
      8
    );

    const passageSummaries = passages.map((p) => ({
      type: p.metadata.passageType,
      number: p.metadata.passageNumber,
      title: p.metadata.passageTitle,
      textPreview: p.content.substring(0, 200),
    }));

    // 2. Use LLM to structure a pedagogical curriculum
    const llm = getCreativeLLM();
    const systemPrompt = `You are an expert Islamic curriculum designer for Nahj al-Balagha studies.
Organize the provided authentic passages into a progressive ${difficulty}-level learning path on "${topic}".
Create between 3 and ${maxLessons} sequential lessons.
Output JSON ONLY in the following format:
{
  "title": "Course Title",
  "description": "Engaging course summary",
  "lessons": [
    {
      "order": 1,
      "title": "Lesson title",
      "description": "What will be learned",
      "objectives": ["Objective 1", "Objective 2"],
      "estimatedMinutes": 15,
      "passageRefs": [
        { "type": "sermon|letter|saying", "number": 1, "relevance": "Why this passage belongs here" }
      ]
    }
  ]
}`;

    const prompt = `Available Passages:\n${JSON.stringify(passageSummaries, null, 2)}\n\nDesign the course syllabus now:`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt),
    ]);

    let parsed: any;
    try {
      const cleaned = response.content.toString().replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback structured course
      parsed = {
        title: `Foundations of ${topic.charAt(0).toUpperCase() + topic.slice(1)} in Nahj al-Balagha`,
        description: `A guided study exploring the profound wisdom and ethical directives of Imam Ali regarding ${topic}.`,
        lessons: [
          {
            order: 1,
            title: `Introduction to ${topic}`,
            description: `Core principles and spiritual foundations.`,
            objectives: [`Understand the spiritual roots of ${topic}`, 'Reflect on initial maxims'],
            estimatedMinutes: 15,
            passageRefs: [
              {
                type: passages[0]?.metadata.passageType || 'saying',
                number: passages[0]?.metadata.passageNumber || 1,
                relevance: `Primary foundational maxim on ${topic}`,
              },
            ],
          },
          {
            order: 2,
            title: `Practical Governance & Ethics`,
            description: `How ${topic} translates into daily conduct and leadership.`,
            objectives: ['Analyze Letter 53 and practical instructions', 'Overcome internal obstacles'],
            estimatedMinutes: 20,
            passageRefs: [
              {
                type: 'letter',
                number: 53,
                relevance: 'The universal charter of ethics and fair treatment',
              },
            ],
          },
        ],
      };
    }

    const lessons: ILesson[] = parsed.lessons.map((l: any, idx: number) => ({
      lessonId: uuidv4(),
      order: l.order || idx + 1,
      title: l.title,
      description: l.description,
      passageRefs: l.passageRefs || [],
      objectives: l.objectives || [],
      estimatedMinutes: l.estimatedMinutes || 15,
      status: idx === 0 ? 'available' : 'locked',
      completedAt: null,
    }));

    const pathDoc = await learningRepository.createLearningPath({
      userId,
      title: parsed.title,
      description: parsed.description,
      topic,
      difficulty,
      lessons,
    });

    return pathDoc.toObject() as unknown as ILearningPath;
  }
}

export const pathGenerator = new PathGenerator();
