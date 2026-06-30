export type Auction = {
  _id: string;
  title: string;
  description?: string;
  startingPrice: number;
  currentBid?: number;
  owner?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  bids?: {
    user: string | {
      _id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string;
    };
    amount: number;
    timestamp: Date | string;
    idempotencyKey?: string;
  }[];
  status: "upcoming" | "active" | "closed" | "open";
  category: "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate" | "Textiles" | "Jewelry" | "Antiques" | "Food & Spices" | "Handicrafts" | "Musical Instruments" | "Books & Manuscripts" | "Furniture" | "Sports & Gear" | "Home & Living" | "Industrial Equipment" | "Luxury Goods" | "Agriculture & Livestock" | "Tools & Hardware" | "Ceramics & Pottery" | "Carpets & Rugs" | "Coins & Currency" | "Watches & Timepieces" | "Photography" | "Sculptures" | "Paintings" | "Textbooks & Academic" | "Outdoor & Adventure" | "Health & Wellness" | "Office Supplies" | "Children & Toys" | "Cultural Heritage" | "Religious Items" | "Digital Assets";
  isFeatured: boolean;
  imageUrls: string[];
  endsAt: Date | string;
  createdAt?: Date | string;
};