"use server";

import { API } from "@/app/lib/api/endpoints";
import { getApiBase } from "@/app/lib/api/config";
import { getTokenCookie } from "@/app/lib/api/cookies";
import { getAuctionById, deleteAuction, placeBid, getWonAuctions } from "@/app/lib/api/auctions";
import type { PaginationMeta } from "@/app/lib/types/pagination";
import type { Auction } from "@/app/lib/types/auction";

export type { Auction } from "@/app/lib/types/auction";

export type AuctionsResponse = {
  data: Auction[];
  meta: PaginationMeta;
};

export type SingleAuctionResponse = {
  data: Auction;
};

export const fetchAuctionsAction = async (
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = ""
): Promise<{ success: boolean; data?: AuctionsResponse; message?: string }> => {
  const token = await getTokenCookie();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const response = await fetch(`${getApiBase()}${API.AUCTIONS.LIST}?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    return { success: false, message: result.message || "Failed to fetch auctions" };
  }

  const rawMeta = result.meta as { page: number; limit: number; total: number; totalPages: number } | undefined;
  const meta: PaginationMeta = rawMeta
    ? { page: rawMeta.page, limit: rawMeta.limit, total: rawMeta.total, totalPages: rawMeta.totalPages }
    : { page, limit, total: (result.data || []).length, totalPages: 1 };

  return {
    success: true,
    data: {
      data: result.data || [],
      meta,
    },
  };
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

export const deleteAuctionAction = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }
    const response = await deleteAuction(id, token);
    if (!response.success) {
      return { success: false, message: response.message || "Failed to delete auction" };
    }
    return { success: true, message: response.message || "Auction deleted" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to delete auction" };
  }
};

export const handlePlaceBid = async (
  auctionId: string,
  amount: number
): Promise<{ success: boolean; message?: string; data?: { currentBid: number } }> => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }
    const response = await placeBid(auctionId, amount, token);
    if (!response.success) {
      return { success: false, message: response.message || "Failed to place bid" };
    }
    return { success: true, message: response.message || "Bid placed successfully", data: response.data as { currentBid: number } | undefined };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to place bid" };
  }
};

export const getWonAuctionsAction = async (page = 1, limit = 20) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated", data: null };
    }
    const result = await getWonAuctions(token, page, limit);
    if (result.success) {
      return { success: true, message: result.message, data: result.data, meta: result.meta };
    }
    return { success: false, message: result.message || "Failed to fetch won auctions", data: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message, data: null };
    }
    return { success: false, message: "Failed to fetch won auctions", data: null };
  }
};