import { AuctionMongoRepository } from "../repositories/auction.repository";
import { IAuction } from "../models/auction.model";
import { HttpException } from "../exceptions/http-exception";
import { Types } from "mongoose";

const auctionRepository = new AuctionMongoRepository();

export class AuctionService {
  async getAllAuctions(): Promise<IAuction[]> {
    return await auctionRepository.getAll();
  }

  async getAuctionById(id: string): Promise<IAuction | null> {
    return await auctionRepository.getById(id);
  }

  async createAuction(auctionData: Partial<IAuction>, ownerId: string): Promise<IAuction> {
    if (!auctionData.title || auctionData.startingPrice === undefined) {
      throw new HttpException(400, "Auction must have a title and starting price");
    }

    const auction = await auctionRepository.createAuction({
      ...auctionData,
      owner: new Types.ObjectId(ownerId),
      bids: [],
      createdAt: new Date(),
    });

    return auction;
  }

  async placeBid(auctionId: string, userId: string, amount: number) {
    const auction = await auctionRepository.getById(auctionId);
    if (!auction) throw new HttpException(404, "Auction not found");

    //  Ensure bids and startingPrice are defined
    const bids = auction.bids ?? [];
    const startingPrice = auction.startingPrice ?? 0;

    //  Extract the last bid to satisfy TypeScript's strict index checking
    const lastBid = bids[bids.length - 1];
    const highestBid = lastBid ? lastBid.amount : startingPrice;

    if (amount <= highestBid) {
      throw new HttpException(400, "Bid must be higher than current highest bid");
    }

    auction.bids = [
      ...bids,
      {
        user: new Types.ObjectId(userId),
        amount,
        timestamp: new Date(),
      },
    ];

    await auction.save();
    return auction;
  }
}