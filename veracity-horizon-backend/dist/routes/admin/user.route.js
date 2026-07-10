"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../controllers/admin/user.controller");
const authorized_middleware_1 = require("../../middlewares/authorized.middleware");
const adminUserRouter = (0, express_1.Router)();
const adminUserController = new user_controller_1.AdminUserController();
// Admin-only: list all users
adminUserRouter.get("/users", authorized_middleware_1.authorizedMiddleware, authorized_middleware_1.adminMiddleware, (req, res, next) => adminUserController.listUsers(req, res, next));
// Admin-only: create user
adminUserRouter.post("/users", authorized_middleware_1.authorizedMiddleware, authorized_middleware_1.adminMiddleware, (req, res, next) => adminUserController.createUser(req, res, next));
// Admin-only: get single user by ID
adminUserRouter.get("/users/:id", authorized_middleware_1.authorizedMiddleware, authorized_middleware_1.adminMiddleware, (req, res, next) => adminUserController.getUserById(req, res, next));
// Admin-only: update user (full replacement)
adminUserRouter.put("/users/:id", authorized_middleware_1.authorizedMiddleware, authorized_middleware_1.adminMiddleware, (req, res, next) => adminUserController.updateUser(req, res, next));
// Admin-only: delete user
adminUserRouter.delete("/users/:id", authorized_middleware_1.authorizedMiddleware, authorized_middleware_1.adminMiddleware, (req, res, next) => adminUserController.deleteUser(req, res, next));
exports.default = adminUserRouter;
//# sourceMappingURL=user.route.js.map