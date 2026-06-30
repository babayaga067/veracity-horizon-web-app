import { Request, Response, NextFunction } from "express";
import { AuctionService } from "../services/auction.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { z } from "zod";
import { CreateAuctionSchema } from "../dtos/auction.dto";
import { IAuction } from "../models/auction.model";

const auctionService = new AuctionService();

function cleanImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const idx = trimmed.indexOf("/api/v1/images/");
    if (idx !== -1) return trimmed.slice(idx + "/api/v1/images/".length);
    return trimmed;
  }
  if (trimmed.startsWith("/api/v1/images/")) return trimmed.slice("/api/v1/images/".length);
  const name = trimmed.split("/").pop() || trimmed;
  return name;
}

function normalizeAuctionResponse<T extends { imageUrls?: string[] }>(data: T): T {
  if (data.imageUrls) {
    return { ...data, imageUrls: data.imageUrls.map(cleanImageUrl) };
  }
  return data;
}

function handleControllerError(res: Response, error: unknown): Response {
  if (error instanceof HttpException) {
    return ApiResponseHelper.error(res, error.message, error.status);
  }
  const message = error instanceof Error ? error.message : "Internal Server Error";
  const status = error instanceof Error && "status" in error ? (error as { status: number }).status : 500;
  return ApiResponseHelper.error(res, message, status);
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
      const result = await auctionService.getAllAuctions(page, limit, search, status);
      return ApiResponseHelper.success(res, result.auctions.map(normalizeAuctionResponse), "Auctions fetched successfully", 200, {
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
      return ApiResponseHelper.success(res, auctions.map(normalizeAuctionResponse), "Featured auctions fetched successfully");
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
      return ApiResponseHelper.success(res, normalizeAuctionResponse(auction), "Auction fetched successfully");
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
      return ApiResponseHelper.success(res, auctions.map(normalizeAuctionResponse), "My auctions fetched successfully");
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
      return ApiResponseHelper.success(res, auctions.map(normalizeAuctionResponse), "My bids fetched successfully");
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
      const { endsAt, ...rest } = auctionData;
      const auctionInput: Partial<IAuction> = {
        ...rest,
        imageUrls,
        ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
      };

      const auction = await auctionService.createAuction(auctionInput, ownerId);
      return ApiResponseHelper.success(res, normalizeAuctionResponse(auction), "Auction created successfully");
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
      return ApiResponseHelper.success(res, normalizeAuctionResponse(bid), "Bid placed successfully");
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
      const imageUrl = `/api/v1/images/${filename}`;

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

      if (auction.owner.toString() !== userId && req.user?.role !== "admin") {
        throw new HttpException(403, "Forbidden: Not the owner or admin");
      }

      const updated = await auctionService.updateAuction(id, req.body);
      if (!updated) {
        throw new HttpException(404, "Auction not found");
      }
      return ApiResponseHelper.success(res, normalizeAuctionResponse(updated), "Auction updated successfully");
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

      if (auction.owner.toString() !== userId && req.user?.role !== "admin") {
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
