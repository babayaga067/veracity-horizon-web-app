"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuctionSchema = void 0;
const zod_1 = require("zod");
exports.CreateAuctionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    startingPrice: zod_1.z.number().min(1, "Starting price must be at least 1"),
    category: zod_1.z.enum(["Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate"]),
    endsAt: zod_1.z.string().optional(),
    imageUrls: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=auction.dto.js.map