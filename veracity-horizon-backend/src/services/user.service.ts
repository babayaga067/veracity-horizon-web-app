import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {
  async createUser(userData: CreateUserDTO): Promise<IUser> {
    // Check for duplicate email
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    // Check for duplicate username
    const existingUsername = await userRepository.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new HttpException(400, "Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Create user
    const user = await userRepository.createUser(userData);
    return user;
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpException(400, "Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password, // client password
      user.password        // database password
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid password");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // payload
      SECRET_KEY,
      { expiresIn: "30d" }
    );

    return { user, token };
  }

  //Admin methods

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const updatedUser = await userRepository.update(id, userData);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = await userRepository.delete(id);
    return deleted;
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await userRepository.getAll();
    return users;
  }
}
