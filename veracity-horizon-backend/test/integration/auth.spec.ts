import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";
import "./setup";

/**
 * INTEGRATION TESTS — AUTH DOMAIN
 * Exercises the full HTTP stack (route → middleware → controller → service →
 * repository → MongoDB Memory Server) for the authentication endpoints.
 */
const validUser = {
  firstName: "Alice",
  lastName: "Smith",
  email: "alice@example.com",
  username: "alicesmith",
  password: "password123",
};

describe("Auth API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("registers a new user and returns a sanitised payload", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validUser);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("rejects a duplicate email with 400", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
      const res = await request(app).post("/api/v1/auth/register").send({
        ...validUser,
        username: "anotheruser",
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects an invalid payload (short password) with 400", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, password: "123" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns a JWT for valid credentials", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toEqual(expect.any(String));
    });

    it("rejects an unknown email with 400", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@x.com", password: "password123" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/whoami", () => {
    it("returns the current user when authenticated", async () => {
      await request(app).post("/api/v1/auth/register").send(validUser);
      const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: validUser.email, password: validUser.password });
      const token = login.body.data.token;

      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validUser.email);
    });

    it("rejects a missing token with 401", async () => {
      const res = await request(app).get("/api/v1/auth/whoami");
      expect(res.status).toBe(401);
    });
  });
});
