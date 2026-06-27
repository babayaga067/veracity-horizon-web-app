import { AuctionModel, IAuction } from "../models/auction.model";

export interface IAuctionRepository {
  getAll(skip?: number, limit?: number): Promise<IAuction[]>;
  getById(id: string): Promise<IAuction | null>;
  getByOwnerId(ownerId: string): Promise<IAuction[]>;
  getBidsByUserId(userId: string): Promise<IAuction[]>;
  createAuction(auction: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
  deleteAuction(id: string): Promise<boolean>;
  placeBidAtomic(auctionId: string, userId: string, amount: number, idempotencyKey?: string): Promise<IAuction | null>;
}

export class AuctionMongoRepository implements IAuctionRepository {
  async getAll(skip = 0, limit = 20): Promise<IAuction[]> {
    return await AuctionModel.find().populate("owner").populate("bids.user").skip(skip).limit(limit);
  }

  async getByOwnerId(ownerId: string): Promise<IAuction[]> {
    return await AuctionModel.find({ owner: ownerId }).populate("owner").populate("bids.user");
  }

  async getBidsByUserId(userId: string): Promise<IAuction[]> {
    return await AuctionModel.find({ "bids.user": userId }).populate("owner").populate("bids.user");
  }

  async getById(id: string): Promise<IAuction | null> {
    return await AuctionModel.findById(id).populate("owner").populate("bids.user");
  }

  async createAuction(auction: Partial<IAuction>): Promise<IAuction> {
    return await AuctionModel.create(auction);
  }

  async updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null> {
    return await AuctionModel.findByIdAndUpdate(id, auction, { new: true }).populate("owner").populate("bids.user");
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
      { new: true }
    ).populate("owner").populate("bids.user");

    return updateResult;
  }
}
