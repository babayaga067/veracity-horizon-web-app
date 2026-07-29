import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "../configs/constant";

export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || "unknown";
  },
  skipSuccessfulRequests: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || "unknown";
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || "unknown";
  },
});