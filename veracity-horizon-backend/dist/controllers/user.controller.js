"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const zod_1 = require("zod");
const user_dto_1 = require("../dtos/user.dto");
const apihelper_util_1 = require("../utils/apihelper.util");
const http_exception_1 = require("../exceptions/http-exception");
const userService = new user_service_1.UserService();
function handleControllerError(res, error) {
    if (error instanceof http_exception_1.HttpException) {
        return apihelper_util_1.ApiResponseHelper.error(res, error.message, error.status);
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = error instanceof Error && "status" in error ? error.status : 500;
    return apihelper_util_1.ApiResponseHelper.error(res, message, status);
}
class UserController {
    async createUser(req, res) {
        try {
            const userData = user_dto_1.CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                const formattedError = zod_1.z.treeifyError(userData.error);
                return apihelper_util_1.ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
            }
            const user = await userService.createUser(userData.data);
            const { password, ...userWithoutPassword } = user.toObject();
            return apihelper_util_1.ApiResponseHelper.success(res, userWithoutPassword, "User created successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async loginUser(req, res) {
        try {
            const parsedData = user_dto_1.LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                const formattedError = zod_1.z.treeifyError(parsedData.error);
                return apihelper_util_1.ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
            }
            const { user, token } = await userService.loginUser(parsedData.data);
            return apihelper_util_1.ApiResponseHelper.success(res, { user, token }, "Login successful");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async getCurrentUser(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new http_exception_1.HttpException(401, "Unauthorized user not found");
            }
            const user = await userService.getCurrentUser(userId);
            if (!user) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            return apihelper_util_1.ApiResponseHelper.success(res, user, "User fetched successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async logoutUser(req, res) {
        try {
            const success = await userService.logoutUser();
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Logout successful");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async whoami(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new http_exception_1.HttpException(401, "Unauthorized user not found");
            }
            const user = await userService.getCurrentUser(userId);
            if (!user) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            const userResponse = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                createdAt: user.createdAt,
            };
            return apihelper_util_1.ApiResponseHelper.success(res, userResponse, "User details fetched");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async updateUser(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new http_exception_1.HttpException(401, "Unauthorized user not found");
            }
            const updateData = req.body;
            if (req.file) {
                const filename = req.file.filename;
                updateData.profileImage = `${req.protocol}://${req.get("host")}/api/v1/images/${filename}`;
            }
            const updatedUser = await userService.updateUser(userId, updateData);
            if (!updatedUser) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            const userResponse = {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
                fullName: updatedUser.fullName,
                phoneNumber: updatedUser.phoneNumber,
                createdAt: updatedUser.createdAt,
            };
            return apihelper_util_1.ApiResponseHelper.success(res, userResponse, "User updated successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async uploadProfileImage(req, res, next) {
        try {
            if (!req.file) {
                throw new http_exception_1.HttpException(400, "No file uploaded");
            }
            const filename = req.file.filename;
            const imageUrl = `${req.protocol}://${req.get("host")}/api/v1/images/${filename}`;
            return apihelper_util_1.ApiResponseHelper.success(res, { url: imageUrl }, "Image uploaded successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async updatePassword(req, res) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new http_exception_1.HttpException(401, "Unauthorized user not found");
            }
            const { currentPassword, newPassword, confirmPassword } = req.body;
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new http_exception_1.HttpException(400, "Current password, new password, and confirmation are required");
            }
            if (newPassword !== confirmPassword) {
                throw new http_exception_1.HttpException(400, "New passwords do not match");
            }
            const updatedUser = await userService.updatePassword(userId, currentPassword, newPassword, confirmPassword);
            if (!updatedUser) {
                throw new http_exception_1.HttpException(404, "User not found");
            }
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Password updated successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map