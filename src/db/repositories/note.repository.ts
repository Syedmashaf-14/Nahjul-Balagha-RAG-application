import { connectDB } from '../../config/database';
import { NoteModel, INoteDocument } from '../models/note.model';
import { CollectionModel } from '../models/collection.model';
import { CreateNoteInput, UpdateNoteInput } from '../../types/api.types';

export class NoteRepository {
  async create(userId: string, data: CreateNoteInput): Promise<INoteDocument> {
    await connectDB();
    const note = await NoteModel.create({
      ...data,
      userId,
    });

    if (data.collectionId) {
      await CollectionModel.findByIdAndUpdate(data.collectionId, {
        $inc: { noteCount: 1 },
      }).exec();
    }

    return note;
  }

  async listByUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      collectionId?: string;
      tag?: string;
      passageType?: string;
      passageNumber?: number;
    } = {}
  ): Promise<{ notes: INoteDocument[]; total: number }> {
    await connectDB();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (options.collectionId) query.collectionId = options.collectionId;
    if (options.tag) query.tags = options.tag;
    if (options.passageType && options.passageNumber) {
      query['passageRef.type'] = options.passageType;
      query['passageRef.number'] = options.passageNumber;
    }

    const [notes, total] = await Promise.all([
      NoteModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      NoteModel.countDocuments(query).exec(),
    ]);

    return { notes, total };
  }

  async findById(id: string, userId: string): Promise<INoteDocument | null> {
    await connectDB();
    return NoteModel.findOne({ _id: id, userId }).exec();
  }

  async update(id: string, userId: string, data: UpdateNoteInput): Promise<INoteDocument | null> {
    await connectDB();
    return NoteModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    await connectDB();
    const note = await NoteModel.findOneAndDelete({ _id: id, userId }).exec();
    if (note && note.collectionId) {
      await CollectionModel.findByIdAndUpdate(note.collectionId, {
        $inc: { noteCount: -1 },
      }).exec();
    }
    return !!note;
  }

  async search(userId: string, term: string): Promise<INoteDocument[]> {
    await connectDB();
    return NoteModel.find({
      userId,
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
      ],
    })
      .limit(30)
      .exec();
  }
}

export const noteRepository = new NoteRepository();
