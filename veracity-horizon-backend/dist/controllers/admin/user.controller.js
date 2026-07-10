"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const user_service_1 = require("../../services/user.service");
const user_dto_1 = require("../../dtos/user.dto");
const apihelper_util_1 = require("../../utils/apihelper.util");
const http_exception_1 = require("../../exceptions/http-exception");
const userService = new user_service_1.UserService();
function handleControllerError(res, error) {
    if (error instanceof http_exception_1.HttpException) {
        return apihelper_util_1.ApiResponseHelper.error(res, error.message, error.status);
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = error instanceof Error && "status" in error ? error.status : 500;
    return apihelper_util_1.ApiResponseHelper.error(res, message, status);
}
const sanitizeUser = (user) => {
    const { password, ...safeUser } = user.toObject();
    return safeUser;
};
class AdminUserController {
    async createUser(req, res, next) {
        try {
            const userData = user_dto_1.CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return apihelper_util_1.ApiResponseHelper.error(res, userData.error.message, 400);
            }
            const user = await userService.createUser(userData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, sanitizeUser(user), "User created successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid user ID");
            }
            const allowedFields = ["firstName", "lastName", "username", "role", "profileImage", "fullName", "phoneNumber"];
            const updates = {};
            for (const key of allowedFields) {
                if (req.body[key] !== undefined) {
                    updates[key] = req.body[key];
                }
            }
            const updatedUser = await userService.updateUser(id, updates);
            if (!updatedUser) {
                return apihelper_util_1.ApiResponseHelper.error(res, "User not found", 404);
            }
            return apihelper_util_1.ApiResponseHelper.success(res, sanitizeUser(updatedUser), "User updated successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid user ID");
            }
            const deleted = await userService.deleteUser(id);
            if (!deleted) {
                return apihelper_util_1.ApiResponseHelper.error(res, "User not found", 404);
            }
            return apihelper_util_1.ApiResponseHelper.success(res, { deleted }, "User deleted successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async listUsers(req, res, next) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 10);
            const search = req.query.search || "";
            const result = await userService.getAllUsers(page, limit, search);
            const safeUsers = result.users.map((user) => sanitizeUser(user));
            const meta = {
                page: result.totalPages > 0 ? page : 0,
                limit,
                total: result.total,
                totalPages: result.totalPages,
            };
            return apihelper_util_1.ApiResponseHelper.success(res, safeUsers, "Users fetched successfully", 200, meta);
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid user ID");
            }
            const user = await userService.getCurrentUser(id);
            if (!user) {
                return apihelper_util_1.ApiResponseHelper.error(res, "User not found", 404);
            }
            return apihelper_util_1.ApiResponseHelper.success(res, sanitizeUser(user), "User fetched successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
}
exports.AdminUserController = AdminUserController;
//# sourceMappingURL=user.controller.js.map