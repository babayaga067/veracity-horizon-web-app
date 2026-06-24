import { Router } from "express";
import express from "express";
import path from "path";
import { AuctionController } from "../controllers/auction.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { upload } from "../configs/multer";

const auctionRouter = Router();
const auctionController = new AuctionController();

// Serve uploaded images statically
auctionRouter.use("/images", express.static(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads")));

// Public: list auctions
auctionRouter.get("/", (req, res, next) => auctionController.listAuctions(req, res, next));

// Public: get featured auctions
auctionRouter.get("/featured", (req, res, next) => auctionController.getFeaturedAuctions(req, res, next));

// Authenticated: get my auctions
auctionRouter.get("/my-auctions", authorizedMiddleware, (req, res, next) => auctionController.getMyAuctions(req, res, next));

// Authenticated: get my bids
auctionRouter.get("/my-bids", authorizedMiddleware, (req, res, next) => auctionController.getMyBids(req, res, next));

// Public: get auction by ID (must come after specific routes)
auctionRouter.get("/:id", (req, res, next) => auctionController.getAuctionById(req, res, next));

// Authenticated: create auction
auctionRouter.post("/create", authorizedMiddleware, (req, res, next) => auctionController.createAuction(req, res, next));

// Authenticated: place bid
auctionRouter.post("/:id/bid", authorizedMiddleware, (req, res, next) => auctionController.placeBid(req, res, next));

// Authenticated: upload image
auctionRouter.post("/upload", authorizedMiddleware, upload.single("file"), (req, res, next) => auctionController.uploadImage(req, res, next));

export default auctionRouter;
