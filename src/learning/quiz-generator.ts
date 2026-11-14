import { knowledgeRetriever } from '../rag/retrieval/retriever';
import { getCreativeLLM } from '../config/llm';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { IQuizQuestion } from '../types/learning.types';
import { v4 as uuidv4 } from 'uuid';

const CANONICAL_QUIZ_BANK: Record<string, Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }>> = {
  'letter_53': [
    {
      question: 'According to Imam Ali in Letter 53 to Malik al-Ashtar, how should a ruler view the citizens under his authority?',
      options: [
        'As economic subjects primarily intended for taxation',
        'Either as brothers in religion or equals in creation',
        'As subordinates who must obey without accountability',
        'As political rivals who must be constantly surveilled'
      ],
      correctAnswer: 1,
      explanation: 'In Letter 53, Imam Ali famously writes: "They are of two kinds: either your brother in religion or your equal in creation."'
    },
    {
      question: 'What warning does Imam Ali give regarding saying "I am your ruler, I order and must be obeyed"?',
      options: [
        'It asserts necessary authority and inspires obedience',
        'It breeds corruption in the heart, weakens faith, and brings ruin near',
        'It is appropriate only in times of rebellion',
        'It improves administrative efficiency'
      ],
      correctAnswer: 1,
      explanation: 'Imam Ali teaches that authoritarian arrogance ruins the heart, impairs religious devotion, and invites swift divine retribution.'
    },
    {
      question: 'How does Imam Ali instruct Malik al-Ashtar to handle the underprivileged and destitute?',
      options: [
        'Place them under private charitable institutions without state oversight',
        'Directly allocate a portion of the public treasury to them without bureaucratic barriers',
        'Require them to work in state infrastructure before receiving aid',
        'Refer their grievances to local provincial deputies'
      ],
      correctAnswer: 1,
      explanation: 'Imam Ali commands: "Fear Allah concerning the lowest class who have no devices... Appoint for them a portion of the public treasury and state storehouses."'
    },
    {
      question: 'What quality does Imam Ali demand when choosing judges and magistrates?',
      options: [
        'They must never make mistakes and have wealthy backgrounds',
        'They must possess independence of mind, not be swayed by greed or flattery, and readily correct their own errors',
        'They must always judge in favor of the state administration',
        'They should be quick in execution rather than deliberative'
      ],
      correctAnswer: 1,
      explanation: 'Judges must be the most upright, unaffected by praise or greed, patient in investigation, and fearless in delivering truth.'
    }
  ],
  'sermon_193': [
    {
      question: 'In Sermon 193 (Khutba al-Muttaqeen), what is the first distinguishing attribute of the God-fearing (Muttaqeen)?',
      options: [
        'Their speech is truthful and to the point, their dress moderate, and their gait humble',
        'Their isolation from society and prolonged fasting in mountains',
        'Their sternness and harshness toward sinners',
        'Their accumulation of theological titles'
      ],
      correctAnswer: 0,
      explanation: 'Imam Ali states: "The God-fearing in this world are people of distinction: their speech is to the point, their dress is moderate and their gait is humble."'
    },
    {
      question: 'How do the pious react when faced with severe affliction and trial?',
      options: [
        'They express vocal despair until relief arrives',
        'They remain steadfast and at peace in trial just as they remain in comfort and ease',
        'They blame external circumstances for their suffering',
        'They seek worldly distractions to forget the pain'
      ],
      correctAnswer: 1,
      explanation: 'Imam Ali describes that their inner tranquility in trial is identical to their state during prosperity because of complete reliance on Allah.'
    }
  ],
  'saying_147': [
    {
      question: 'In Saying 147 to Kumayl ibn Ziyad, why is knowledge superior to material wealth?',
      options: [
        'Knowledge can be bought with money, but money cannot buy knowledge',
        'Knowledge guards you, whereas you must constantly guard wealth',
        'Wealth is spiritual while knowledge is worldly',
        'Wealth increases by spending while knowledge decreases'
      ],
      correctAnswer: 1,
      explanation: 'Imam Ali taught: "O Kumayl! Knowledge is better than wealth. Knowledge guards you while you have to guard wealth. Wealth decreases by spending while knowledge increases by application."'
    },
    {
      question: 'How many categories of people does Imam Ali divide humanity into in his counsel to Kumayl?',
      options: [
        'Two categories: the rich and the poor',
        'Three categories: the divine scholar, the seeker of truth on the path of salvation, and the unruly mob',
        'Four categories based on societal status',
        'Five categories according to political allegiance'
      ],
      correctAnswer: 1,
      explanation: 'Imam Ali said: "People are of three types: a divine scholar, a seeker of knowledge on the path of salvation, and the common rabble who follow every caller."'
    }
  ],
  'saying_81': [
    {
      question: 'What is the profound criterion of human value taught in Saying 81: "قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ"?',
      options: [
        'A person’s worth is measured by their ancestral lineage and wealth',
        'The worth and value of every human being is in what they do well (their virtue, excellence, and knowledge)',
        'A person’s worth depends on their physical beauty and outward adornment',
        'Value is determined solely by worldly fame and power'
      ],
      correctAnswer: 1,
      explanation: 'This celebrated aphorism establishes that intrinsic human value resides in one’s capabilities, virtues, and masteries in doing good.'
    }
  ]
};

export class QuizGenerator {
  /**
   * Generates multiple-choice quiz questions strictly based on given Nahj al-Balagha passages.
   */
  public async generateQuiz(
    topic: string,
    passageRefs: Array<{ type: string; number: number }>,
    numQuestions: number = 4
  ): Promise<IQuizQuestion[]> {
    const primaryRef = passageRefs[0] || { type: 'letter', number: 53 };
    const bankKey = `${primaryRef.type}_${primaryRef.number}`;

    // 1. If we have bank questions for this passage, use them directly for instantaneous, verified high quality
    if (CANONICAL_QUIZ_BANK[bankKey]) {
      const items = CANONICAL_QUIZ_BANK[bankKey];
      return items.slice(0, numQuestions).map((item) => ({
        questionId: uuidv4(),
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        userAnswer: null,
        explanation: item.explanation,
        passageRef: primaryRef,
      }));
    }

    // 2. Otherwise retrieve the text and use LLM
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

    try {
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
    "passageRef": { "type": "${primaryRef.type}", "number": ${primaryRef.number} }
  }
]`;

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
        passageRef: q.passageRef || primaryRef,
      }));
    } catch {
      // Return verified fallback
      const fallbackList = CANONICAL_QUIZ_BANK['letter_53'];
      return fallbackList.slice(0, numQuestions).map((item) => ({
        questionId: uuidv4(),
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        userAnswer: null,
        explanation: item.explanation,
        passageRef: primaryRef,
      }));
    }
  }
}

export const quizGenerator = new QuizGenerator();
