import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../../services/notification.service";
import { ApiResponseHelper } from "../../utils/apihelper.util";
import { HttpException } from "../../exceptions/http-exception";

function handleNotificationError(res: Response, error: unknown): Response {
  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
  return ApiResponseHelper.error(res, message, status);
}

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const result = await notificationService.getNotifications(userId, page, limit);
      return ApiResponseHelper.success(res, result.notifications, "Notifications fetched", 200, {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: unknown) {
      return handleNotificationError(res, error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Notification ID is required");
      }

      const notification = await notificationService.markAsRead(id, userId);
      if (!notification) {
        throw new HttpException(404, "Notification not found");
      }

      return ApiResponseHelper.success(res, null, "Notification marked as read");
    } catch (error: unknown) {
      return handleNotificationError(res, error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      await notificationService.markAllAsRead(userId);
      return ApiResponseHelper.success(res, null, "All notifications marked as read");
    } catch (error: unknown) {
      return handleNotificationError(res, error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const count = await notificationService.getUnreadCount(userId);
      return ApiResponseHelper.success(res, { count }, "Unread count fetched");
    } catch (error: unknown) {
      return handleNotificationError(res, error);
    }
  }
}