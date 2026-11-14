import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { learningRepository } from '@/db/repositories/learning.repository';
import { pathGenerator } from '@/learning/path-generator';
import { GenerateLearningPathSchema } from '@/types/learning.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';
import { ensureKnowledgeBaseSeeded } from '@/ingestion/seed-runner';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    await ensureKnowledgeBaseSeeded();
    const userId = await getSessionUserId();
    let paths = await learningRepository.getLearningPaths(userId);

    // If no paths exist yet, auto-generate canonical "Leadership with Integrity" path matching UI
    if (!paths || paths.length === 0) {
      const defaultLessons = [
        {
          lessonId: uuidv4(),
          order: 1,
          title: 'The Sacred Trust of Leadership',
          description: 'Understanding leadership not as privilege or dominion, but as an onerous divine trust (Amanah).',
          objectives: ['Analyze Letter 53 opening commands to Malik al-Ashtar', 'Internalize the concept of political responsibility'],
          estimatedMinutes: 8,
          status: 'completed' as const,
          completedAt: new Date(),
          passageRefs: [{ type: 'letter' as const, number: 53, relevance: 'The mandate and purpose of righteous governance' }],
        },
        {
          lessonId: uuidv4(),
          order: 2,
          title: 'Justice and Equal Treatment of Citizens',
          description: 'The golden rule of governance: "People are either your brothers in faith or your equals in creation."',
          objectives: ['Explore the universal declaration of human equality', 'Implement fair tax and administrative systems'],
          estimatedMinutes: 12,
          status: 'completed' as const,
          completedAt: new Date(),
          passageRefs: [{ type: 'letter' as const, number: 53, relevance: 'Universal charter of human dignity' }],
        },
        {
          lessonId: uuidv4(),
          order: 3,
          title: 'Justice as the Pillar of Leadership',
          description: 'Explore how justice, responsibility, and compassion shape ethical governance through Letter 53.',
          objectives: ['Examine the balance between state power and individual mercy', 'Guard against pride and authoritarianism'],
          estimatedMinutes: 14,
          status: 'in_progress' as const,
          completedAt: null,
          passageRefs: [{ type: 'letter' as const, number: 53, relevance: 'Letter 53 to Malik al-Ashtar' }],
        },
        {
          lessonId: uuidv4(),
          order: 4,
          title: 'Compassion Toward Those You Lead',
          description: 'Cultivating genuine empathy, mercy, and accessibility toward the poor, vulnerable, and destitute.',
          objectives: ['Study Imam Ali’s instructions regarding marginalized classes', 'Remove barriers between rulers and citizens'],
          estimatedMinutes: 14,
          status: 'available' as const,
          completedAt: null,
          passageRefs: [{ type: 'letter' as const, number: 53, relevance: 'Care for orphans, widows, and the oppressed' }],
        },
        {
          lessonId: uuidv4(),
          order: 5,
          title: 'Counsel, Accountability, and Wisdom',
          description: 'Selecting righteous advisers, avoiding flatterers, and instituting judicial integrity.',
          objectives: ['Establish criteria for appointing judges and counselors', 'Protect public treasuries against corruption'],
          estimatedMinutes: 16,
          status: 'locked' as const,
          completedAt: null,
          passageRefs: [{ type: 'sermon' as const, number: 216, relevance: 'Mutual rights of the ruler and the ruled' }],
        },
        {
          lessonId: uuidv4(),
          order: 6,
          title: 'The Superiority of Moral Knowledge (Kumayl)',
          description: 'Why knowledge is superior to material wealth and how knowledge guards its possessor.',
          objectives: ['Study Saying 147 given to Kumayl ibn Ziyad', 'Distinguish true scholars from greedy accumulators'],
          estimatedMinutes: 10,
          status: 'locked' as const,
          completedAt: null,
          passageRefs: [{ type: 'saying' as const, number: 147, relevance: 'The testament on knowledge vs wealth' }],
        },
        {
          lessonId: uuidv4(),
          order: 7,
          title: 'The Character of the Truly Pious (Muttaqin)',
          description: 'The sublime spiritual and ethical attributes of the God-fearing described in Sermon 193.',
          objectives: ['Contemplate modesty in speech, gaze, and consumption', 'Transform inner spiritual awareness into outer virtue'],
          estimatedMinutes: 18,
          status: 'locked' as const,
          completedAt: null,
          passageRefs: [{ type: 'sermon' as const, number: 193, relevance: 'Khutba al-Muttaqeen to Hammam' }],
        },
        {
          lessonId: uuidv4(),
          order: 8,
          title: 'Absolute Integrity and Refusal of Bribery',
          description: 'The famous declaration of Sermon 224: refusing to snatch a grain from an ant for seven heavens.',
          objectives: ['Analyze Imam Ali’s standard of zero corruption', 'Apply incorruptibility in modern life'],
          estimatedMinutes: 15,
          status: 'locked' as const,
          completedAt: null,
          passageRefs: [{ type: 'sermon' as const, number: 224, relevance: 'The story of Aqil and the hot iron' }],
        },
      ];

      const initialPath = await learningRepository.createLearningPath({
        userId,
        title: 'Leadership with integrity',
        description: 'A path shaped around your interests in leadership, ethics, and character through Letter 53, Sermon 216, and foundational sayings.',
        topic: 'governance',
        difficulty: 'intermediate',
        lessons: defaultLessons,
      });

      // Mark first 2 completed to match 38% progress in screenshot
      await learningRepository.markLessonComplete(initialPath._id.toString(), defaultLessons[0].lessonId, userId);
      await learningRepository.markLessonComplete(initialPath._id.toString(), defaultLessons[1].lessonId, userId);

      paths = await learningRepository.getLearningPaths(userId);
    }

    return successResponse(paths);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureKnowledgeBaseSeeded();
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = GenerateLearningPathSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid parameters', 400);
    }

    const { topic, difficulty, maxLessons } = validated.data;
    const path = await pathGenerator.generatePath(userId, topic, difficulty, maxLessons);

    return successResponse(path, 201);
  } catch (err: any) {
    console.error('Learning Path Generation Error:', err);
    return errorResponse(err.message || 'Failed to generate learning path', 500);
  }
}
