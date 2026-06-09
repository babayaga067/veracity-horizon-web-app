import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

// Admin-only: create user
adminUserRouter.post(
  "/create",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.createUser(req, res, next)
);

// Admin-only: update user
adminUserRouter.put(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.updateUser(req, res, next)
);

// Admin-only: delete user
adminUserRouter.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.deleteUser(req, res, next)
);

// Admin-only: list all users
adminUserRouter.get(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.listUsers(req, res, next)
);

export default adminUserRouter;
