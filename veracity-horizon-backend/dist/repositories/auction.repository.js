"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionMongoRepository = void 0;
const auction_model_1 = require("../models/auction.model");
class AuctionMongoRepository {
    async getAll(page = 1, limit = 20, search, status) {
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }
        if (status && status !== "all") {
            query.status = status;
        }
        const auctions = await auction_model_1.AuctionModel.find(query).populate("owner").populate("bids.user").skip(skip).limit(limit);
        const total = await auction_model_1.AuctionModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit) || 1;
        return { auctions, total, totalPages };
    }
    async getByOwnerId(ownerId) {
        return await auction_model_1.AuctionModel.find({ owner: ownerId }).populate("owner").populate("bids.user");
    }
    async getBidsByUserId(userId) {
        return await auction_model_1.AuctionModel.find({ "bids.user": userId }).populate("owner").populate("bids.user");
    }
    async getById(id) {
        return await auction_model_1.AuctionModel.findById(id).populate("owner").populate("bids.user");
    }
    async createAuction(auction) {
        return await auction_model_1.AuctionModel.create(auction);
    }
    async updateAuction(id, auction) {
        return await auction_model_1.AuctionModel.findByIdAndUpdate(id, auction, { returnDocument: "after" }).populate("owner").populate("bids.user");
    }
    async deleteAuction(id) {
        const deleted = await auction_model_1.AuctionModel.findByIdAndDelete(id);
        return !!deleted;
    }
    async placeBidAtomic(auctionId, userId, amount, idempotencyKey) {
        const now = new Date();
        // Atomic bid placement with all validations
        const filter = {
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
        const updateResult = await auction_model_1.AuctionModel.findOneAndUpdate(filter, {
            $push: {
                bids: {
                    user: userId,
                    amount,
                    timestamp: now,
                    ...(idempotencyKey && { idempotencyKey }),
                },
            },
            $max: { currentBid: amount },
        }, { returnDocument: "after" }).populate("owner").populate("bids.user");
        return updateResult;
    }
}
exports.AuctionMongoRepository = AuctionMongoRepository;
//# sourceMappingURL=auction.repository.js.map