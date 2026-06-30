import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const adminUserRouter = Router();
const adminUserController = new AdminUserController();

// Admin-only: list all users
adminUserRouter.get(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.listUsers(req, res, next)
);

// Admin-only: create user
adminUserRouter.post(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.createUser(req, res, next)
);

// Admin-only: get single user by ID
adminUserRouter.get(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.getUserById(req, res, next)
);

// Admin-only: update user (full replacement)
adminUserRouter.put(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.updateUser(req, res, next)
);

// Admin-only: delete user
adminUserRouter.delete(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res, next) => adminUserController.deleteUser(req, res, next)
);

export default adminUserRouter;
