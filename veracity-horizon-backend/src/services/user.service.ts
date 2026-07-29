import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../configs/email";
import { SECRET_KEY, CLIENT_URL } from "../configs/constant";
import { cleanImageUrl } from "../utils/image.util";

const userRepository = new UserMongoRepository();

export const sanitizeUser = (user: unknown): Record<string, unknown> => {
  if (typeof user !== "object" || user === null) return {};
  const doc = user as Record<string, unknown> & { toObject?: () => Record<string, unknown> };
  const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const { password, ...safeUser } = plain;
  if (safeUser.profileImage && typeof safeUser.profileImage === "string") {
    safeUser.profileImage = cleanImageUrl(safeUser.profileImage);
  }
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

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await userRepository.getUserByEmail(email);
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

  async sendVerificationEmail(email: string) {
    if (!email) {
      throw new HttpException(400, "Email is required");
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    try {
      const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
      const verificationLink = `${CLIENT_URL}/email-verification?token=${token}`;
      const html = `<p>Click <a href="${verificationLink}">here</a> to verify your email address. This link will expire in 1 hour.</p>`;
      await sendEmail(user.email, "Verify Your Email", html);
      return { user, token };
    } catch (error) {
      console.error("Email send failed:", error);
      throw new HttpException(500, "Failed to send verification email. Please try again later.");
    }
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new HttpException(400, "Token is required");
    }

    const decoded: any = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const updatedUser = await userRepository.update(userId, { isVerified: true });
    return updatedUser;
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) {
      throw new HttpException(400, "Email is required");
    }

    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      return { token: null };
    }

    try {
      const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
      const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
      const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
      await sendEmail(user.email, "Password Reset", html);
      return { user, token };
    } catch (error) {
      console.error("Email send failed:", error);
      throw new HttpException(500, "Failed to send reset email. Please try again later.");
    }
  }

  async resetPassword(token?: string, newPassword?: string) {
    try {
      if (!token || !newPassword) {
        throw new HttpException(400, "Token and new password are required");
      }
      const decoded: any = jwt.verify(token, SECRET_KEY);
      const userId = decoded.id;
      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userRepository.update(userId, { password: hashedPassword });
      return user;
    } catch (error) {
      throw new HttpException(400, "Invalid or expired token");
    }
  }
}
