import mongoose, { Document } from "mongoose";
import { IUser } from "./user.model";
export interface IAuction extends Document {
    title: string;
    description?: string;
    startingPrice: number;
    currentBid?: number;
    owner: IUser["_id"];
    bids: {
        user: IUser["_id"];
        amount: number;
        timestamp: Date;
        idempotencyKey?: string;
    }[];
    status: "upcoming" | "active" | "closed" | "open";
    category: "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate";
    isFeatured: boolean;
    imageUrls: string[];
    endsAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AuctionModel: mongoose.Model<IAuction, {}, {}, {}, mongoose.Document<unknown, {}, IAuction, {}, mongoose.DefaultSchemaOptions> & IAuction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuction>;
//# sourceMappingURL=auction.model.d.ts.map