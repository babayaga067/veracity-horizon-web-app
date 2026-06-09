import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import auctionRoutes from "./routes/auction.route"; 
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import { PORT, MONGODB_URL } from "./configs/constant";

const app: Application = express();

// CORS setup
const corsOptions = {
  origin: ["*"], // adjust for frontend domains later
  successStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/auctions", auctionRoutes); // auction endpoints

// Root routes
app.get("/", (req: Request, res: Response) => {
  return res.send("Hello, Veracity Horizon Auction App!");
});

// Exception test route
app.get("/exception", (req: Request, res: Response) => {
  try {
    const logic: any = {};
    logic.user.find(); // simulate error
  } catch (err: any) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Exception Issue" });
  }
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
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });

export default app;
