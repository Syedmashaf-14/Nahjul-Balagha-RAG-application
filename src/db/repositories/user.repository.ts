import { connectDB } from '../../config/database';
import { UserModel, IUserDocument } from '../models/user.model';
import { RegisterUserInput, UpdateProfileInput } from '../../types/user.types';
import bcrypt from 'bcryptjs';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    await connectDB();
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    await connectDB();
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(data: RegisterUserInput): Promise<IUserDocument> {
    await connectDB();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = new UserModel({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
    });

    return user.save();
  }

  async updateProfile(id: string, data: UpdateProfileInput): Promise<IUserDocument | null> {
    await connectDB();
    return UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await connectDB();
    await UserModel.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } }).exec();
  }

  async deleteAccount(id: string): Promise<boolean> {
    await connectDB();
    const res = await UserModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}

export const userRepository = new UserRepository();
