import { UserService, sanitizeUser } from "../../services/user.service";
import { z } from "zod";
import { AdminCreateUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { ApiResponseHelper } from "../../utils/apihelper.util";
import { Request, Response, NextFunction } from "express";
import { HttpException } from "../../exceptions/http-exception";

const userService = new UserService();

function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
  return ApiResponseHelper.error(res, message, status);
}

export class AdminUserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = AdminCreateUserDTO.safeParse(req.body);
      if (!userData.success) {
        const formattedError = z.treeifyError(userData.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }
      const user = await userService.createUser(userData.data);
      return ApiResponseHelper.success(res, sanitizeUser(user), "User created successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      const userData = UpdateUserDTO.safeParse(req.body);
      if (!userData.success) {
        const formattedError = z.treeifyError(userData.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }

      const updatedUser = await userService.updateUser(id, userData.data);
      if (!updatedUser) {
        return ApiResponseHelper.error(res, "User not found", 404);
      }
      return ApiResponseHelper.success(res, sanitizeUser(updatedUser), "User updated successfully");
    } catch (error) {
      return handleControllerError(res, error);
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
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const search = (req.query.search as string) || "";

      const result = await userService.getAllUsers(page, limit, search);
      const safeUsers = result.users.map((user) => sanitizeUser(user));
      const meta = {
        page: result.totalPages > 0 ? page : 0,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      };
      return ApiResponseHelper.success(res, safeUsers, "Users fetched successfully", 200, meta);
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid user ID");
      }

      const user = await userService.getCurrentUser(id);
      if (!user) {
        return ApiResponseHelper.error(res, "User not found", 404);
      }
      return ApiResponseHelper.success(res, sanitizeUser(user), "User fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
