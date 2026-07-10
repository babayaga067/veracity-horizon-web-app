import { AuctionMongoRepository } from "../repositories/auction.repository";
import { IAuction } from "../models/auction.model";
import { HttpException } from "../exceptions/http-exception";
import { Types } from "mongoose";
import { normalizeImageUrls } from "../utils/image.util";

const auctionRepository = new AuctionMongoRepository();

const PREMIUM_CATEGORIES = ["Art", "Real Estate", "Vehicles", "Collectibles"];
const FEATURED_PRICE_THRESHOLD = 50000;

export class AuctionService {
  async getAllAuctions(page: number = 1, limit: number = 20, search?: string, status?: string): Promise<{ auctions: IAuction[]; total: number; totalPages: number }> {
    const result = await auctionRepository.getAll(page, limit, search, status);
    return result;
  }

  async getFeaturedAuctions(): Promise<IAuction[]> {
    const result = await auctionRepository.getAll(1, 50);
    return result.auctions
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
      currentBid: startingPrice,
      category: category as "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate" | "Textiles" | "Jewelry" | "Antiques" | "Food & Spices" | "Handicrafts" | "Musical Instruments" | "Books & Manuscripts" | "Furniture" | "Sports & Gear" | "Home & Living" | "Industrial Equipment" | "Luxury Goods" | "Agriculture & Livestock" | "Tools & Hardware" | "Ceramics & Pottery" | "Carpets & Rugs" | "Coins & Currency" | "Watches & Timepieces" | "Photography" | "Sculptures" | "Paintings" | "Textbooks & Academic" | "Outdoor & Adventure" | "Health & Wellness" | "Office Supplies" | "Children & Toys" | "Cultural Heritage" | "Religious Items" | "Digital Assets",
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
    const MIN_BID_INCREMENT = 1;

    if (amount <= 0) {
      throw new HttpException(400, "Bid amount must be positive");
    }

    const auction = await auctionRepository.getById(auctionId);
    if (!auction) {
      throw new HttpException(404, "Auction not found");
    }

    // Check if user is owner
    if (auction.owner.toString() === userId) {
      throw new HttpException(403, "Cannot bid on your own auction");
    }

    // Check auction status
    if (auction.status !== "active" && auction.status !== "open") {
      throw new HttpException(400, `Cannot place bid on ${auction.status} auction`);
    }

    // Check auction end time
    if (auction.endsAt && new Date() > auction.endsAt) {
      throw new HttpException(400, "Auction has already ended");
    }

    // Check minimum bid
    const currentHighest = auction.currentBid ?? auction.startingPrice ?? 0;
    const minRequiredBid = currentHighest + MIN_BID_INCREMENT;
    if (amount < minRequiredBid) {
      throw new HttpException(400, `Bid must be at least ${minRequiredBid} (current: ${currentHighest}, increment: ${MIN_BID_INCREMENT})`);
    }

    // Check idempotency key if provided
    if (idempotencyKey) {
      const existingBid = auction.bids?.find(b => b.idempotencyKey === idempotencyKey);
      if (existingBid) {
        throw new HttpException(409, "Bid already placed with this key");
      }
    }

    // Now perform atomic update - this prevents race conditions
    const updated = await auctionRepository.placeBidAtomic(auctionId, userId, amount, idempotencyKey);

    if (!updated) {
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