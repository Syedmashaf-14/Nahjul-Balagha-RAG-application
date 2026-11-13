import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { conversationRepository } from '@/db/repositories/conversation.repository';
import { UpdateConversationSchema } from '@/types/conversation.types';
import { successResponse, errorResponse , formatZodError } from '@/lib/response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const conversation = await conversationRepository.findById(id, userId);

    if (!conversation) {
      return errorResponse('Conversation not found', 404);
    }

    const messages = await conversationRepository.getMessages(id, userId, 100);

    return successResponse({
      conversation,
      messages,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = UpdateConversationSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid update data', 400);
    }

    const updated = await conversationRepository.updateConversation(id, userId, validated.data);
    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const ok = await conversationRepository.deleteConversation(id, userId);
    return successResponse({ deleted: ok });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
