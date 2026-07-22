import { describe, it, expect } from "vitest";
import { CreateAuctionSchema } from "../../../src/dtos/auction.dto";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
} from "../../../src/dtos/user.dto";

/**
 * UNIT TESTS — DTO / VALIDATION LAYER
 * Confirms the Zod schemas enforced at the controller boundary reject
 * malformed payloads and accept valid ones.
 */
describe("dtos/auction.dto — CreateAuctionSchema", () => {
  const valid = {
    title: "Vintage Watch",
    description: "A well preserved vintage timepiece.",
    startingPrice: 1000,
    category: "Watches & Timepieces" as const,
  };

  it("accepts a valid payload", () => {
    expect(CreateAuctionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a title shorter than 3 characters", () => {
    expect(CreateAuctionSchema.safeParse({ ...valid, title: "XY" }).success).toBe(
      false
    );
  });

  it("rejects a description shorter than 10 characters", () => {
    expect(
      CreateAuctionSchema.safeParse({ ...valid, description: "short" }).success
    ).toBe(false);
  });

  it("rejects a starting price below 1", () => {
    expect(
      CreateAuctionSchema.safeParse({ ...valid, startingPrice: 0 }).success
    ).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(
      CreateAuctionSchema.safeParse({ ...valid, category: "NotACategory" })
        .success
    ).toBe(false);
  });

  it("allows optional endsAt and imageUrls", () => {
    expect(
      CreateAuctionSchema.safeParse({
        ...valid,
        endsAt: "2026-08-01T00:00:00.000Z",
        imageUrls: ["http://x/api/v1/images/a.png"],
      }).success
    ).toBe(true);
  });
});

describe("dtos/user.dto", () => {
  it("CreateUserDTO requires core fields", () => {
    const valid = {
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      username: "abc",
      password: "secret1",
    };
    expect(CreateUserDTO.safeParse(valid).success).toBe(true);
    expect(CreateUserDTO.safeParse({ firstName: "A" }).success).toBe(false);
  });

  it("LoginUserDTO requires email and password", () => {
    expect(
      LoginUserDTO.safeParse({ email: "a@b.com", password: "secret1" }).success
    ).toBe(true);
    expect(LoginUserDTO.safeParse({ email: "bad" }).success).toBe(false);
  });

  it("UpdateUserDTO permits partial updates", () => {
    expect(UpdateUserDTO.safeParse({ firstName: "New" }).success).toBe(true);
    expect(UpdateUserDTO.safeParse({}).success).toBe(true);
  });

  it("rejects an invalid email in CreateUserDTO", () => {
    expect(
      CreateUserDTO.safeParse({
        firstName: "A",
        lastName: "B",
        email: "not-an-email",
        username: "abc",
        password: "secret1",
      }).success
    ).toBe(false);
  });
});
