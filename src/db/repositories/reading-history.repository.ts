import { connectDB } from '../../config/database';
import { ReadingHistoryModel, IReadingHistoryDocument } from '../models/reading-history.model';

export class ReadingHistoryRepository {
  async recordInteraction(data: {
    userId: string;
    passageType: string;
    passageNumber: number;
    interactionType: string;
    duration?: number | null;
  }): Promise<IReadingHistoryDocument> {
    await connectDB();
    return ReadingHistoryModel.create(data);
  }

  async getRecentHistory(userId: string, limit: number = 20): Promise<IReadingHistoryDocument[]> {
    await connectDB();
    return ReadingHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async getMostExploredPassages(
    userId: string,
    limit: number = 10
  ): Promise<Array<{ passageType: string; passageNumber: number; count: number }>> {
    await connectDB();
    return ReadingHistoryModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { passageType: '$passageType', passageNumber: '$passageNumber' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          passageType: '$_id.passageType',
          passageNumber: '$_id.passageNumber',
          count: 1,
        },
      },
    ]);
  }
}

export const readingHistoryRepository = new ReadingHistoryRepository();
