"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auction_controller_1 = require("../controllers/auction.controller");
const authorized_middleware_1 = require("../middlewares/authorized.middleware");
const multer_1 = require("../configs/multer");
const idempotency_middleware_1 = require("../middlewares/idempotency.middleware");
const auctionRouter = (0, express_1.Router)();
const auctionController = new auction_controller_1.AuctionController();
// Public: list auctions
auctionRouter.get("/", (req, res, next) => auctionController.listAuctions(req, res, next));
// Public: get featured auctions
auctionRouter.get("/featured", (req, res, next) => auctionController.getFeaturedAuctions(req, res, next));
// Authenticated: get my auctions
auctionRouter.get("/my-auctions", authorized_middleware_1.authorizedMiddleware, (req, res, next) => auctionController.getMyAuctions(req, res, next));
// Authenticated: get my bids
auctionRouter.get("/my-bids", authorized_middleware_1.authorizedMiddleware, (req, res, next) => auctionController.getMyBids(req, res, next));
// Public: get auction by ID (must come after specific routes)
auctionRouter.get("/:id", (req, res, next) => auctionController.getAuctionById(req, res, next));
// Authenticated: create auction
auctionRouter.post("/create", authorized_middleware_1.authorizedMiddleware, (req, res, next) => auctionController.createAuction(req, res, next));
// Authenticated: place bid (with idempotency protection)
auctionRouter.post("/:id/bid", authorized_middleware_1.authorizedMiddleware, idempotency_middleware_1.idempotencyGuard, (req, res, next) => auctionController.placeBid(req, res, next));
// Authenticated: upload image
auctionRouter.post("/upload", authorized_middleware_1.authorizedMiddleware, multer_1.upload.single("file"), (req, res, next) => auctionController.uploadImage(req, res, next));
// Authenticated: update auction (owner or admin only)
auctionRouter.put("/:id", authorized_middleware_1.authorizedMiddleware, (req, res, next) => auctionController.updateAuction(req, res, next));
// Authenticated: delete auction (owner or admin only)
auctionRouter.delete("/:id", authorized_middleware_1.authorizedMiddleware, (req, res, next) => auctionController.deleteAuction(req, res, next));
exports.default = auctionRouter;
//# sourceMappingURL=auction.route.js.map