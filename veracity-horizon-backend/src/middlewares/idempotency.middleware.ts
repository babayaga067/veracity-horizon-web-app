import { Request, Response, NextFunction } from "express";

interface CachedResponse {
  status: "processing" | "completed";
  statusCode: number;
  responseBody: any;
}

// In-memory cache for idempotency keys (use Redis in production)
const idempotencyCache = new Map<string, CachedResponse>();

export function idempotencyGuard(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers["x-idempotency-key"] as string;

  if (!idempotencyKey) {
    return next();
  }

  const cachedRequest = idempotencyCache.get(idempotencyKey);

  if (cachedRequest) {
    if (cachedRequest.status === "processing") {
      return res.status(409).json({
        success: false,
        message: "A matching transaction is already being processed. Please wait.",
      });
    }

    if (cachedRequest.status === "completed") {
      return res.status(cachedRequest.statusCode).json(cachedRequest.responseBody);
    }
  }

  idempotencyCache.set(idempotencyKey, {
    status: "processing",
    statusCode: 0,
    responseBody: null,
  });

  const originalJson = res.json;
  res.json = function (body) {
    const cached = idempotencyCache.get(idempotencyKey);
    if (cached && res.statusCode >= 200 && res.statusCode < 300) {
      cached.status = "completed";
      cached.statusCode = res.statusCode;
      cached.responseBody = body;
    } else if (cached) {
      idempotencyCache.delete(idempotencyKey);
    }
    return originalJson.call(this, body);
  };

  next();
}