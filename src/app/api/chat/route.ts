import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/config/auth';
import { conversationRepository } from '@/db/repositories/conversation.repository';
import { ragService } from '@/rag/generation/rag-service';
import { ensureKnowledgeBaseSeeded } from '@/ingestion/seed-runner';
import { ChatRequestSchema, ChatResponsePayload } from '@/types/conversation.types';
import { successResponse, errorResponse, formatZodError } from '@/lib/response';

// Seed knowledge base on initial boot
let isSeeded = false;

export async function POST(req: NextRequest) {
  try {
    if (!isSeeded) {
      await ensureKnowledgeBaseSeeded();
      isSeeded = true;
    }

    const userId = await getSessionUserId();
    const body = await req.json();
    const validated = ChatRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse(formatZodError(validated.error) || 'Invalid chat message payload', 400);
    }

    const { message, image, passageRef, overrides } = validated.data;
    let conversationId = validated.data.conversationId;
    let conversationSummary: string | null = null;

    try {
      // Create a new conversation if not specified
      if (!conversationId) {
        const title =
          message.length > 50
            ? `${message.substring(0, 47)}...`
            : message;

        const newConv = await conversationRepository.createConversation({
          userId,
          title,
          type: passageRef ? 'passage_exploration' : 'general',
          passageRef,
        });
        conversationId = newConv._id.toString();
      }

      // Record user message in MongoDB
      await conversationRepository.addMessage({
        conversationId,
        userId,
        role: 'user',
        content: message,
        imageUrl: image || null,
      });

      // Fetch conversation summary or recent messages to provide sliding conversational memory
      const recentMessages = await conversationRepository.getMessages(conversationId, userId, 6);
      conversationSummary = recentMessages
        .map((m) => {
          const cit = (m as any).citations?.[0];
          const citRef = cit ? ` [REFERENCED: ${cit.passageType?.toUpperCase()} #${cit.passageNumber}]` : '';
          return `${m.role.toUpperCase()}: ${m.content.substring(0, 300)}${citRef}`;
        })
        .join('\n');
    } catch (dbErr) {
      console.warn('MongoDB conversation persistence skipped (offline/connecting):', (dbErr as any)?.message);
      conversationId = conversationId || `conv-${Date.now()}`;
    }

    // Run Personalized RAG Pipeline (supporting multimodal vision images)
    const ragResult = await ragService.generateAnswer(
      userId,
      {
        message,
        image,
        passageRef,
        overrides,
      },
      conversationSummary
    );

    // Record assistant's grounded response in MongoDB with exact citations
    let messageId = Date.now().toString();
    try {
      const savedAssistantMsg = await conversationRepository.addMessage({
        conversationId,
        userId,
        role: 'assistant',
        content: ragResult.answer,
        citations: ragResult.citations,
        metadata: {
          model: 'openai/gpt-4o-mini',
          personalizationApplied: true,
          documentsRetrieved: ragResult.citations.length,
        },
      });
      messageId = savedAssistantMsg._id.toString();
    } catch (dbErr) {
      console.warn('MongoDB message persistence skipped (offline/connecting):', (dbErr as any)?.message);
    }

    const payload: ChatResponsePayload = {
      conversationId,
      messageId,
      content: ragResult.answer,
      citations: ragResult.citations,
      relatedTopics: ragResult.relatedTopics,
      suggestedFollowUps: ragResult.suggestedFollowUps,
      confidenceLevel: ragResult.confidenceLevel,
      disclaimer: ragResult.disclaimer,
    };

    return successResponse(payload);
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return errorResponse(err.message || 'Error processing chat query', 500);
  }
}
