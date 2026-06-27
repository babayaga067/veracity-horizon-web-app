"use server";

import { getAuctions, getAuctionById } from "@/app/lib/api/auctions";

export type Auction = {
  _id: string;
  title: string;
  description?: string;
  startingPrice: number;
  currentBid?: number;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  bids?: {
    user: string;
    amount: number;
    timestamp: Date;
  }[];
  status: "upcoming" | "active" | "closed" | "open";
  category: "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate";
  isFeatured: boolean;
  imageUrls: string[];
  endsAt: Date | string;
};

export type PaginationMeta = {
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

export type AuctionsResponse = {
  data: Auction[];
  meta: PaginationMeta;
};

export type SingleAuctionResponse = {
  data: Auction;
};

export const fetchAuctionsAction = async (params: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<{ success: boolean; data?: AuctionsResponse; message?: string }> => {
  try {
    const response = await getAuctions();
    if (!response.success) {
      return { success: false, message: response.message || "Failed to fetch auctions" };
    }

    let auctions = response.data || [];

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      auctions = auctions.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.description?.toLowerCase().includes(searchLower)
      );
    }

    const page = params.page || 1;
    const size = params.size || 10;
    const total = auctions.length;
    const totalPages = Math.ceil(total / size);
    const start = (page - 1) * size;
    const end = start + size;
    const paginatedAuctions = auctions.slice(start, end);

    return {
      success: true,
      data: {
        data: paginatedAuctions,
        meta: {
          page,
          size,
          total,
          totalPages,
        },
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to fetch auctions" };
  }
};

export const fetchAuctionByIdAction = async (
  id: string
): Promise<{ success: boolean; data?: Auction; message?: string }> => {
  try {
    const response = await getAuctionById(id);
    if (!response.success) {
      return { success: false, message: response.message || "Failed to fetch auction" };
    }
    if (!response.data) {
      return { success: false, message: "Auction not found" };
    }
    return { success: true, data: response.data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to fetch auction" };
  }
};

