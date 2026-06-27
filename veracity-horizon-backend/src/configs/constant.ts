import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 5000;
export const MONGODB_URL: string =
  process.env.MONGODB_URL || "mongodb://localhost:27017/veracity_horizon";

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is required");
}
export const SECRET_KEY: string = process.env.SECRET_KEY;
