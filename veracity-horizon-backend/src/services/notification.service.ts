import { NotificationModel } from "../models/notification.model";
import { INotification } from "../models/notification.model";
import { HttpException } from "../exceptions/http-exception";
import { Types } from "mongoose";
import { AuctionModel, IAuction } from "../models/auction.model";

export class NotificationService {
  async getNotifications(userId: string, page: number = 1, limit: number = 20): Promise<{ notifications: INotification[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const notifications = await NotificationModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await NotificationModel.countDocuments({ user: userId });
    const totalPages = Math.ceil(total / limit) || 1;
    return { notifications, total, totalPages };
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { returnDocument: "after" }
    );
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ user: userId, read: false }, { read: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({ user: userId, read: false });
  }

  async createNotification(userId: string, type: INotification["type"], title: string, message: string, auctionId?: string): Promise<INotification> {
    const notification = await NotificationModel.create({
      user: userId,
      type,
      title,
      message,
      auction: auctionId ? new Types.ObjectId(auctionId) : null,
      read: false,
    });
    return notification;
  }

  async notifyBidPlaced(auction: IAuction, bidderId: string, amount: number): Promise<void> {
    const ownerId =
      auction.owner && typeof auction.owner === "object" && "_id" in auction.owner
        ? String((auction.owner as { _id: unknown })._id)
        : String(auction.owner);

    if (ownerId !== bidderId) {
      await this.createNotification(
        ownerId,
        "bid_placed",
        "New Bid on Your Auction",
        `A new bid of $${amount} was placed on "${auction.title}"`,
        auction._id.toString()
      );
    }

    const previousBids = auction.bids?.filter((b: any) => b.user.toString() !== bidderId) || [];
    if (previousBids.length > 0) {
      const previousHighest = previousBids.sort((a: any, b: any) => b.amount - a.amount)[0];
      if (previousHighest && String(previousHighest.user) !== bidderId) {
        await this.createNotification(
          String(previousHighest.user),
          "bid_outbid",
          "You've Been Outbid",
          `You have been outbid on "${auction.title}". The current bid is now $${amount}.`,
          auction._id.toString()
        );
      }
    }
  }

  async notifyAuctionEnding(auction: IAuction): Promise<void> {
    const ownerId =
      auction.owner && typeof auction.owner === "object" && "_id" in auction.owner
        ? String((auction.owner as { _id: unknown })._id)
        : String(auction.owner);

    await this.createNotification(
      ownerId,
      "auction_ending",
      "Auction Ending Soon",
      `Your auction "${auction.title}" is ending soon. Current bid: $${auction.currentBid || auction.startingPrice}`,
      auction._id.toString()
    );

    const bidders = auction.bids?.map((b: any) => String(b.user)) || [];
    const uniqueBidders = [...new Set(bidders)];
    for (const bidderId of uniqueBidders) {
      if (bidderId !== ownerId) {
        await this.createNotification(
          bidderId,
          "auction_ending",
          "Auction Ending Soon",
          `The auction "${auction.title}" is ending soon. Current bid: $${auction.currentBid || auction.startingPrice}`,
          auction._id.toString()
        );
      }
    }
  }

  async notifyAuctionWon(auction: IAuction, winnerId: string): Promise<void> {
    await this.createNotification(
      winnerId,
      "auction_won",
      "Congratulations! You Won the Auction",
      `You won the auction "${auction.title}" with a bid of $${auction.currentBid || auction.startingPrice}.`,
      auction._id.toString()
    );

    const ownerId =
      auction.owner && typeof auction.owner === "object" && "_id" in auction.owner
        ? String((auction.owner as { _id: unknown })._id)
        : String(auction.owner);

    await this.createNotification(
      ownerId,
      "auction_won",
      "Your Auction Has a Winner",
      `Your auction "${auction.title}" has been won with a bid of $${auction.currentBid || auction.startingPrice}.`,
      auction._id.toString()
    );
  }

  async notifyAuctionClosed(auction: IAuction): Promise<void> {
    const ownerId =
      auction.owner && typeof auction.owner === "object" && "_id" in auction.owner
        ? String((auction.owner as { _id: unknown })._id)
        : String(auction.owner);

    await this.createNotification(
      ownerId,
      "auction_closed",
      "Auction Closed",
      `Your auction "${auction.title}" has ended. Final bid: $${auction.currentBid || auction.startingPrice}`,
      auction._id.toString()
    );
  }
}