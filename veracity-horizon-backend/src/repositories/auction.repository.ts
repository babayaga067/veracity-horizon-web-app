import { AuctionModel, IAuction } from "../models/auction.model";

export interface IAuctionRepository {
  getAll(): Promise<IAuction[]>;
  getById(id: string): Promise<IAuction | null>;
  createAuction(auction: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null>;
  deleteAuction(id: string): Promise<boolean>;
}

export class AuctionMongoRepository implements IAuctionRepository {
  async getAll(): Promise<IAuction[]> {
    return await AuctionModel.find().populate("owner").populate("bids.user");
  }

  async getById(id: string): Promise<IAuction | null> {
    return await AuctionModel.findById(id).populate("owner").populate("bids.user");
  }

  async createAuction(auction: Partial<IAuction>): Promise<IAuction> {
    return await AuctionModel.create(auction);
  }

  async updateAuction(id: string, auction: Partial<IAuction>): Promise<IAuction | null> {
    return await AuctionModel.findByIdAndUpdate(id, auction, { new: true });
  }

  async deleteAuction(id: string): Promise<boolean> {
    const deleted = await AuctionModel.findByIdAndDelete(id);
    return !!deleted;
  }
}
