import { connectDB } from '../../config/database';
import { CollectionModel, ICollectionDocument } from '../models/collection.model';
import { BookmarkModel } from '../models/bookmark.model';
import { NoteModel } from '../models/note.model';
import { CreateCollectionInput, UpdateCollectionSchema } from '../../types/api.types';

export class CollectionRepository {
  async create(userId: string, data: CreateCollectionInput): Promise<ICollectionDocument> {
    await connectDB();
    return CollectionModel.create({
      ...data,
      userId,
    });
  }

  async listByUser(userId: string): Promise<ICollectionDocument[]> {
    await connectDB();
    return CollectionModel.find({ userId }).sort({ name: 1 }).exec();
  }

  async findById(id: string, userId: string): Promise<ICollectionDocument | null> {
    await connectDB();
    return CollectionModel.findOne({ _id: id, userId }).exec();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<CreateCollectionInput>
  ): Promise<ICollectionDocument | null> {
    await connectDB();
    return CollectionModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    ).exec();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const res = await CollectionModel.findOneAndDelete({ _id: id, userId }).exec();
    if (res) {
      // Unlink collection references rather than cascading deletion
      await BookmarkModel.updateMany({ collectionId: id, userId }, { $set: { collectionId: null } });
      await NoteModel.updateMany({ collectionId: id, userId }, { $set: { collectionId: null } });
      return true;
    }
    return false;
  }
}

export const collectionRepository = new CollectionRepository();
