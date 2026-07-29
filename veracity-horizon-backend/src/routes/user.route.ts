import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { Router } from "express";
import { upload } from "../configs/multer";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/whoami", authorizedMiddleware, (req, res) => userController.whoami(req, res));
userRouter.post("/logout", authorizedMiddleware, (req, res) => userController.logoutUser(req, res));
userRouter.put("/update", authorizedMiddleware, upload.single("profileImage"), (req, res) => userController.updateUser(req, res));
userRouter.post("/upload", authorizedMiddleware, upload.single("file"), (req, res, next) => userController.uploadProfileImage(req, res, next));
userRouter.post("/password", authorizedMiddleware, (req, res) => userController.updatePassword(req, res));
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password/:token", userController.resetPassword);
userRouter.post("/send-verification-email", userController.sendVerificationEmail);
userRouter.post("/verify-email", userController.verifyEmail);

export default userRouter;
