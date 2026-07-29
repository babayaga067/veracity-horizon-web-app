import { Router } from "express";
import { NotificationController } from "../controllers/notification/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.get("/", authorizedMiddleware, (req, res, next) => notificationController.getNotifications(req, res, next));
notificationRouter.patch("/:id/read", authorizedMiddleware, (req, res, next) => notificationController.markAsRead(req, res, next));
notificationRouter.patch("/read-all", authorizedMiddleware, (req, res, next) => notificationController.markAllAsRead(req, res, next));
notificationRouter.get("/unread-count", authorizedMiddleware, (req, res, next) => notificationController.getUnreadCount(req, res, next));

export default notificationRouter;