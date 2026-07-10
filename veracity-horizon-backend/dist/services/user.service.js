"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const http_exception_1 = require("../exceptions/http-exception");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("../configs/constant");
const userRepository = new user_repository_1.UserMongoRepository();
class UserService {
    async createUser(userData) {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new http_exception_1.HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new http_exception_1.HttpException(400, "Username already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        const userToCreate = { ...userData, password: hashedPassword };
        const user = await userRepository.createUser(userToCreate);
        return user;
    }
    async loginUser(loginData) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new http_exception_1.HttpException(400, "Invalid email");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HttpException(400, "Invalid password");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, constant_1.SECRET_KEY, { expiresIn: "24h" });
        return { user, token };
    }
    async getCurrentUser(id) {
        return await userRepository.getUserById(id);
    }
    async logoutUser() {
        return true;
    }
    async updateUser(id, userData) {
        const updateData = { ...userData };
        if (userData.password) {
            updateData.password = await bcryptjs_1.default.hash(userData.password, 10);
        }
        const updatedUser = await userRepository.update(id, updateData);
        return updatedUser;
    }
    async deleteUser(id) {
        const deleted = await userRepository.delete(id);
        return deleted;
    }
    async getAllUsers(page = 1, limit = 10, search = "") {
        const result = await userRepository.getAll(page, limit, search);
        return result;
    }
    async updatePassword(id, currentPassword, newPassword, confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new http_exception_1.HttpException(400, "All password fields are required");
        }
        if (newPassword !== confirmPassword) {
            throw new http_exception_1.HttpException(400, "New passwords do not match");
        }
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new http_exception_1.HttpException(404, "User not found");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new http_exception_1.HttpException(400, "Current password is incorrect");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        const updatedUser = await userRepository.update(id, { password: hashedPassword });
        return updatedUser;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map