"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const auction_service_1 = require("../services/auction.service");
const apihelper_util_1 = require("../utils/apihelper.util");
const http_exception_1 = require("../exceptions/http-exception");
const zod_1 = require("zod");
const auction_dto_1 = require("../dtos/auction.dto");
const auctionService = new auction_service_1.AuctionService();
function handleControllerError(res, error) {
    if (error instanceof http_exception_1.HttpException) {
        return apihelper_util_1.ApiResponseHelper.error(res, error.message, error.status);
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = error instanceof Error && "status" in error ? error.status : 500;
    return apihelper_util_1.ApiResponseHelper.error(res, message, status);
}
const PlaceBidSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("Bid must be a positive number"),
});
class AuctionController {
    async listAuctions(req, res, next) {
        try {
            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
            const search = req.query.search || "";
            const status = req.query.status || "";
            const result = await auctionService.getAllAuctions(page, limit, search, status);
            return apihelper_util_1.ApiResponseHelper.success(res, result.auctions, "Auctions fetched successfully", 200, {
                page,
                limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async getFeaturedAuctions(req, res, next) {
        try {
            const auctions = await auctionService.getFeaturedAuctions();
            return apihelper_util_1.ApiResponseHelper.success(res, auctions, "Featured auctions fetched successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async getAuctionById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid auction ID");
            }
            const auction = await auctionService.getAuctionById(id);
            if (!auction) {
                throw new http_exception_1.HttpException(404, "Auction not found");
            }
            return apihelper_util_1.ApiResponseHelper.success(res, auction, "Auction fetched successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async getMyAuctions(req, res, next) {
        try {
            const ownerId = req.user?._id?.toString();
            if (!ownerId) {
                throw new http_exception_1.HttpException(401, "Unauthorized");
            }
            const auctions = await auctionService.getAuctionsByOwnerId(ownerId);
            return apihelper_util_1.ApiResponseHelper.success(res, auctions, "My auctions fetched successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async getMyBids(req, res, next) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new http_exception_1.HttpException(401, "Unauthorized");
            }
            const auctions = await auctionService.getMyBids(userId);
            return apihelper_util_1.ApiResponseHelper.success(res, auctions, "My bids fetched successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async createAuction(req, res, next) {
        try {
            const parsedData = auction_dto_1.CreateAuctionSchema.safeParse(req.body);
            if (!parsedData.success) {
                const formattedError = zod_1.z.treeifyError(parsedData.error);
                return apihelper_util_1.ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
            }
            const auctionData = parsedData.data;
            const ownerId = req.user?._id?.toString();
            if (!ownerId) {
                throw new http_exception_1.HttpException(401, "Unauthorized: missing user ID");
            }
            const imageUrls = auctionData.imageUrls || [];
            const { endsAt, ...rest } = auctionData;
            const auctionInput = {
                ...rest,
                imageUrls,
                ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
            };
            const auction = await auctionService.createAuction(auctionInput, ownerId);
            return apihelper_util_1.ApiResponseHelper.success(res, auction, "Auction created successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async placeBid(req, res, next) {
        try {
            const { id } = req.params;
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid auction ID");
            }
            const parsedBody = PlaceBidSchema.safeParse(req.body);
            if (!parsedBody.success) {
                const formattedError = zod_1.z.treeifyError(parsedBody.error);
                return apihelper_util_1.ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
            }
            const { amount } = parsedBody.data;
            const userId = req.user?._id?.toString();
            if (!userId) {
                throw new http_exception_1.HttpException(401, "Unauthorized: missing user ID");
            }
            const idempotencyKey = req.headers["x-idempotency-key"];
            const bid = await auctionService.placeBid(id, userId, amount, idempotencyKey);
            return apihelper_util_1.ApiResponseHelper.success(res, bid, "Bid placed successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                throw new http_exception_1.HttpException(400, "No file uploaded");
            }
            const filename = req.file.filename;
            const imageUrl = `${req.protocol}://${req.get("host")}/api/v1/images/${filename}`;
            return apihelper_util_1.ApiResponseHelper.success(res, { url: imageUrl }, "Image uploaded successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async updateAuction(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid auction ID");
            }
            const auction = await auctionService.getAuctionById(id);
            if (!auction) {
                throw new http_exception_1.HttpException(404, "Auction not found");
            }
            if (auction.owner.toString() !== userId && req.user?.role !== "admin") {
                throw new http_exception_1.HttpException(403, "Forbidden: Not the owner or admin");
            }
            const updated = await auctionService.updateAuction(id, req.body);
            if (!updated) {
                throw new http_exception_1.HttpException(404, "Auction not found");
            }
            return apihelper_util_1.ApiResponseHelper.success(res, updated, "Auction updated successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
    async deleteAuction(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?._id?.toString();
            if (!id || Array.isArray(id)) {
                throw new http_exception_1.HttpException(400, "Invalid auction ID");
            }
            const auction = await auctionService.getAuctionById(id);
            if (!auction) {
                throw new http_exception_1.HttpException(404, "Auction not found");
            }
            if (auction.owner.toString() !== userId && req.user?.role !== "admin") {
                throw new http_exception_1.HttpException(403, "Forbidden: Not the owner or admin");
            }
            const deleted = await auctionService.deleteAuction(id);
            if (!deleted) {
                throw new http_exception_1.HttpException(404, "Auction not found");
            }
            return apihelper_util_1.ApiResponseHelper.success(res, null, "Auction deleted successfully");
        }
        catch (error) {
            return handleControllerError(res, error);
        }
    }
}
exports.AuctionController = AuctionController;
//# sourceMappingURL=auction.controller.js.map