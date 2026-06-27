import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { Router } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const userRouter = Router();
const userController = new UserController();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(null, false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

userRouter.use("/images", express.static(uploadDir));

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/me", authorizedMiddleware, (req, res) => userController.getCurrentUser(req, res));
userRouter.post("/logout", authorizedMiddleware, (req, res) => userController.logoutUser(req, res));
userRouter.get("/whoami", authorizedMiddleware, (req, res) => userController.whoami(req, res));
userRouter.put("/update", authorizedMiddleware, upload.single("profileImage"), (req, res) => userController.updateUser(req, res));
userRouter.post("/upload", authorizedMiddleware, upload.single("file"), (req, res, next) => userController.uploadProfileImage(req, res, next));
userRouter.post("/password", authorizedMiddleware, (req, res) => userController.updatePassword(req, res));

export default userRouter;
