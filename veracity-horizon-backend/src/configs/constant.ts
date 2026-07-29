import dotenv from "dotenv";
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 5000;
export const MONGODB_URL: string = process.env.MONGODB_URL || "mongodb://localhost:27017/veracity_horizon";
export const SECRET_KEY: string = process.env.SECRET_KEY || "";
export const REDIS_URL: string = process.env.REDIS_URL || "";
export const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";
export const RATE_LIMIT_MAX: number = Number(process.env.RATE_LIMIT_MAX) || 100;
export const RATE_LIMIT_WINDOW_MS: number = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
export const EMAIL_FROM: string = process.env.EMAIL_FROM || "noreply@veracityhorizon.com";
export const SMTP_HOST: string = process.env.SMTP_HOST || "";
export const SMTP_PORT: number = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER: string = process.env.SMTP_USER || "";
export const SMTP_PASS: string = process.env.SMTP_PASS || "";
export const MIN_BID_INCREMENT: number = Number(process.env.MIN_BID_INCREMENT) || 1;
export const EMAIL_USER: string = process.env.EMAIL_USER || "example@gmail.com";
export const EMAIL_PASS: string = process.env.EMAIL_PASS || "password123";
export const CLIENT_URL: string = process.env.CLIENT_URL || "http://localhost:3001";

