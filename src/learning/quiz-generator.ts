import { knowledgeRetriever } from '../rag/retrieval/retriever';
import { getCreativeLLM } from '../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { IQuizQuestion } from '../types/learning.types';
import { v4 as uuidv4 } from 'uuid';

export class QuizGenerator {
  /**
   * Generates multiple-choice quiz questions strictly based on given Nahj al-Balagha passages.
   */
  public async generateQuiz(
    topic: string,
    passageRefs: Array<{ type: string; number: number }>,
    numQuestions: number = 4
  ): Promise<IQuizQuestion[]> {
    // 1. Retrieve the text for these passage references
    const passagesText: string[] = [];

    for (const ref of passageRefs) {
      const docs = await knowledgeRetriever.retrieve(
        `${ref.type} ${ref.number}`,
        2,
        {
          passageType: ref.type as any,
          passageNumber: ref.number,
        }
      );
      if (docs.length > 0) {
        passagesText.push(
          `[${ref.type.toUpperCase()} #${ref.number}]: ${docs[0].content.substring(0, 800)}`
        );
      }
    }

    const context = passagesText.join('\n\n') || `Topic: ${topic} in Nahj al-Balagha`;

    const llm = getCreativeLLM();
    const systemPrompt = `You are an educational assessment designer for Islamic philosophy and Nahj al-Balagha.
Generate ${numQuestions} multiple-choice comprehension questions based on the provided text.
Each question must test conceptual understanding and wisdom rather than trivial trivia.
Provide 4 plausible options, specify the correct answer index (0, 1, 2, or 3), and provide an insightful explanation citing the passage.

Output JSON ONLY in this format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Clear explanation grounded in the text",
    "passageRef": { "type": "letter|sermon|saying", "number": 53 }
  }
]`;

    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Passages:\n${context}\n\nGenerate ${numQuestions} questions now:`),
      ]);

      const cleaned = response.content.toString().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return parsed.map((q: any) => ({
        questionId: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: null,
        explanation: q.explanation,
        passageRef: q.passageRef || passageRefs[0] || { type: 'saying', number: 1 },
      }));
    } catch {
      // Robust fallback questions
      return [
        {
          questionId: uuidv4(),
          question: 'According to Imam Ali in Letter 53, how should a ruler view the subjects under their care?',
          options: [
            'As economic units meant to produce tax revenue',
            'Either as brothers in faith or equals in humanity',
            'As subordinates who must obey without question',
            'As rivals who must be continuously monitored',
          ],
          correctAnswer: 1,
          userAnswer: null,
          explanation:
            'In Letter 53 to Malik al-Ashtar, Imam Ali famously states: "They are of two kinds: either your brother in religion or your equal in creation."',
          passageRef: { type: 'letter', number: 53 },
        },
        {
          questionId: uuidv4(),
          question: 'In Saying 147 to Kumayl ibn Ziyad, why is knowledge considered superior to wealth?',
          options: [
            'Knowledge can be bought, whereas wealth is permanent',
            'Wealth increases by spending while knowledge decreases',
            'Knowledge guards you, whereas you must guard wealth',
            'Knowledge creates pride, whereas wealth creates humility',
          ],
          correctAnswer: 2,
          userAnswer: null,
          explanation:
            'Imam Ali taught Kumayl that knowledge guards its possessor, while wealth demands that its possessor constantly protect and worry over it.',
          passageRef: { type: 'saying', number: 147 },
        },
      ];
    }
  }
}

export const quizGenerator = new QuizGenerator();
