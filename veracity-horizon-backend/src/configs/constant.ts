import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 3000;
export const MONGODB_URL: string = process.env.MONGODB_URL || (() => {
  throw new Error("MONGODB_URL environment variable is required");
})();
export const SECRET_KEY: string = process.env.SECRET_KEY || (() => {
  throw new Error("SECRET_KEY environment variable is required");
})();

