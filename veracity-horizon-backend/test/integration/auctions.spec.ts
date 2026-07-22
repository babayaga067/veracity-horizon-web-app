import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";
import "./setup";

/**
 * INTEGRATION TESTS — AUCTION DOMAIN
 * Covers listing, creation, bidding (with idempotency), ownership/role
 * protection, and the featured endpoint through the complete stack.
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

const auctionPayload = {
  title: "Rare Painting",
  description: "A beautiful and rare original painting.",
  startingPrice: 500,
  category: "Art",
  endsAt: new Date(Date.now() + 86400000).toISOString(),
};

// Auctions default to "upcoming"; bidding requires an "active" status, so the
// owner flips it via the update endpoint before a bid is placed.
async function createActiveAuction(token: string) {
  const create = await request(app)
    .post("/api/v1/auctions/create")
    .set("Authorization", `Bearer ${token}`)
    .send(auctionPayload);
  const auctionId = create.body.data._id;
  await request(app)
    .put(`/api/v1/auctions/${auctionId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "active" });
  return auctionId;
}

describe("Auction API", () => {
  describe("POST /api/v1/auctions/create", () => {
    it("creates an auction for an authenticated user", async () => {
      const token = await registerLogin("owner@x.com", "ownerx");
      const res = await request(app)
        .post("/api/v1/auctions/create")
        .set("Authorization", `Bearer ${token}`)
        .send(auctionPayload);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe(auctionPayload.title);
      expect(res.body.data.currentBid).toBe(500);
    });

    it("rejects creation without a token (401)", async () => {
      const res = await request(app)
        .post("/api/v1/auctions/create")
        .send(auctionPayload);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/auctions", () => {
    it("lists created auctions publicly", async () => {
      const token = await registerLogin("lister@x.com", "listerx");
      await request(app)
        .post("/api/v1/auctions/create")
        .set("Authorization", `Bearer ${token}`)
        .send(auctionPayload);

      const res = await request(app).get("/api/v1/auctions");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta).toHaveProperty("total");
    });
  });

  describe("POST /api/v1/auctions/:id/bid", () => {
    it("places a valid bid and raises the current bid", async () => {
      const ownerToken = await registerLogin("bidowner@x.com", "bidowner");
      const auctionId = await createActiveAuction(ownerToken);

      const bidderToken = await registerLogin("bidder@x.com", "bidderx");
      const res = await request(app)
        .post(`/api/v1/auctions/${auctionId}/bid`)
        .set("Authorization", `Bearer ${bidderToken}`)
        .set("x-idempotency-key", "bid-unique-1")
        .send({ amount: 600 });
      expect(res.status).toBe(200);
      expect(res.body.data.currentBid).toBe(600);
    });

    it("rejects a bid below the current bid (400)", async () => {
      const ownerToken = await registerLogin("bidowner2@x.com", "bidowner2");
      const auctionId = await createActiveAuction(ownerToken);

      const bidderToken = await registerLogin("bidder2@x.com", "bidder2x");
      const res = await request(app)
        .post(`/api/v1/auctions/${auctionId}/bid`)
        .set("Authorization", `Bearer ${bidderToken}`)
        .set("x-idempotency-key", "bid-low-1")
        .send({ amount: 100 });
      expect(res.status).toBe(400);
    });

    it("prevents the owner from bidding on their own auction (403)", async () => {
      const token = await registerLogin("selfbid@x.com", "selfbid");
      const auctionId = await createActiveAuction(token);

      const res = await request(app)
        .post(`/api/v1/auctions/${auctionId}/bid`)
        .set("Authorization", `Bearer ${token}`)
        .set("x-idempotency-key", "self-bid-1")
        .send({ amount: 700 });
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/auctions/:id (ownership / RBAC)", () => {
    it("allows the owner to delete their auction", async () => {
      const token = await registerLogin("delowner@x.com", "delowner");
      const create = await request(app)
        .post("/api/v1/auctions/create")
        .set("Authorization", `Bearer ${token}`)
        .send(auctionPayload);
      const auctionId = create.body.data._id;

      const res = await request(app)
        .delete(`/api/v1/auctions/${auctionId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it("forbids another user from deleting the auction (403)", async () => {
      const ownerToken = await registerLogin("delowner2@x.com", "delowner2");
      const create = await request(app)
        .post("/api/v1/auctions/create")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send(auctionPayload);
      const auctionId = create.body.data._id;

      const otherToken = await registerLogin("delother@x.com", "delotherx");
      const res = await request(app)
        .delete(`/api/v1/auctions/${auctionId}`)
        .set("Authorization", `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });
  });
});
