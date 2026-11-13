import { connectDB } from '../../config/database';
import { ConversationModel, IConversationDocument } from '../models/conversation.model';
import { MessageModel, IMessageDocument } from '../models/message.model';
import { ConversationType, MessageRole } from '../../types/conversation.types';
import { Citation } from '../../types/passage.types';

export class ConversationRepository {
  async createConversation(data: {
    userId: string;
    title: string;
    type?: ConversationType;
    passageRef?: { type: string; number: number };
  }): Promise<IConversationDocument> {
    await connectDB();
    return ConversationModel.create({
      userId: data.userId,
      title: data.title,
      type: data.type || 'general',
      passageRef: data.passageRef || null,
      messageCount: 0,
    });
  }

  async findById(id: string, userId: string): Promise<IConversationDocument | null> {
    await connectDB();
    return ConversationModel.findOne({ _id: id, userId }).exec();
  }

  async listByUser(
    userId: string,
    options: { page?: number; limit?: number; type?: string; archived?: boolean } = {}
  ): Promise<{ conversations: IConversationDocument[]; total: number }> {
    await connectDB();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (options.type) query.type = options.type;
    if (options.archived !== undefined) query.isArchived = options.archived;
    else query.isArchived = false;

    const [conversations, total] = await Promise.all([
      ConversationModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      ConversationModel.countDocuments(query).exec(),
    ]);

    return { conversations, total };
  }

  async addMessage(data: {
    conversationId: string;
    userId: string;
    role: MessageRole;
    content: string;
    citations?: Citation[];
    metadata?: {
      model?: string;
      tokensUsed?: number | null;
      retrievalQuery?: string | null;
      documentsRetrieved?: number;
      latencyMs?: number | null;
      personalizationApplied?: boolean;
    };
  }): Promise<IMessageDocument> {
    await connectDB();
    const message = await MessageModel.create({
      conversationId: data.conversationId,
      userId: data.userId,
      role: data.role,
      content: data.content,
      citations: data.citations || [],
      metadata: data.metadata || {},
    });

    await ConversationModel.findByIdAndUpdate(data.conversationId, {
      $inc: { messageCount: 1 },
      $set: { lastMessageAt: new Date() },
    }).exec();

    return message;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50
  ): Promise<IMessageDocument[]> {
    await connectDB();
    return MessageModel.find({ conversationId, userId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async updateConversation(
    id: string,
    userId: string,
    updates: { title?: string; isArchived?: boolean; summary?: string }
  ): Promise<IConversationDocument | null> {
    await connectDB();
    return ConversationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    ).exec();
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const res = await ConversationModel.findOneAndDelete({ _id: id, userId }).exec();
    if (res) {
      await MessageModel.deleteMany({ conversationId: id, userId }).exec();
      return true;
    }
    return false;
  }

  async setFeedback(
    messageId: string,
    userId: string,
    feedback: { rating: number; comment?: string }
  ): Promise<boolean> {
    await connectDB();
    const res = await MessageModel.findOneAndUpdate(
      { _id: messageId, userId },
      { $set: { feedback } }
    ).exec();
    return !!res;
  }
}

export const conversationRepository = new ConversationRepository();
