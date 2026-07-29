import { UserService, sanitizeUser } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { cleanImageUrl } from "../utils/image.util";

const userService = new UserService();

function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
  return ApiResponseHelper.error(res, message, status);
}

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

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

      return ApiResponseHelper.success(res, sanitizeUser(user), "User details fetched");
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
        parsedData.data.profileImage = req.file.filename;
      } else if (parsedData.data.profileImage && typeof parsedData.data.profileImage === "string") {
        parsedData.data.profileImage = cleanImageUrl(parsedData.data.profileImage);
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
      const imageUrl = `/api/v1/images/${filename}`;

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

  async forgotPassword(req: Request, res: Response) {
    try {
      const parsedData = ForgotPasswordSchema.safeParse(req.body);
      if (!parsedData.success) {
        const formattedError = z.treeifyError(parsedData.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }

      const { email } = parsedData.data;
      await userService.sendResetPasswordEmail(email);
      return ApiResponseHelper.success(res, null, "If an account with that email exists, a reset link has been sent");
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.status === 400) {
          return ApiResponseHelper.error(res, "Valid email is required", 400);
        }
        return ApiResponseHelper.error(res, "Failed to send reset email. Please try again later.", 500);
      }
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const token = (req.params as any).token as string;
      const { newPassword } = req.body;

      if (!token || !newPassword) {
        throw new HttpException(400, "Token and new password are required");
      }

      const updatedUser = await userService.resetPassword(token, newPassword);
      if (!updatedUser) {
        throw new HttpException(400, "Invalid or expired token");
      }

      return ApiResponseHelper.success(res, null, "Password has been reset successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async sendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new HttpException(400, "Email is required");
      }
      const { token } = await userService.sendVerificationEmail(email);
      return ApiResponseHelper.success(res, { token }, "Verification email sent successfully");
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.status === 400) {
          return ApiResponseHelper.error(res, "Valid email is required", 400);
        }
        return ApiResponseHelper.error(res, "Failed to send verification email. Please try again later.", 500);
      }
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        throw new HttpException(400, "Token is required");
      }
      const updatedUser = await userService.verifyEmail(token);
      return ApiResponseHelper.success(res, sanitizeUser(updatedUser), "Email verified successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
}
