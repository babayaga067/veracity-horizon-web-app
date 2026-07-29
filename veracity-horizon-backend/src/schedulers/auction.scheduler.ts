import { AuctionModel, IAuction } from "../models/auction.model";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export async function closeExpiredAuctions(): Promise<number> {
  const now = new Date();
  const result = await AuctionModel.updateMany(
    {
      status: { $in: ["active", "open"] },
      endsAt: { $lt: now },
    },
    { $set: { status: "closed" } }
  );
  return result.modifiedCount;
}

export async function notifyEndingAuctions(): Promise<void> {
  const now = new Date();
  const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const endingAuctions = await AuctionModel.find({
    status: { $in: ["active", "open"] },
    endsAt: { $gte: now, $lte: twentyFourHoursLater },
    "notificationsSent.ending": false,
  }).lean();

  for (const auction of endingAuctions as IAuction[]) {
    await notificationService.notifyAuctionEnding(auction);
    await AuctionModel.findByIdAndUpdate(auction._id, {
      $set: { "notificationsSent.ending": true },
    });
  }
}

export async function notifyAuctionWinners(): Promise<void> {
  const closedAuctions = await AuctionModel.find({
    status: "closed",
    "notificationsSent.winnerNotified": false,
  }).lean();

  for (const auction of closedAuctions as IAuction[]) {
    const bids = auction.bids?.sort((a: any, b: any) => b.amount - a.amount);
    if (bids && bids.length > 0) {
      const winnerId = String(bids[0]!.user);
      await notificationService.notifyAuctionWon(auction, winnerId);
    }
    await notificationService.notifyAuctionClosed(auction);
    await AuctionModel.findByIdAndUpdate(auction._id, {
      $set: { "notificationsSent.winnerNotified": true },
    });
  }
}

async function scheduleLoop(): Promise<void> {
  try {
    const closedCount = await closeExpiredAuctions();
    if (closedCount > 0) {
      console.log(`[Scheduler] Closed ${closedCount} expired auction(s)`);
      await notifyAuctionWinners();
    }
    await notifyEndingAuctions();
  } catch (error) {
    console.error("[Scheduler] Error:", error);
  }
}

export function startAuctionScheduler(intervalMs: number = 60000): NodeJS.Timeout {
  scheduleLoop();
  return setInterval(scheduleLoop, intervalMs);
}