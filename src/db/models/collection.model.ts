import mongoose, { Schema, Document } from 'mongoose';
import { ICollection } from '../../types/api.types';

export interface ICollectionDocument extends Omit<ICollection, '_id'>, Document {}

const CollectionSchema = new Schema<ICollectionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: '#0ea5e9',
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    noteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const CollectionModel =
  mongoose.models.Collection || mongoose.model<ICollectionDocument>('Collection', CollectionSchema);
