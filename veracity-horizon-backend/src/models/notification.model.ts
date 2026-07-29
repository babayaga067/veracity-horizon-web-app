import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";

export interface INotification extends Document {
  user: IUser["_id"];
  type: "bid_placed" | "bid_outbid" | "auction_ending" | "auction_won" | "auction_closed" | "admin_action";
  title: string;
  message: string;
  auction?: IUser["_id"] | null;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["bid_placed", "bid_outbid", "auction_ending", "auction_won", "auction_closed", "admin_action"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    auction: { type: Schema.Types.ObjectId, ref: "Auction" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);