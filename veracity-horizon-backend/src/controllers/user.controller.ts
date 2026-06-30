import { UserService, sanitizeUser } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { Request, Response, NextFunction } from "express";

const userService = new UserService();

function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
  return ApiResponseHelper.error(res, message, status);
}

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const userData = CreateUserDTO.safeParse(req.body);
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

  async loginUser(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        const formattedError = z.treeifyError(parsedData.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }

      const { user, token } = await userService.loginUser(parsedData.data);
      return ApiResponseHelper.success(res, { user: sanitizeUser(user), token }, "Login successful");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized user not found");
      }

      const user = await userService.getCurrentUser(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      return ApiResponseHelper.success(res, user, "User fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async logoutUser(req: Request, res: Response) {
    try {
      const success = await userService.logoutUser();
      return ApiResponseHelper.success(res, null, "Logout successful");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async whoami(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized user not found");
      }

      const user = await userService.getCurrentUser(userId);
      if (!user) {
        throw new HttpException(404, "User not found");
      }

      const userObj = user as unknown as Record<string, unknown>;
      const userResponse: Record<string, unknown> = {
        _id: userObj._id,
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        email: userObj.email,
        username: userObj.username,
        role: userObj.role,
        profileImage: userObj.profileImage || "",
        fullName: userObj.fullName || "",
        phoneNumber: userObj.phoneNumber || "",
        createdAt: userObj.createdAt,
      };

      return ApiResponseHelper.success(res, userResponse, "User details fetched");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized user not found");
      }

      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        const formattedError = z.treeifyError(parsedData.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }

      if (req.file) {
        const filename = req.file.filename;
        parsedData.data.profileImage = `${req.protocol}://${req.get("host")}/api/v1/images/${filename}`;
      }

      const updatedUser = await userService.updateUser(userId, parsedData.data);
      if (!updatedUser) {
        throw new HttpException(404, "User not found");
      }

      return ApiResponseHelper.success(res, sanitizeUser(updatedUser), "User updated successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async uploadProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, "No file uploaded");
      }

      const filename = req.file.filename;
      const imageUrl = `${req.protocol}://${req.get("host")}/api/v1/images/${filename}`;

      return ApiResponseHelper.success(res, { url: imageUrl }, "Image uploaded successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized user not found");
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new HttpException(400, "Current password, new password, and confirmation are required");
      }

      if (newPassword !== confirmPassword) {
        throw new HttpException(400, "New passwords do not match");
      }

      const updatedUser = await userService.updatePassword(userId, currentPassword, newPassword, confirmPassword);
      if (!updatedUser) {
        throw new HttpException(404, "User not found");
      }

      return ApiResponseHelper.success(res, null, "Password updated successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
