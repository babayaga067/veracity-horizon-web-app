import { AuctionModel, IAuction } from "../models/auction.model";

export interface IAuctionRepository {
  getAll(skip?: number, limit?: number): Promise<IAuction[]>;
  getById(id: string): Promise<IAuction | null>;
  getByOwnerId(ownerId: string): Promise<IAuction[]>;
  getBidsByUserId(userId: string): Promise<IAuction[]>;
  createAuction(auction: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
  deleteAuction(id: string): Promise<boolean>;
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
}
