import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import auctionRoutes from "./routes/auction.route";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import { PORT, MONGODB_URL, SECRET_KEY } from "./configs/constant";
import path from "path";
import fs from "fs";

const app: Application = express();

// CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use("/api/v1/auth/images", express.static(UPLOAD_DIR, {
  setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
}));

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminUserRoutes);
app.use("/api/v1/auctions", auctionRoutes);

// Root routes
app.get("/", (req: Request, res: Response) => {
  return res.send("Hello, Veracity Horizon Auction App!");
});

// Global 404 handler
app.use((req: Request, res: Response) => {
  return res.status(404).json({ message: "API not found" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  if (err instanceof HttpException) {
    return ApiResponseHelper.error(res, err.message, err.status);
  }
  return ApiResponseHelper.error(res, "Internal Server Error", 500);
});

// MongoDB connection + server start
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log(" Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    }).on("error", (err: NodeJS.ErrnoException) => {
      console.error(`Server error: ${err.message}`);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  });

export default app;
