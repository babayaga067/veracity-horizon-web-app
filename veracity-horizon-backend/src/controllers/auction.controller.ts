import { Request, Response, NextFunction } from "express";
import { AuctionService } from "../services/auction.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { z } from "zod";
import { CreateAuctionSchema } from "../dtos/auction.dto";
import { IAuction } from "../models/auction.model";
import { normalizeImageUrls } from "../utils/image.util";

const auctionService = new AuctionService();

function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return ApiResponseHelper.error(res, message, 500);
}

function getOwnerId(owner: unknown): string {
  if (owner && typeof owner === "object") {
    const ownerObj = owner as Record<string, unknown>;
    if ("_id" in ownerObj && ownerObj._id != null) {
      return String(ownerObj._id);
    }
    if ("id" in ownerObj && ownerObj.id != null) {
      return String(ownerObj.id);
    }
  }
  return String(owner);
}

const PlaceBidSchema = z.object({
  amount: z.number().positive("Bid must be a positive number"),
});

export class AuctionController {
  async listAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";
      const category = (req.query.category as string) || "";
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      const sortBy = (req.query.sortBy as string) || "endsAt";
      const sortOrder = (req.query.sortOrder as string) || "asc";
      const result = await auctionService.getAllAuctions(page, limit, search, status, category, minPrice, maxPrice, sortBy, sortOrder);
      return ApiResponseHelper.success(res, result.auctions.map(a => ({ ...a, imageUrls: normalizeImageUrls(a.imageUrls) })), "Auctions fetched successfully", 200, {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async getFeaturedAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const auctions = await auctionService.getFeaturedAuctions();
      return ApiResponseHelper.success(res, auctions.map(a => ({ ...a, imageUrls: normalizeImageUrls(a.imageUrls) })), "Featured auctions fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = [
        "Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate",
        "Textiles", "Jewelry", "Antiques", "Food & Spices", "Handicrafts",
        "Musical Instruments", "Books & Manuscripts", "Furniture", "Sports & Gear",
        "Home & Living", "Industrial Equipment", "Luxury Goods", "Agriculture & Livestock",
        "Tools & Hardware", "Ceramics & Pottery", "Carpets & Rugs", "Coins & Currency",
        "Watches & Timepieces", "Photography", "Sculptures", "Paintings",
        "Textbooks & Academic", "Outdoor & Adventure", "Health & Wellness",
        "Office Supplies", "Children & Toys", "Cultural Heritage", "Religious Items", "Digital Assets",
      ];
      return ApiResponseHelper.success(res, categories, "Categories fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
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
      return ApiResponseHelper.success(res, { ...auction, imageUrls: normalizeImageUrls(auction.imageUrls) }, "Auction fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getMyAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?._id?.toString();
      if (!ownerId) {
        throw new HttpException(401, "Unauthorized");
      }
      const auctions = await auctionService.getAuctionsByOwnerId(ownerId);
      return ApiResponseHelper.success(res, auctions.map(a => ({ ...a, imageUrls: normalizeImageUrls(a.imageUrls) })), "My auctions fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getMyBids(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }
      const auctions = await auctionService.getMyBids(userId);
      return ApiResponseHelper.success(res, auctions.map(a => ({ ...a, imageUrls: normalizeImageUrls(a.imageUrls) })), "My bids fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getBidHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const result = await auctionService.getBidHistory(id, page, limit);
      return ApiResponseHelper.success(res, result.bids, "Bid history fetched successfully", 200, {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getWonAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized");
      }
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const result = await auctionService.getWonAuctions(userId, page, limit);
      return ApiResponseHelper.success(res, result.auctions.map(a => ({ ...a, imageUrls: normalizeImageUrls(a.imageUrls) })), "Won auctions fetched successfully", 200, {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async getSellerAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }
      const auction = await auctionService.getAuctionById(id);
      if (!auction) {
        throw new HttpException(404, "Auction not found");
      }
      const ownerId = getOwnerId(auction.owner);
      const result = await auctionService.getSellerAnalytics(ownerId);
      return ApiResponseHelper.success(res, result, "Seller analytics fetched successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async createAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateAuctionSchema.safeParse(req.body);
      if (!parsedData.success) {
        const formattedError = z.treeifyError(parsedData.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }
      const auctionData = parsedData.data;
      const ownerId = req.user?._id?.toString();
      if (!ownerId) {
        throw new HttpException(401, "Unauthorized: missing user ID");
      }
      const imageUrls: string[] = auctionData.imageUrls || [];
      const { endsAt, status, isFeatured, ...rest } = auctionData;
      const auctionInput: Partial<IAuction> = {
        ...rest,
        imageUrls,
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
        ...(status ? { status } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
      };
      const auction = await auctionService.createAuction(auctionInput, ownerId);
      return ApiResponseHelper.success(res, { ...auction, imageUrls: normalizeImageUrls(auction.imageUrls) }, "Auction created successfully");
    } catch (error: unknown) {
      return handleControllerError(res, error);
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
        const formattedError = z.treeifyError(parsedBody.error);
        return ApiResponseHelper.error(res, JSON.stringify(formattedError), 400);
      }
      const { amount } = parsedBody.data;
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new HttpException(401, "Unauthorized: missing user ID");
      }
      const idempotencyKey = req.headers["x-idempotency-key"] as string | undefined;
      const bid = await auctionService.placeBid(id, userId, amount, idempotencyKey);
      return ApiResponseHelper.success(res, { ...bid, imageUrls: normalizeImageUrls(bid.imageUrls) }, "Bid placed successfully");
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpException(400, "No file uploaded");
      }
      const filename = req.file.filename;
      const imageUrl = `${req.protocol}://${req.get("host")}/api/v1/images/${filename}`;
      return ApiResponseHelper.success(res, { url: imageUrl }, "Image uploaded successfully");
    } catch (error) {
      return handleControllerError(res, error);
    }
  }

  async updateAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }
      const auction = await auctionService.getAuctionById(id);
      if (!auction) {
        throw new HttpException(404, "Auction not found");
      }
      if (getOwnerId(auction.owner) !== userId && req.user?.role !== "admin") {
        throw new HttpException(403, "Forbidden: Not the owner or admin");
      }
      const updated = await auctionService.updateAuction(id, req.body);
      if (!updated) {
        throw new HttpException(404, "Auction not found");
      }
      return ApiResponseHelper.success(res, { ...updated, imageUrls: normalizeImageUrls(updated.imageUrls) }, "Auction updated successfully");
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }

  async deleteAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();
      if (!id || Array.isArray(id)) {
        throw new HttpException(400, "Invalid auction ID");
      }
      const auction = await auctionService.getAuctionById(id);
      if (!auction) {
        throw new HttpException(404, "Auction not found");
      }
      if (getOwnerId(auction.owner) !== userId && req.user?.role !== "admin") {
        throw new HttpException(403, "Forbidden: Not the owner or admin");
      }
      const deleted = await auctionService.deleteAuction(id);
      if (!deleted) {
        throw new HttpException(404, "Auction not found");
      }
      return ApiResponseHelper.success(res, null, "Auction deleted successfully");
    } catch (error: unknown) {
      return handleControllerError(res, error);
    }
  }
}