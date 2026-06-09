import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";

// Auction interface
export interface IAuction extends Document {
  title: string;
  description?: string;
  startingPrice: number;
  owner: IUser["_id"]; // reference to User
  bids: {
    user: IUser["_id"];
    amount: number;
    timestamp: Date;
  }[]; //always required
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

// Auction schema
const AuctionSchema: Schema = new Schema<IAuction>(
  {
    title: { type: String, required: true },
    description: { type: String },
    startingPrice: { type: Number, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bids: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          amount: { type: Number, required: true },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [], //  ensures bids is never undefined
    },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

// Auction model
export const AuctionModel = mongoose.model<IAuction>("Auction", AuctionSchema);
