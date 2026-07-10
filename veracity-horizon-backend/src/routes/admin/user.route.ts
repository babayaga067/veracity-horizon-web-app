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
  (req, res) => adminUserController.listUsers(req, res)
);

// Admin-only: create user
adminUserRouter.post(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  (req, res) => adminUserController.createUser(req, res)
);

// Admin-only: get single user by ID
adminUserRouter.get(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res) => adminUserController.getUserById(req, res)
);

// Admin-only: update user (full replacement)
adminUserRouter.put(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res) => adminUserController.updateUser(req, res)
);

// Admin-only: delete user
adminUserRouter.delete(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  (req, res) => adminUserController.deleteUser(req, res)
);

export default adminUserRouter;
