import { Request, Response, NextFunction } from "express";
import { AuctionService } from "../services/auction.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";

const auctionService = new AuctionService();

export class AuctionController {
  async listAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const auctions = await auctionService.getAllAuctions();
      return ApiResponseHelper.success(res, auctions, "Auctions fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getAuctionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }

      const auction = await auctionService.getAuctionById(id);
      if (!auction) {
        throw new HttpException(404, "Auction not found");
      }
      return ApiResponseHelper.success(res, auction, "Auction fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async createAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const auctionData = req.body;
      const ownerId = req.user?._id?.toString(); // safely convert ObjectId to string
      if (!ownerId) {
        throw new HttpException(401, "Unauthorized: missing user ID");
      }

      const auction = await auctionService.createAuction(auctionData, ownerId);
      return ApiResponseHelper.success(res, auction, "Auction created successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async placeBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }

      const { amount } = req.body;
      const userId = req.user?._id?.toString(); // safely convert ObjectId to string
      if (!userId) {
        throw new HttpException(401, "Unauthorized: missing user ID");
      }

      const bid = await auctionService.placeBid(id, userId, amount);
      return ApiResponseHelper.success(res, bid, "Bid placed successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }
}
