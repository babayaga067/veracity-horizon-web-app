export type Notification = {
  _id: string;
  user: string;
  type: "bid_placed" | "bid_outbid" | "auction_ending" | "auction_won" | "auction_closed" | "admin_action" | "email_verification";
  title: string;
  message: string;
  auction?: string | null;
  read: boolean;
  createdAt: Date | string;
};