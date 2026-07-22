import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export const sanitizeUser = (user: unknown): Record<string, unknown> => {
  if (typeof user !== "object" || user === null) return {};
  const doc = user as Record<string, unknown> & { toObject?: () => Record<string, unknown> };
  const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const { password, ...safeUser } = plain;
  return safeUser;
};

export class UserService {
  async createUser(userData: CreateUserDTO, role?: string): Promise<IUser> {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const existingUsername = await userRepository.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new HttpException(400, "Username already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userToCreate = { ...userData, password: hashedPassword, role: (role || "user") as "admin" | "user" };

    const user = await userRepository.createUser(userToCreate);
    return user;
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpException(400, "Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid password");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    return { user, token };
  }

  async getCurrentUser(id: string): Promise<IUser | null> {
    return await userRepository.getUserById(id);
  }

  async logoutUser(): Promise<boolean> {
    return true;
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<IUser | null> {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      throw new HttpException(404, "User not found");
    }

    if (userData.email && userData.email !== existingUser.email) {
      const existingEmail = await userRepository.getUserByEmail(userData.email);
      if (existingEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }

    if (userData.username && userData.username !== existingUser.username) {
      const existingUsername = await userRepository.getUserByUsername(userData.username);
      if (existingUsername) {
        throw new HttpException(400, "Username already exists");
      }
    }

    const updateData = { ...userData } as Partial<IUser>;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await userRepository.update(id, updateData);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = await userRepository.delete(id);
    return deleted;
  }

  async getAllUsers(page: number = 1, limit: number = 10, search: string = ""): Promise<{ users: IUser[]; total: number; totalPages: number }> {
    const result = await userRepository.getAll(page, limit, search);
    return result;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string, confirmPassword: string): Promise<IUser | null> {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new HttpException(400, "All password fields are required");
    }
    if (newPassword !== confirmPassword) {
      throw new HttpException(400, "New passwords do not match");
    }

    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await userRepository.update(id, { password: hashedPassword });
    return updatedUser;
  }
}
