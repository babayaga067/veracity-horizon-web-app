import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import auctionRoutes from "./routes/auction.route";
import notificationRoutes from "./routes/notification.route";
import aiRoutes from "./routes/ai/ai.route";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import path from "path";
import fs from "fs";

const app: Application = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Idempotency-Key"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getImageContentType(filePath: string): string {
  const buffer = Buffer.alloc(4);
  const fd = fs.openSync(filePath, "r");
  try {
    fs.readSync(fd, buffer, 0, 4, 0);
  } finally {
    fs.closeSync(fd);
  }

  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return "image/png";
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return "image/gif";
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return "image/webp";
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x00 && buffer[3] === 0x20) return "image/tiff";
  return "application/octet-stream";
}

app.get("/api/v1/images/:filename", (req: Request, res: Response) => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  if (!filename) {
    return res.status(400).json({ message: "Filename is required" });
  }
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  const filePath = path.join(UPLOAD_DIR, cleanFilename);
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadDir = path.resolve(UPLOAD_DIR);
  if (!resolvedPath.startsWith(resolvedUploadDir + path.sep) && resolvedPath !== resolvedUploadDir) {
    return res.status(400).json({ message: "Invalid filename" });
  }
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Image not found" });
  }
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Type", getImageContentType(filePath));
  res.sendFile(filePath);
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminUserRoutes);
app.use("/api/v1/auctions", auctionRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/ai", aiRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.send("Hello, Veracity Horizon Auction App!");
});

app.use((req: Request, res: Response) => {
  return res.status(404).json({ message: "API not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  if (err instanceof HttpException) {
    return ApiResponseHelper.error(res, err.message, err.status);
  }
  return ApiResponseHelper.error(res, "Internal Server Error", 500);
});

export default app;

