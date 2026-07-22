import { describe, it, expect } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../src/app";
import { UserModel } from "../../src/models/user.model";
import "./setup";

/**
 * INTEGRATION TESTS — ADMIN DOMAIN
 * Verifies role-based access control: admin-only user-management endpoints
 * must reject standard users (403) and serve administrators.
 */
async function registerLogin(email: string, username: string, role = "user") {
  const user = {
    firstName: "First",
    lastName: "Last",
    email,
    username,
    password: "password123",
    ...(role === "admin" ? { role: "admin" } : {}),
  };
  await request(app).post("/api/v1/auth/register").send(user);
  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });
  return login.body.data.token as string;
}

// The public register endpoint always creates standard users, so an admin is
// seeded directly into the database to bootstrap privileged tests.
async function seedAdmin(email: string, username: string) {
  await UserModel.create({
    firstName: "Admin",
    lastName: "User",
    email,
    username,
    password: await bcrypt.hash("password123", 10),
    role: "admin",
  });
  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });
  return login.body.data.token as string;
}

describe("Admin API (RBAC)", () => {
  describe("GET /api/v1/admin/users", () => {
    it("rejects a standard user with 403", async () => {
      const token = await registerLogin("stduser@x.com", "stduserx");
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it("rejects a request with no token (401)", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });

    it("returns the user list for an admin", async () => {
      const adminToken = await seedAdmin("admin@x.com", "adminx");
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty("total");
    });
  });

  describe("POST /api/v1/admin/users", () => {
    it("allows an admin to create a user with a role", async () => {
      const adminToken = await seedAdmin("admin2@x.com", "admin2x");
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "New",
          lastName: "User",
          email: "newuser@x.com",
          username: "newuserx",
          password: "password123",
          role: "user",
        });
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("newuser@x.com");
      expect(res.body.data.role).toBe("user");
    });

    it("forbids a standard user from creating users (403)", async () => {
      const token = await registerLogin("stduser2@x.com", "stduser2x");
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Authorization", `Bearer ${token}`)
        .send({
          firstName: "New",
          lastName: "User",
          email: "blocked@x.com",
          username: "blockedx",
          password: "password123",
        });
      expect(res.status).toBe(403);
    });
  });

  describe("Admin user CRUD", () => {
    it("gets, updates, and deletes a user by id", async () => {
      const adminToken = await seedAdmin("admin3@x.com", "admin3x");
      const created = await request(app)
        .post("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          firstName: "Temp",
          lastName: "User",
          email: "temp@x.com",
          username: "tempx",
          password: "password123",
        });
      const userId = created.body.data._id;

      const getRes = await request(app)
        .get(`/api/v1/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.email).toBe("temp@x.com");

      const updRes = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ firstName: "Updated" });
      expect(updRes.status).toBe(200);
      expect(updRes.body.data.firstName).toBe("Updated");

      const delRes = await request(app)
        .delete(`/api/v1/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(delRes.status).toBe(200);
    });

    it("returns 404 when fetching a non-existent user", async () => {
      const adminToken = await seedAdmin("admin4@x.com", "admin4x");
      const res = await request(app)
        .get(`/api/v1/admin/users/64b2c1f4e1b2c3a4d5e6f799`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
