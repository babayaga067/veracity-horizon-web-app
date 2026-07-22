import { describe, it, expect, vi } from "vitest";
import { idempotencyGuard } from "../../../src/middlewares/idempotency.middleware";

/**
 * UNIT TESTS — MIDDLEWARE LAYER
 * Exercises the idempotency guard that protects the bid endpoint against
 * duplicate submissions (network retries / double-clicks).
 */
function mockReqRes(headers: Record<string, any> = {}) {
  const req: any = { headers };
  const res: any = {
    statusCode: 0,
    json: vi.fn(function (this: any, body: any) {
      res._body = body;
      return res;
    }),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe("middlewares/idempotency.middleware", () => {
  it("calls next() when no idempotency key is present", () => {
    const { req, res, next } = mockReqRes();
    idempotencyGuard(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 409 when a matching key is still processing", () => {
    const { req } = mockReqRes({ "x-idempotency-key": "dup" });
    idempotencyGuard(req, mockReqRes().res, mockReqRes().next);
    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    idempotencyGuard(req, res2, vi.fn());
    expect(res2.json).toHaveBeenCalled();
    expect(res2.json.mock.calls[0][0].message).toMatch(/already being processed/i);
  });

  it("replays the cached response for a completed key", () => {
    const { req, res, next } = mockReqRes({ "x-idempotency-key": "done" });
    idempotencyGuard(req, res, next);
    res.statusCode = 201;
    (res.json as any).call(res, { success: true, data: { id: 9 } });

    const res2: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    idempotencyGuard(req, res2, vi.fn());
    expect(res2.json).toHaveBeenCalledWith({ success: true, data: { id: 9 } });
    expect(res2.status).toHaveBeenCalledWith(201);
  });

  it("clears the cache on a non-2xx response so a retry is allowed", () => {
    const { req, res, next } = mockReqRes({ "x-idempotency-key": "fail" });
    idempotencyGuard(req, res, next);
    res.statusCode = 400;
    (res.json as any).call(res, { success: false, message: "bad" });

    // After a failed response the cache entry is removed, so a second
    // request with the same key is forwarded to the route (calls next()).
    const next2 = vi.fn();
    idempotencyGuard(req, { status: vi.fn().mockReturnThis(), json: vi.fn() } as any, next2);
    expect(next2).toHaveBeenCalledOnce();
  });
});
