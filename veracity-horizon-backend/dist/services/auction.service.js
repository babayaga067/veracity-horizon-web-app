"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const auction_repository_1 = require("../repositories/auction.repository");
const http_exception_1 = require("../exceptions/http-exception");
const mongoose_1 = require("mongoose");
const auctionRepository = new auction_repository_1.AuctionMongoRepository();
const PREMIUM_CATEGORIES = ["Art", "Real Estate", "Vehicles", "Collectibles"];
const FEATURED_PRICE_THRESHOLD = 50000;
class AuctionService {
    async getAllAuctions(page = 1, limit = 20, search, status) {
        const result = await auctionRepository.getAll(page, limit, search, status);
        return result;
    }
    async getFeaturedAuctions() {
        const result = await auctionRepository.getAll(1, 50);
        return result.auctions
            .filter((a) => this._isFeatured(a))
            .sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0))
            .slice(0, 10);
    }
    _isFeatured(auction) {
        const isPremiumCategory = PREMIUM_CATEGORIES.includes(auction.category);
        const isHighValue = (auction.startingPrice || 0) >= FEATURED_PRICE_THRESHOLD;
        const hasMultipleBids = (auction.bids?.length || 0) >= 2;
        return auction.isFeatured || (isPremiumCategory && isHighValue) || hasMultipleBids;
    }
    async getAuctionById(id) {
        return await auctionRepository.getById(id);
    }
    async getAuctionsByOwnerId(ownerId) {
        return await auctionRepository.getByOwnerId(ownerId);
    }
    async getMyBids(userId) {
        return await auctionRepository.getBidsByUserId(userId);
    }
    async createAuction(auctionData, ownerId) {
        if (!auctionData.title || auctionData.startingPrice === undefined) {
            throw new http_exception_1.HttpException(400, "Auction must have a title and starting price");
        }
        if (!auctionData.category) {
            throw new http_exception_1.HttpException(400, "Auction must have a category");
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
            category: category,
            endsAt,
            owner: new mongoose_1.Types.ObjectId(ownerId),
            bids: [],
            isFeatured,
            imageUrls: auctionData.imageUrls || [],
        });
        return auction;
    }
    async placeBid(auctionId, userId, amount, idempotencyKey) {
        const MIN_BID_INCREMENT = 1;
        if (amount <= 0) {
            throw new http_exception_1.HttpException(400, "Bid amount must be positive");
        }
        const auction = await auctionRepository.getById(auctionId);
        if (!auction) {
            throw new http_exception_1.HttpException(404, "Auction not found");
        }
        // Check if user is owner
        if (auction.owner.toString() === userId) {
            throw new http_exception_1.HttpException(403, "Cannot bid on your own auction");
        }
        // Check auction status
        if (auction.status !== "active" && auction.status !== "open") {
            throw new http_exception_1.HttpException(400, `Cannot place bid on ${auction.status} auction`);
        }
        // Check auction end time
        if (auction.endsAt && new Date() > auction.endsAt) {
            throw new http_exception_1.HttpException(400, "Auction has already ended");
        }
        // Check minimum bid
        const currentHighest = auction.currentBid ?? auction.startingPrice ?? 0;
        const minRequiredBid = currentHighest + MIN_BID_INCREMENT;
        if (amount < minRequiredBid) {
            throw new http_exception_1.HttpException(400, `Bid must be at least ${minRequiredBid} (current: ${currentHighest}, increment: ${MIN_BID_INCREMENT})`);
        }
        // Check idempotency key if provided
        if (idempotencyKey) {
            const existingBid = auction.bids?.find(b => b.idempotencyKey === idempotencyKey);
            if (existingBid) {
                throw new http_exception_1.HttpException(409, "Bid already placed with this key");
            }
        }
        // Now perform atomic update - this prevents race conditions
        const updated = await auctionRepository.placeBidAtomic(auctionId, userId, amount, idempotencyKey);
        if (!updated) {
            throw new http_exception_1.HttpException(409, "Bid conflict - auction state changed");
        }
        return updated;
    }
    async updateAuction(id, auctionData) {
        const { endsAt, ...rest } = auctionData;
        const updateData = {
            ...rest,
            ...(endsAt && { endsAt: new Date(endsAt) }),
        };
        return await auctionRepository.updateAuction(id, updateData);
    }
    async deleteAuction(id) {
        return await auctionRepository.deleteAuction(id);
    }
}
exports.AuctionService = AuctionService;
//# sourceMappingURL=auction.service.js.map