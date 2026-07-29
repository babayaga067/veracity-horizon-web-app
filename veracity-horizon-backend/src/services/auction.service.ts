import { AuctionMongoRepository } from "../repositories/auction.repository";
import { IAuction } from "../models/auction.model";
import { HttpException } from "../exceptions/http-exception";
import { Types } from "mongoose";
import { normalizeImageUrls } from "../utils/image.util";
import { NotificationService } from "./notification.service";
import { MIN_BID_INCREMENT } from "../configs/constant";

const auctionRepository = new AuctionMongoRepository();
const notificationService = new NotificationService();

const PREMIUM_CATEGORIES = ["Art", "Real Estate", "Vehicles", "Collectibles"];
const FEATURED_PRICE_THRESHOLD = 50000;

export class AuctionService {
  async getAllAuctions(page: number = 1, limit: number = 20, search?: string, status?: string, category?: string, minPrice?: number, maxPrice?: number, sortBy?: string, sortOrder?: string): Promise<{ auctions: IAuction[]; total: number; totalPages: number }> {
    const result = await auctionRepository.getAll(page, limit, search, status, category, minPrice, maxPrice);
    return result;
  }

  async getFeaturedAuctions(): Promise<IAuction[]> {
    const result = await auctionRepository.getFeatured();
    return result;
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

  async getBidHistory(auctionId: string, page: number = 1, limit: number = 20): Promise<{ bids: any[]; total: number; totalPages: number }> {
    return await auctionRepository.getBidHistory(auctionId, page, limit);
  }

  async getSellerAnalytics(ownerId: string): Promise<{ totalAuctions: number; activeAuctions: number; totalRevenue: number; totalBidsReceived: number; wonAuctions: number; avgBidValue: number }> {
    return await auctionRepository.getSellerAnalytics(ownerId);
  }

  async getWonAuctions(userId: string, page = 1, limit = 20): Promise<{ auctions: IAuction[]; total: number; totalPages: number }> {
    return await auctionRepository.getWonAuctionsByUserId(userId, page, limit);
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
      currentBid: startingPrice,
      category: category as IAuction["category"],
      endsAt,
      owner: new Types.ObjectId(ownerId),
      bids: [],
      isFeatured,
      imageUrls: normalizeImageUrls(auctionData.imageUrls),
      status: "upcoming",
    });

    return auction;
  }

  async placeBid(auctionId: string, userId: string, amount: number, idempotencyKey?: string) {
    if (amount <= 0) {
      throw new HttpException(400, "Bid amount must be positive");
    }

    const auction = await auctionRepository.getById(auctionId);
    if (!auction) {
      throw new HttpException(404, "Auction not found");
    }

    const ownerId =
      auction.owner && typeof auction.owner === "object" && "_id" in auction.owner
        ? String((auction.owner as { _id: unknown })._id)
        : String(auction.owner);
    if (ownerId === userId) {
      throw new HttpException(403, "Cannot bid on your own auction");
    }

    if (auction.status !== "active" && auction.status !== "open") {
      throw new HttpException(400, `Cannot place bid on ${auction.status} auction`);
    }

    if (auction.endsAt && new Date() > auction.endsAt) {
      throw new HttpException(400, "Auction has already ended");
    }

    const currentHighest = auction.currentBid ?? auction.startingPrice ?? 0;
    const minRequiredBid = currentHighest + MIN_BID_INCREMENT;
    if (amount < minRequiredBid) {
      throw new HttpException(400, `Bid must be at least ${minRequiredBid} (current: ${currentHighest}, increment: ${MIN_BID_INCREMENT})`);
    }

if (idempotencyKey) {
      const existingBid = auction.bids?.find(b => b.idempotencyKey === idempotencyKey);
      if (existingBid) {
        throw new HttpException(409, "Bid already placed with this key");
      }
    }

    const updated = await auctionRepository.placeBidAtomic(auctionId, userId, amount, idempotencyKey);

    if (!updated) {
      const latestAuction = await auctionRepository.getById(auctionId);
      if (latestAuction && latestAuction.endsAt && new Date() > latestAuction.endsAt) {
        throw new HttpException(400, "Auction has already ended");
      }
      const currentHighest = latestAuction?.currentBid ?? latestAuction?.startingPrice ?? 0;
      const minRequiredBid = currentHighest + MIN_BID_INCREMENT;
      if (amount < minRequiredBid) {
        throw new HttpException(400, `Bid must be at least ${minRequiredBid} (current: ${currentHighest}, increment: ${MIN_BID_INCREMENT})`);
      }
      throw new HttpException(409, "Bid conflict - auction state changed");
    }

    return updated;
  }

  async updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction | null> {
    const { endsAt, ...rest } = auctionData;
    const updateData: Partial<IAuction> = {
      ...rest,
      ...(endsAt && { endsAt: new Date(endsAt as string | Date) }),
      ...(rest.imageUrls !== undefined && { imageUrls: normalizeImageUrls(rest.imageUrls as string[]) }),
    };
    return await auctionRepository.updateAuction(id, updateData);
  }

  async deleteAuction(id: string): Promise<boolean> {
    return await auctionRepository.deleteAuction(id);
  }
}