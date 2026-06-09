import dotenv from "dotenv";
dotenv.config(); // Load .env file

// Environment constants with fallback values
export const PORT: number = Number(process.env.PORT) || 5000;
export const MONGODB_URL: string =
  process.env.MONGODB_URL || "mongodb://localhost:27017/veracity_horizon";
export const SECRET_KEY: string =
  process.env.SECRET_KEY || "veracity_horizon_secret";
