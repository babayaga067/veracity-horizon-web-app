import mongoose, { Document, Schema } from "mongoose";
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
  category: "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate" | "Textiles" | "Jewelry" | "Antiques" | "Food & Spices" | "Handicrafts" | "Musical Instruments" | "Books & Manuscripts" | "Furniture" | "Sports & Gear" | "Home & Living" | "Industrial Equipment" | "Luxury Goods" | "Agriculture & Livestock" | "Tools & Hardware" | "Ceramics & Pottery" | "Carpets & Rugs" | "Coins & Currency" | "Watches & Timepieces" | "Photography" | "Sculptures" | "Paintings" | "Textbooks & Academic" | "Outdoor & Adventure" | "Health & Wellness" | "Office Supplies" | "Children & Toys" | "Cultural Heritage" | "Religious Items" | "Digital Assets";
  isFeatured: boolean;
  imageUrls: string[];
  endsAt: Date;
  notificationsSent?: {
    ending?: boolean;
    winnerNotified?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema: Schema = new Schema<IAuction>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      required: true,
      enum: ["Art", "Electronics", "Vehicles", "Collectibles", "Fashion", "Real Estate", "Textiles", "Jewelry", "Antiques", "Food & Spices", "Handicrafts", "Musical Instruments", "Books & Manuscripts", "Furniture", "Sports & Gear", "Home & Living", "Industrial Equipment", "Luxury Goods", "Agriculture & Livestock", "Tools & Hardware", "Ceramics & Pottery", "Carpets & Rugs", "Coins & Currency", "Watches & Timepieces", "Photography", "Sculptures", "Paintings", "Textbooks & Academic", "Outdoor & Adventure", "Health & Wellness", "Office Supplies", "Children & Toys", "Cultural Heritage", "Religious Items", "Digital Assets"],
    },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["upcoming", "active", "closed", "open"], default: "upcoming" },
    imageUrls: { type: [String], default: [] },
    bids: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: Date.now },
          idempotencyKey: { type: String },
        },
      ],
      default: [],
    },
    endsAt: { type: Date, required: true },
    notificationsSent: {
      ending: { type: Boolean, default: false },
      winnerNotified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

AuctionSchema.index({ status: 1, endsAt: 1 });
AuctionSchema.index({ owner: 1 });
AuctionSchema.index({ "bids.user": 1 });
AuctionSchema.index({ "notificationsSent.ending": 1 });
AuctionSchema.index({ "notificationsSent.winnerNotified": 1 });

export const AuctionModel = mongoose.model<IAuction>("Auction", AuctionSchema);