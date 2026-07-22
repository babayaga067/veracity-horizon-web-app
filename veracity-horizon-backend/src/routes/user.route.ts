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

export default userRouter;
