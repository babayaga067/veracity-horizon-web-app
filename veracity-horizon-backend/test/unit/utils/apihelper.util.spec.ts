import { describe, it, expect } from "vitest";
import { ApiResponseHelper } from "../../../src/utils/apihelper.util";
import type { Response } from "express";

/**
 * UNIT TESTS — UTILS LAYER
 * Verifies the uniform JSON response envelope returned by every controller.
 */
function mockResponse(): Response {
  const res: Partial<Response> = {};
  res.statusCode = 0;
  res.body = undefined;
  res.status = ((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as Response["status"];
  res.json = ((payload: unknown) => {
    res.body = payload;
    return res as Response;
  }) as Response["json"];
  return res as Response;
}

describe("utils/ApiResponseHelper", () => {
  it("success returns a well-formed envelope with 200 default", () => {
    const res = mockResponse();
    ApiResponseHelper.success(res, { id: 1 }, "ok");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: 200,
      success: true,
      message: "ok",
      data: { id: 1 },
      meta: undefined,
    });
  });

  it("success includes pagination meta when provided", () => {
    const res = mockResponse();
    ApiResponseHelper.success(res, [], "list", 200, {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
    expect((res.body as any).meta).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it("error returns a failure envelope with provided status", () => {
    const res = mockResponse();
    ApiResponseHelper.error(res, "boom", 400);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      status: 400,
      success: false,
      message: "boom",
      data: null,
    });
  });
});
