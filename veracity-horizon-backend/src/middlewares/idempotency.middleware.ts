import { Request, Response, NextFunction } from "express";

interface CachedResponse {
  status: "processing" | "completed";
  statusCode: number;
  responseBody: any;
}

const idempotencyCache = new Map<string, { response: CachedResponse; expiresAt: number }>();
const IDEMPOTENCY_TTL_MS = 15 * 60 * 1000;

function cleanupExpiredKeys(): void {
  const now = Date.now();
  for (const [key, entry] of idempotencyCache.entries()) {
    if (now > entry.expiresAt) {
      idempotencyCache.delete(key);
    }
  }
}

setInterval(cleanupExpiredKeys, 60000);

export function idempotencyGuard(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers["x-idempotency-key"] as string;

  if (!idempotencyKey) {
    return next();
  }

  const now = Date.now();
  const cached = idempotencyCache.get(idempotencyKey);

  if (cached && now > cached.expiresAt) {
    idempotencyCache.delete(idempotencyKey);
  }

  if (cached && now <= cached.expiresAt) {
    if (cached.response.status === "processing") {
      return res.status(409).json({
        success: false,
        message: "A matching transaction is already being processed. Please wait.",
      });
    }
    if (cached.response.status === "completed") {
      return res.status(cached.response.statusCode).json(cached.response.responseBody);
    }
  }

  idempotencyCache.set(idempotencyKey, {
    response: { status: "processing", statusCode: 0, responseBody: null },
    expiresAt: now + IDEMPOTENCY_TTL_MS,
  });

  const originalJson = res.json;
  res.json = function (body: any) {
    const now = Date.now();
    const cached = idempotencyCache.get(idempotencyKey);
    if (cached && now <= cached.expiresAt) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cached.response.status = "completed";
        cached.response.statusCode = res.statusCode;
        cached.response.responseBody = body;
      } else {
        idempotencyCache.delete(idempotencyKey);
      }
    }
    return originalJson.call(this, body);
  };

  next();
}