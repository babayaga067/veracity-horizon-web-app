import { UserModel } from "../models/user.model";
import type { IUser } from "../models/user.model"; 

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  getAll(page?: number, limit?: number, search?: string): Promise<{ users: IUser[]; total: number; totalPages: number }>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findOne({ _id: id });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username });
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(user);
  }

  async getAll(page: number = 1, limit: number = 10, search: string = ""): Promise<{ users: IUser[]; total: number; totalPages: number }> {
    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const users = await UserModel.find(query).skip(skip).limit(limit);

    return { users, total, totalPages };
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, user, { returnDocument: "after" });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.findByIdAndDelete(id);
    return !!deleted;
  }
}
