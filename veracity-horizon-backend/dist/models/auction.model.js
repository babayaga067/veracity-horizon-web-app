"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Auction schema
const AuctionSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
        type: String,
        required: true,
        enum: ["Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate"],
    },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["upcoming", "active", "closed", "open"], default: "upcoming" },
    imageUrls: { type: [String], default: [] },
    bids: {
        type: [
            {
                user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
                amount: { type: Number, required: true },
                timestamp: { type: Date, default: Date.now },
                idempotencyKey: { type: String },
            },
        ],
        default: [],
    },
    endsAt: { type: Date, required: true },
}, { timestamps: true });
// Auction model
exports.AuctionModel = mongoose_1.default.model("Auction", AuctionSchema);
//# sourceMappingURL=auction.model.js.map