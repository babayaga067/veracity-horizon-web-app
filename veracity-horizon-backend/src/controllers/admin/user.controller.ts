import { UserService } from "../../services/user.service";
import { z } from "zod";
import { CreateUserDTO } from "../../dtos/user.dto";
import { ApiResponseHelper } from "../../utils/apihelper.util";
import { Request, Response, NextFunction } from "express";
import { HttpException } from "../../exceptions/http-exception";

const userService = new UserService();

export class AdminUserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);
      if (!userData.success) {
        return ApiResponseHelper.error(res, userData.error.message, 400);
      }
      const user = await userService.createUser(userData.data);
      return ApiResponseHelper.success(res, user, "User created successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      const updatedUser = await userService.updateUser(id, req.body);
      if (!updatedUser) {
        return ApiResponseHelper.error(res, "User not found", 404);
      }
      return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      const deleted = await userService.deleteUser(id);
      if (!deleted) {
        return ApiResponseHelper.error(res, "User not found", 404);
      }
      return ApiResponseHelper.success(res, { deleted }, "User deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return ApiResponseHelper.success(res, users, "Users fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
