import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuctionService } from "../../../src/services/auction.service";
import { HttpException } from "../../../src/exceptions/http-exception";

/**
 * UNIT TESTS — SERVICE LAYER (Auction)
 * Focuses on the bidding engine: minimum increment, self-bid prevention,
 * status/expiry checks, idempotency-key rejection, and featured ranking.
 */
vi.mock("../../../src/repositories/auction.repository", () => {
  const instance = {
    getAll: vi.fn(),
    getFeatured: vi.fn(),
    getById: vi.fn(),
    getByOwnerId: vi.fn(),
    getBidsByUserId: vi.fn(),
    createAuction: vi.fn(),
    updateAuction: vi.fn(),
    deleteAuction: vi.fn(),
    placeBidAtomic: vi.fn(),
  };
  return {
    AuctionMongoRepository: class {
      getAll = instance.getAll;
      getFeatured = instance.getFeatured;
      getById = instance.getById;
      getByOwnerId = instance.getByOwnerId;
      getBidsByUserId = instance.getBidsByUserId;
      createAuction = instance.createAuction;
      updateAuction = instance.updateAuction;
      deleteAuction = instance.deleteAuction;
      placeBidAtomic = instance.placeBidAtomic;
    },
  };
});

import { AuctionMongoRepository } from "../../../src/repositories/auction.repository";

const auctionRepo = () => new (AuctionMongoRepository as any)();

const ownerId = "64b2c1f4e1b2c3a4d5e6f708";
const bidderId = "64b2c1f4e1b2c3a4d5e6f709";

function makeAuction(overrides: any = {}) {
  return {
    _id: "auc1",
    title: "Item",
    description: "desc",
    startingPrice: 100,
    currentBid: 100,
    owner: ownerId,
    category: "Art",
    status: "active",
    isFeatured: false,
    imageUrls: [],
    endsAt: new Date(Date.now() + 86400000),
    bids: [],
    ...overrides,
  };
}

describe("services/AuctionService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createAuction", () => {
    it("rejects an auction without a title", async () => {
      const repo = auctionRepo();
      repo.createAuction.mockResolvedValue(makeAuction());
      await expect(
        new AuctionService().createAuction(
          { startingPrice: 10, category: "Art" } as any,
          ownerId
        )
      ).rejects.toBeInstanceOf(HttpException);
    });

    it("flags premium categories as featured and sets a default end date", async () => {
      const repo = auctionRepo();
      repo.createAuction.mockResolvedValue(makeAuction({ isFeatured: true }));
      await new AuctionService().createAuction(
        { title: "Art piece", startingPrice: 60000, category: "Art" } as any,
        ownerId
      );
      const created = repo.createAuction.mock.calls[0][0];
      expect(created.isFeatured).toBe(true);
      expect((created.endsAt as Date).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("placeBid", () => {
    it("rejects a bid below the minimum increment", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(makeAuction({ currentBid: 100 }));
      await expect(new AuctionService().placeBid("auc1", bidderId, 50))
        .rejects.toMatchObject({ status: 400 });
    });

    it("rejects a bid from the auction owner", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(makeAuction({ owner: bidderId }));
      await expect(new AuctionService().placeBid("auc1", bidderId, 200))
        .rejects.toMatchObject({ status: 403 });
    });

    it("rejects a bid on a closed auction", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(
        makeAuction({ status: "closed", currentBid: 100 })
      );
      await expect(new AuctionService().placeBid("auc1", bidderId, 200))
        .rejects.toMatchObject({ status: 400 });
    });

    it("rejects a bid on an ended auction", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(
        makeAuction({ endsAt: new Date(Date.now() - 1000), currentBid: 100 })
      );
      await expect(new AuctionService().placeBid("auc1", bidderId, 200))
        .rejects.toMatchObject({ status: 400 });
    });

    it("rejects a duplicate idempotency key", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(
        makeAuction({
          currentBid: 100,
          bids: [{ idempotencyKey: "key-1", amount: 150, user: bidderId }],
        })
      );
      await expect(
        new AuctionService().placeBid("auc1", bidderId, 200, "key-1")
      ).rejects.toMatchObject({ status: 409 });
    });

    it("delegates a valid bid to the atomic repository method", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(makeAuction({ currentBid: 100 }));
      repo.placeBidAtomic.mockResolvedValue(makeAuction({ currentBid: 200 }));
      const result = await new AuctionService().placeBid(
        "auc1",
        bidderId,
        200,
        "key-2"
      );
      expect(repo.placeBidAtomic).toHaveBeenCalledWith(
        "auc1",
        bidderId,
        200,
        "key-2"
      );
      expect(result.currentBid).toBe(200);
    });

    it("throws 409 when the atomic update reports a conflict", async () => {
      const repo = auctionRepo();
      repo.getById.mockResolvedValue(makeAuction({ currentBid: 100 }));
      repo.placeBidAtomic.mockResolvedValue(null);
      await expect(
        new AuctionService().placeBid("auc1", bidderId, 200, "key-3")
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("getFeaturedAuctions", () => {
    it("prioritises premium/high-value and multi-bid auctions", async () => {
      const repo = auctionRepo();
      repo.getFeatured.mockResolvedValue([
        makeAuction({ _id: "hot", category: "Art", startingPrice: 60000, bids: [{ amount: 1 }] }),
        makeAuction({ _id: "low", category: "Art", startingPrice: 10, bids: [] }),
      ]);
      const featured = await new AuctionService().getFeaturedAuctions();
      expect(featured.map((a: any) => a._id)).toContain("hot");
      expect(featured[0]._id).toBe("hot");
    });
  });
});
