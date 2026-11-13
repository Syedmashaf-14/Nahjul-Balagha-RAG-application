import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { conversationRepository } from '@/db/repositories/conversation.repository';
import { ChatFeedbackSchema } from '@/types/conversation.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = ChatFeedbackSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid feedback', 400);
    }

    const ok = await conversationRepository.setFeedback(
      validated.data.messageId,
      userId,
      {
        rating: validated.data.rating,
        comment: validated.data.comment,
      }
    );

    return successResponse({ recorded: ok });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
