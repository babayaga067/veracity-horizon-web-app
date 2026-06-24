import { Request, Response, NextFunction } from "express";
import { AuctionService } from "../services/auction.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { z } from "zod";
import { CreateAuctionSchema } from "../dtos/auction.dto";
import { IAuction } from "../models/auction.model";

const auctionService = new AuctionService();

const PlaceBidSchema = z.object({
  amount: z.number().positive("Bid must be a positive number"),
});

export class AuctionController {
  async listAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const skip = (page - 1) * limit;
      const auctions = await auctionService.getAllAuctions(skip, limit);
      return ApiResponseHelper.success(res, auctions, "Auctions fetched successfully");
    } catch (error: unknown) {
      return ApiResponseHelper.error(res, error instanceof Error ? error.message : "Internal Server Error", error instanceof Error && "status" in error ? (error as { status: number }).status : 500);
    }
  }

  async getFeaturedAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const auctions = await auctionService.getFeaturedAuctions();
      return ApiResponseHelper.success(res, auctions, "Featured auctions fetched successfully");
    } catch (error) {
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      console.error("Unexpected error:", error);
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
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
    } catch (error) {
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      console.error("Unexpected error:", error);
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
  }

  async getMyAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?._id?.toString();
      console.log("[getMyAuctions] incoming, ownerId:", ownerId);
      if (!ownerId) {
        throw new HttpException(401, "Unauthorized");
      }

      const auctions = await auctionService.getAuctionsByOwnerId(ownerId);
      console.log("[getMyAuctions] returning", auctions.length, "auctions");
      return ApiResponseHelper.success(res, auctions, "My auctions fetched successfully");
    } catch (error) {
      console.error("[getMyAuctions] error:", error);
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
  }

  async getMyBids(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      console.log("[getMyBids] incoming, userId:", userId);
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }

      const auctions = await auctionService.getMyBids(userId);
      console.log("[getMyBids] returning", auctions.length, "auctions");
      return ApiResponseHelper.success(res, auctions, "My bids fetched successfully");
    } catch (error) {
      console.error("[getMyBids] error:", error);
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
  }

  async createAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateAuctionSchema.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsedData.error), 400);
      }

      const auctionData = parsedData.data;
      const ownerId = req.user?._id?.toString();
      if (!ownerId) {
        throw new HttpException(401, "Unauthorized: missing user ID");
      }

      const imageUrls: string[] = auctionData.imageUrls || [];
      const { endsAt, ...rest } = auctionData;
      const auctionInput: Partial<IAuction> = {
        ...rest,
        imageUrls,
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
      };

      const auction = await auctionService.createAuction(auctionInput, ownerId);
      return ApiResponseHelper.success(res, auction, "Auction created successfully");
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      const message = error instanceof Error ? error.message : "Internal Server Error";
      const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
      return ApiResponseHelper.error(res, message, status);
    }
  }

  async placeBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }

      const parsedBody = PlaceBidSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsedBody.error), 400);
      }

      const { amount } = parsedBody.data;
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: missing user ID");
      }

      const bid = await auctionService.placeBid(id, userId, amount);
      return ApiResponseHelper.success(res, bid, "Bid placed successfully");
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      const message = error instanceof Error ? error.message : "Internal Server Error";
      const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
      return ApiResponseHelper.error(res, message, status);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, "No file uploaded");
      }

      const filename = req.file.filename;
      const imageUrl = `${req.protocol}://${req.get("host")}/api/v1/auctions/images/${filename}`;
      
      return ApiResponseHelper.success(res, { url: imageUrl }, "Image uploaded successfully");
    } catch (error) {
      if (error instanceof HttpException) {
        return ApiResponseHelper.error(res, error.message, error.status);
      }
      console.error("Unexpected error:", error);
      return ApiResponseHelper.error(res, "Internal Server Error", 500);
    }
  }
}
