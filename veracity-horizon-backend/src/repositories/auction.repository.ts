import { AuctionModel, IAuction } from "../models/auction.model";

export interface IAuctionRepository {
  getAll(page?: number, limit?: number, search?: string, status?: string, category?: string, minPrice?: number, maxPrice?: number): Promise<{ auctions: IAuction[]; total: number; totalPages: number }>;
  getFeatured(): Promise<IAuction[]>;
  getById(id: string): Promise<IAuction | null>;
  getByOwnerId(ownerId: string): Promise<IAuction[]>;
  getBidsByUserId(userId: string): Promise<IAuction[]>;
  createAuction(auction: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
  deleteAuction(id: string): Promise<boolean>;
  placeBidAtomic(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction | null>;
  getBidHistory(auctionId: string, page?: number, limit?: number): Promise<{ bids: any[]; total: number; totalPages: number }>;
  getSellerAnalytics(ownerId: string): Promise<{ totalAuctions: number; activeAuctions: number; totalRevenue: number; totalBidsReceived: number; wonAuctions: number; avgBidValue: number }>;
  getWonAuctionsByUserId(userId: string, page?: number, limit?: number): Promise<{ auctions: IAuction[]; total: number; totalPages: number }>;
}

export class AuctionMongoRepository implements IAuctionRepository {
  async getAll(page: number = 1, limit: number = 20, search?: string, status?: string, category?: string, minPrice?: number, maxPrice?: number): Promise<{ auctions: IAuction[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (minPrice !== undefined && minPrice !== null) {
      query.$expr = { $gte: [{ $ifNull: ["$currentBid", "$startingPrice"] }, minPrice] };
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      query.$expr = { ...(query.$expr as Record<string, unknown>), $lte: [{ $ifNull: ["$currentBid", "$startingPrice"] }, maxPrice] };
    }
    const auctions = await AuctionModel.find(query).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").skip(skip).limit(limit).lean();
    const total = await AuctionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    return { auctions, total, totalPages };
  }

  async getFeatured(): Promise<IAuction[]> {
    const PREMIUM_CATEGORIES = ["Art", "Real Estate", "Vehicles", "Collectibles"];
    const FEATURED_PRICE_THRESHOLD = 50000;

    const auctions = await AuctionModel.find({
      status: { $in: ["active", "open"] },
      $or: [
        { isFeatured: true },
        { category: { $in: PREMIUM_CATEGORIES }, startingPrice: { $gte: FEATURED_PRICE_THRESHOLD } },
      ],
    } as any)
      .populate("owner", "_id firstName lastName email username role createdAt updatedAt")
      .populate("bids.user", "_id firstName lastName email username")
      .lean();

    const featured = auctions
      .filter((a: any) => (a.bids?.length || 0) >= 2)
      .sort((a: any, b: any) => (b.bids?.length || 0) - (a.bids?.length || 0))
      .slice(0, 10);

    return featured as IAuction[];
  }

  async getByOwnerId(ownerId: string): Promise<IAuction[]> {
    return await AuctionModel.find({ owner: ownerId }).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").lean();
  }

  async getBidsByUserId(userId: string): Promise<IAuction[]> {
    return await AuctionModel.find({ "bids.user": userId }).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").lean();
  }

  async getById(id: string): Promise<IAuction | null> {
    return await AuctionModel.findById(id).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").lean();
  }

  async createAuction(auction: Partial<IAuction>): Promise<IAuction> {
    const created = await AuctionModel.create(auction);
    return created.toObject() as IAuction;
  }

  async updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null> {
    return await AuctionModel.findByIdAndUpdate(id, auction, { returnDocument: "after" }).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").lean();
  }

  async deleteAuction(id: string): Promise<boolean> {
    const deleted = await AuctionModel.findByIdAndDelete(id);
    return !!deleted;
  }

  async placeBidAtomic(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction | null> {
    const now = new Date();

    const filter: any = {
      _id: auctionId,
      endsAt: { $gt: now },
    };

    filter.$expr = {
      $gt: [amount, { $ifNull: ["$currentBid", "$startingPrice"] }]
    };

    if (idempotencyKey) {
      filter["bids.idempotencyKey"] = { $ne: idempotencyKey };
    }

    const updateResult = await AuctionModel.findOneAndUpdate(
      filter,
      {
        $push: {
          bids: {
            user: userId,
            amount,
            timestamp: now,
            ...(idempotencyKey && { idempotencyKey }),
          },
        },
        $max: { currentBid: amount },
      },
      { returnDocument: "after" }
    ).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").lean();

    return updateResult;
  }

  async getBidHistory(auctionId: string, page: number = 1, limit: number = 20): Promise<{ bids: any[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const auction = await AuctionModel.findById(auctionId).lean();
    if (!auction) return { bids: [], total: 0, totalPages: 1 };
    const bids = (auction.bids as any[] || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const total = bids.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return { bids: bids.slice(skip, skip + limit), total, totalPages };
  }

  async getSellerAnalytics(ownerId: string): Promise<{ totalAuctions: number; activeAuctions: number; totalRevenue: number; totalBidsReceived: number; wonAuctions: number; avgBidValue: number }> {
    const auctions = await AuctionModel.find({ owner: ownerId }).lean();
    const totalAuctions = auctions.length;
    const activeAuctions = auctions.filter((a: any) => a.status === "active" || a.status === "open").length;
    const closedAuctions = auctions.filter((a: any) => a.status === "closed");
    const totalRevenue = closedAuctions.reduce((sum: number, a: any) => sum + (a.currentBid || a.startingPrice || 0), 0);
    const totalBidsReceived = auctions.reduce((sum: number, a: any) => sum + (a.bids?.length || 0), 0);
    const wonAuctions = auctions.filter((a: any) => {
      if (!a.bids || a.bids.length === 0) return false;
      const sorted = [...a.bids].sort((x: any, y: any) => (y.amount || 0) - (x.amount || 0));
      const highestBid = sorted[0];
      if (!highestBid) return false;
      const bidderId = highestBid.user;
      if (!bidderId) return false;
      const bidderIdStr = typeof bidderId === "object" && bidderId !== null && "_id" in bidderId
        ? String(bidderId._id)
        : String(bidderId);
      return bidderIdStr === ownerId;
    }).length;
    const avgBidValue = totalBidsReceived > 0 ? Math.round(totalRevenue / totalBidsReceived) : 0;
    return { totalAuctions, activeAuctions, totalRevenue, totalBidsReceived, wonAuctions, avgBidValue };
  }

  async getWonAuctionsByUserId(userId: string, page: number = 1, limit: number = 20): Promise<{ auctions: IAuction[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const ObjectId = (await import("mongoose")).default.Types.ObjectId;
    const userObjectId = new ObjectId(userId);

    const auctions = await AuctionModel.find({
      status: "closed",
      "bids.user": userObjectId,
    })
      .populate("owner", "_id firstName lastName email username role createdAt updatedAt")
      .populate("bids.user", "_id firstName lastName email username")
      .lean();

    const won = auctions.filter((a: any) => {
      const sorted = [...(a.bids || [])].sort((x: any, y: any) => (y.amount || 0) - (x.amount || 0));
      return sorted.length > 0 && String(sorted[0].user?._id || sorted[0].user) === userId;
    });

    const total = won.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return { auctions: won.slice(skip, skip + limit), total, totalPages };
  }
}
