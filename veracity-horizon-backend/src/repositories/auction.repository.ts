import { AuctionModel, IAuction } from "../models/auction.model";

export interface IAuctionRepository {
  getAll(page?: number, limit?: number, search?: string, status?: string): Promise<{ auctions: IAuction[]; total: number; totalPages: number }>;
  getById(id: string): Promise<IAuction | null>;
  getByOwnerId(ownerId: string): Promise<IAuction[]>;
  getBidsByUserId(userId: string): Promise<IAuction[]>;
  createAuction(auction: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
  deleteAuction(id: string): Promise<boolean>;
  placeBidAtomic(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction | null>;
}

export class AuctionMongoRepository implements IAuctionRepository {
  async getAll(page: number = 1, limit: number = 20, search?: string, status?: string): Promise<{ auctions: IAuction[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    const auctions = await AuctionModel.find(query).populate("owner", "_id firstName lastName email username role createdAt updatedAt").populate("bids.user", "_id firstName lastName email username").skip(skip).limit(limit).lean();
    const total = await AuctionModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    return { auctions, total, totalPages };
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

    // Atomic bid placement with all validations
    const filter: any = {
      _id: auctionId,
      status: { $in: ["active", "open"] },
      endsAt: { $gt: now },
      owner: { $ne: userId },
    };

    // Validate bid is higher than current highest (startingPrice or currentBid)
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
}
