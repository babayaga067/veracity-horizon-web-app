import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";
import "./setup";

/**
 * INTEGRATION TESTS — USER PROFILE DOMAIN
 * Covers the authenticated user endpoints: profile update, password change,
 * logout, and the whoami/register/login happy path.
 */
async function registerLogin(email: string, username: string) {
  await request(app)
    .post("/api/v1/auth/register")
    .send({
      firstName: "First",
      lastName: "Last",
      email,
      username,
      password: "password123",
    });
  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password: "password123" });
  return login.body.data.token as string;
}

describe("User Profile API", () => {
  it("updates the authenticated user's profile", async () => {
    const token = await registerLogin("profu@x.com", "profux");
    const res = await request(app)
      .put("/api/v1/auth/update")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Updated", phoneNumber: "12345" });
    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe("Updated");
  });

  it("rejects a profile update without a token (401)", async () => {
    const res = await request(app)
      .put("/api/v1/auth/update")
      .send({ firstName: "X" });
    expect(res.status).toBe(401);
  });

  it("changes the user's password and rejects the old one afterwards", async () => {
    const token = await registerLogin("pwdu@x.com", "pwdux");
    const change = await request(app)
      .post("/api/v1/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "password123",
        newPassword: "newpassword1",
        confirmPassword: "newpassword1",
      });
    expect(change.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "pwdu@x.com", password: "password123" });
    expect(oldLogin.status).toBe(400);

    const newLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "pwdu@x.com", password: "newpassword1" });
    expect(newLogin.status).toBe(200);
  });

  it("rejects a password change with mismatched confirmation (400)", async () => {
    const token = await registerLogin("pwdu2@x.com", "pwdu2x");
    const res = await request(app)
      .post("/api/v1/auth/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "password123",
        newPassword: "newpassword1",
        confirmPassword: "different1",
      });
    expect(res.status).toBe(400);
  });

  it("logs out successfully", async () => {
    const token = await registerLogin("logoutu@x.com", "logoutux");
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
