import { Router } from "express";
import { AuctionController } from "../controllers/auction.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const auctionRouter = Router();
const auctionController = new AuctionController();

// Public: list auctions
auctionRouter.get("/", (req, res, next) => auctionController.listAuctions(req, res, next));

// Public: get auction by ID
auctionRouter.get("/:id", (req, res, next) => auctionController.getAuctionById(req, res, next));

// Authenticated: create auction
auctionRouter.post("/create", authorizedMiddleware, (req, res, next) => auctionController.createAuction(req, res, next));

// Authenticated: place bid
auctionRouter.post("/:id/bid", authorizedMiddleware, (req, res, next) => auctionController.placeBid(req, res, next));

export default auctionRouter;
