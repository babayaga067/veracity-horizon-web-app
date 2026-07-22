import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService, sanitizeUser } from "../../../src/services/user.service";
import { HttpException } from "../../../src/exceptions/http-exception";

/**
 * UNIT TESTS — SERVICE LAYER (User)
 * Business rules are exercised with a mocked repository so no database is
 * required. The mock is a single shared instance, mirroring how the real
 * service holds one repository instance.
 */
vi.mock("../../../src/repositories/user.repository", () => {
  const baseUser = {
    _id: "u1",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    username: "jane",
    password: "$2b$10$TGLf71rv5RWElfHTLBO7/uJhVk6KqoqocK8ErAD76RsmD.SO3ILSa",
    role: "user" as const,
  };
  const instance = {
    getUserByEmail: vi.fn().mockResolvedValue(null),
    getUserByUsername: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockResolvedValue(baseUser),
    getUserById: vi.fn().mockResolvedValue(baseUser),
    update: vi.fn().mockResolvedValue(baseUser),
    delete: vi.fn().mockResolvedValue(true),
    getAll: vi
      .fn()
      .mockResolvedValue({ users: [baseUser], total: 1, totalPages: 1 }),
  };
  return {
    UserMongoRepository: class {
      getUserByEmail = instance.getUserByEmail;
      getUserByUsername = instance.getUserByUsername;
      createUser = instance.createUser;
      getUserById = instance.getUserById;
      update = instance.update;
      delete = instance.delete;
      getAll = instance.getAll;
    },
  };
});

import { UserMongoRepository } from "../../../src/repositories/user.repository";

const userRepo = () => new (UserMongoRepository as any)();

describe("services/UserService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createUser", () => {
    it("hashes the password and defaults role to user", async () => {
      const repo = userRepo();
      await new UserService().createUser({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        username: "jane",
        password: "plaintext",
      });
      const created = repo.createUser.mock.calls[0][0];
      expect(created.password).not.toBe("plaintext");
      expect(created.role).toBe("user");
    });

    it("rejects duplicate emails", async () => {
      const repo = userRepo();
      repo.getUserByEmail.mockResolvedValue({ _id: "x" });
      await expect(
        new UserService().createUser({
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          username: "jane",
          password: "plaintext",
        })
      ).rejects.toBeInstanceOf(HttpException);
    });

    it("rejects duplicate usernames", async () => {
      const repo = userRepo();
      repo.getUserByUsername.mockResolvedValue({ _id: "x" });
      await expect(
        new UserService().createUser({
          firstName: "Jane",
          lastName: "Doe",
          email: "jane@example.com",
          username: "jane",
          password: "plaintext",
        })
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe("loginUser", () => {
    it("throws when the email is unknown", async () => {
      const repo = userRepo();
      repo.getUserByEmail.mockResolvedValue(null);
      await expect(
        new UserService().loginUser({ email: "nope@x.com", password: "x" })
      ).rejects.toBeInstanceOf(HttpException);
    });

    it("throws on an invalid password", async () => {
      const repo = userRepo();
      repo.getUserByEmail.mockResolvedValue({ _id: "u1", password: "$2b$10$TGLf71rv5RWElfHTLBO7/uJhVk6KqoqocK8ErAD76RsmD.SO3ILSa" });
      await expect(
        new UserService().loginUser({ email: "jane@example.com", password: "wrong" })
      ).rejects.toBeInstanceOf(HttpException);
    });

    it("returns a signed JWT for valid credentials", async () => {
      const repo = userRepo();
      repo.getUserByEmail.mockResolvedValue({
        _id: "u1",
        email: "jane@example.com",
        role: "user",
        password: "$2b$10$TGLf71rv5RWElfHTLBO7/uJhVk6KqoqocK8ErAD76RsmD.SO3ILSa",
      });
      const { user, token } = await new UserService().loginUser({
        email: "jane@example.com",
        password: "plaintext",
      });
      expect(token).toEqual(expect.any(String));
      expect(user).toBeDefined();
    });
  });

  describe("updateUser", () => {
    it("rejects when the user does not exist", async () => {
      const repo = userRepo();
      repo.getUserById.mockResolvedValue(null);
      await expect(
        new UserService().updateUser("u1", { firstName: "X" })
      ).rejects.toBeInstanceOf(HttpException);
    });

    it("rehashes the password when provided", async () => {
      const repo = userRepo();
      repo.getUserById.mockResolvedValue({ _id: "u1", email: "j@x.com" });
      await new UserService().updateUser("u1", { password: "newpass" });
      expect(repo.update.mock.calls[0][1].password).not.toBe("newpass");
    });
  });

  describe("sanitizeUser", () => {
    it("strips the password field", () => {
      const safe = sanitizeUser({ password: "secret", email: "a@b.com" });
      expect(safe).not.toHaveProperty("password");
      expect(safe).toHaveProperty("email");
    });
  });
});
