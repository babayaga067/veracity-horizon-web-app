import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../configs/multer";
import { idempotencyGuard } from "../middlewares/idempotency.middleware";
import { apiRateLimiter, strictRateLimiter, loginRateLimiter } from "../middlewares/rate-limit.middleware";
import { validateQuery } from "../middlewares/validation.middleware";
import { ListAuctionsQuerySchema } from "../dtos/auction.dto";

const auctionRouter = Router();
const auctionController = new AuctionController();

// Public: list auctions with search, filters, and pagination
auctionRouter.get("/", apiRateLimiter, validateQuery(ListAuctionsQuerySchema), (req, res, next) => auctionController.listAuctions(req, res, next));

// Public: get featured auctions
auctionRouter.get("/featured", apiRateLimiter, (req, res, next) => auctionController.getFeaturedAuctions(req, res, next));

// Public: get categories
auctionRouter.get("/categories", apiRateLimiter, (req, res, next) => auctionController.getCategories(req, res, next));

// Public: get bid history
auctionRouter.get("/:id/bids", apiRateLimiter, (req, res, next) => auctionController.getBidHistory(req, res, next));

// Authenticated: get won auctions
auctionRouter.get("/my-won-auctions", authorizedMiddleware, (req, res, next) => auctionController.getWonAuctions(req, res, next));

// Public: get seller analytics
auctionRouter.get("/:id/analytics", apiRateLimiter, (req, res, next) => auctionController.getSellerAnalytics(req, res, next));

// Authenticated: get my auctions
auctionRouter.get("/my-auctions", authorizedMiddleware, (req, res, next) => auctionController.getMyAuctions(req, res, next));

// Authenticated: get my bids
auctionRouter.get("/my-bids", authorizedMiddleware, (req, res, next) => auctionController.getMyBids(req, res, next));

// Public: get auction by ID (must come after specific routes)
auctionRouter.get("/:id", apiRateLimiter, (req, res, next) => auctionController.getAuctionById(req, res, next));

// Authenticated: create auction
auctionRouter.post("/create", authorizedMiddleware, apiRateLimiter, (req, res, next) => auctionController.createAuction(req, res, next));

// Authenticated: place bid (with idempotency protection)
auctionRouter.post("/:id/bid", authorizedMiddleware, idempotencyGuard, strictRateLimiter, (req, res, next) => auctionController.placeBid(req, res, next));

// Authenticated: upload image
auctionRouter.post("/upload", authorizedMiddleware, upload.single("file"), (req, res, next) => auctionController.uploadImage(req, res, next));

// Authenticated: update auction (owner or admin only)
auctionRouter.put("/:id", authorizedMiddleware, (req, res, next) => auctionController.updateAuction(req, res, next));

// Authenticated: delete auction (owner or admin only)
auctionRouter.delete("/:id", authorizedMiddleware, (req, res, next) => auctionController.deleteAuction(req, res, next));

export default auctionRouter;
