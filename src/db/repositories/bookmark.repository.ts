import { connectDB } from '../../config/database';
import { BookmarkModel, IBookmarkDocument } from '../models/bookmark.model';
import { CollectionModel } from '../models/collection.model';
import { CreateBookmarkInput } from '../../types/api.types';

export class BookmarkRepository {
  async create(userId: string, data: CreateBookmarkInput): Promise<IBookmarkDocument> {
    await connectDB();
    const bookmark = await BookmarkModel.create({
      ...data,
      userId,
    });

    if (data.collectionId) {
      await CollectionModel.findByIdAndUpdate(data.collectionId, {
        $inc: { bookmarkCount: 1 },
      }).exec();
    }

    return bookmark;
  }

  async listByUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      passageType?: string;
      collectionId?: string;
      tag?: string;
    } = {}
  ): Promise<{ bookmarks: IBookmarkDocument[]; total: number }> {
    await connectDB();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (options.passageType) query.passageType = options.passageType;
    if (options.collectionId) query.collectionId = options.collectionId;
    if (options.tag) query.tags = options.tag;

    const [bookmarks, total] = await Promise.all([
      BookmarkModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      BookmarkModel.countDocuments(query).exec(),
    ]);

    return { bookmarks, total };
  }

  async findById(id: string, userId: string): Promise<IBookmarkDocument | null> {
    await connectDB();
    return BookmarkModel.findOne({ _id: id, userId }).exec();
  }

  async isBookmarked(
    userId: string,
    passageType: string,
    passageNumber: number
  ): Promise<boolean> {
    await connectDB();
    const exists = await BookmarkModel.exists({ userId, passageType, passageNumber });
    return !!exists;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const bookmark = await BookmarkModel.findOneAndDelete({ _id: id, userId }).exec();
    if (bookmark && bookmark.collectionId) {
      await CollectionModel.findByIdAndUpdate(bookmark.collectionId, {
        $inc: { bookmarkCount: -1 },
      }).exec();
      return true;
    }
    return !!bookmark;
  }

  async search(userId: string, term: string): Promise<IBookmarkDocument[]> {
    await connectDB();
    return BookmarkModel.find({
      userId,
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { translationText: { $regex: term, $options: 'i' } },
        { note: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
      ],
    })
      .limit(30)
      .exec();
  }
}

export const bookmarkRepository = new BookmarkRepository();
