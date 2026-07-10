"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../controllers/user.controller");
const authorized_middleware_1 = require("../middlewares/authorized.middleware");
const express_1 = require("express");
const multer_1 = require("../configs/multer");
const userRouter = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/me", authorized_middleware_1.authorizedMiddleware, (req, res) => userController.getCurrentUser(req, res));
userRouter.post("/logout", authorized_middleware_1.authorizedMiddleware, (req, res) => userController.logoutUser(req, res));
userRouter.get("/whoami", authorized_middleware_1.authorizedMiddleware, (req, res) => userController.whoami(req, res));
userRouter.put("/update", authorized_middleware_1.authorizedMiddleware, multer_1.upload.single("profileImage"), (req, res) => userController.updateUser(req, res));
userRouter.post("/upload", authorized_middleware_1.authorizedMiddleware, multer_1.upload.single("file"), (req, res, next) => userController.uploadProfileImage(req, res, next));
userRouter.post("/password", authorized_middleware_1.authorizedMiddleware, (req, res) => userController.updatePassword(req, res));
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map