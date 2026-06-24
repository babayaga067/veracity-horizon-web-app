import { AuctionMongoRepository } from "../repositories/auction.repository";
import { IAuction } from "../models/auction.model";
import { HttpException } from "../exceptions/http-exception";
import { Types } from "mongoose";

const auctionRepository = new AuctionMongoRepository();

const PREMIUM_CATEGORIES = ["Art", "Real Estate", "Vehicles", "Collectibles"];
const FEATURED_PRICE_THRESHOLD = 50000;

export class AuctionService {
  async getAllAuctions(skip = 0, limit = 20): Promise<IAuction[]> {
    return await auctionRepository.getAll(skip, limit);
  }

  async getFeaturedAuctions(): Promise<IAuction[]> {
    const auctions = await auctionRepository.getAll();
    return auctions
      .filter((a) => this._isFeatured(a))
      .sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0))
      .slice(0, 10);
  }

  private _isFeatured(auction: IAuction): boolean {
    const isPremiumCategory = PREMIUM_CATEGORIES.includes(auction.category);
    const isHighValue = (auction.startingPrice || 0) >= FEATURED_PRICE_THRESHOLD;
    const hasMultipleBids = (auction.bids?.length || 0) >= 2;

    return auction.isFeatured || (isPremiumCategory && isHighValue) || hasMultipleBids;
  }

  async getAuctionById(id: string): Promise<IAuction | null> {
    return await auctionRepository.getById(id);
  }

  async getAuctionsByOwnerId(ownerId: string): Promise<IAuction[]> {
    return await auctionRepository.getByOwnerId(ownerId);
  }

  async getMyBids(userId: string): Promise<IAuction[]> {
    return await auctionRepository.getBidsByUserId(userId);
  }

  async createAuction(auctionData: Partial<IAuction>, ownerId: string): Promise<IAuction> {
    if (!auctionData.title || auctionData.startingPrice === undefined) {
      throw new HttpException(400, "Auction must have a title and starting price");
    }
    if (!auctionData.category) {
      throw new HttpException(400, "Auction must have a category");
    }

    const endsAt = auctionData.endsAt ? new Date(auctionData.endsAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const startingPrice = auctionData.startingPrice || 0;
    const category = auctionData.category;

    const isFeatured = (PREMIUM_CATEGORIES.includes(category) && startingPrice >= FEATURED_PRICE_THRESHOLD)
      || (auctionData.isFeatured === true);

    const auction = await auctionRepository.createAuction({
      title: auctionData.title,
      description: auctionData.description || "",
      startingPrice,
      category: category as "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate",
      endsAt,
      owner: new Types.ObjectId(ownerId),
      bids: [],
      isFeatured,
      imageUrls: auctionData.imageUrls || [],
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