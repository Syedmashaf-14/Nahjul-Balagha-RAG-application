import { connectDB } from '../../config/database';
import { UserPreferencesModel, IUserPreferencesDocument } from '../models/user-preferences.model';
import { UpdatePreferencesInput, UserPreferences } from '../../types/user.types';

export class UserPreferencesRepository {
  async getByUserId(userId: string): Promise<IUserPreferencesDocument> {
    await connectDB();
    let prefs = await UserPreferencesModel.findOne({ userId }).exec();
    if (!prefs) {
      prefs = await UserPreferencesModel.create({ userId });
    }
    return prefs;
  }

  async updateByUserId(
    userId: string,
    updates: UpdatePreferencesInput
  ): Promise<IUserPreferencesDocument> {
    await connectDB();
    return UserPreferencesModel.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async resetToDefaults(userId: string): Promise<IUserPreferencesDocument> {
    await connectDB();
    await UserPreferencesModel.findOneAndDelete({ userId }).exec();
    return UserPreferencesModel.create({ userId });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await connectDB();
    await UserPreferencesModel.findOneAndDelete({ userId }).exec();
  }
}

export const userPreferencesRepository = new UserPreferencesRepository();
