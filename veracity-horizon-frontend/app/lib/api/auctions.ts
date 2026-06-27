import axios from "axios";
import { API } from "./endpoints";
import { getApiBase } from "./config";

type ApiResponse<T> = {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
};

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

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return `Network Error: Cannot reach server at ${getApiBase()}. Is the backend running?`;
    }
    const data = error.response.data as { message?: string; error?: string } | undefined;
    const status = error.response.status;
    return data?.message || data?.error || `Server Error ${status}: ${fallback}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${getApiBase()}/`, { timeout: 5000 });
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
};

export const getAuctions = async () => {
  try {
    const response = await axios.get<ApiResponse<Auction[]>>(`${getApiBase()}${API.AUCTIONS.LIST}`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch auctions"));
  }
};

export const getFeaturedAuctions = async () => {
  try {
    const response = await axios.get<ApiResponse<Auction[]>>(`${getApiBase()}${API.AUCTIONS.LIST}/featured`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch featured auctions"));
  }
};

export const getAuctionById = async (id: string) => {
  try {
    const response = await axios.get<ApiResponse<Auction>>(`${getApiBase()}${API.AUCTIONS.LIST}/${id}`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch auction"));
  }
};

export const getMyAuctions = async (token: string) => {
  try {
    const response = await axios.get<ApiResponse<Auction[]>>(`${getApiBase()}${API.AUCTIONS.MY_AUCTIONS}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch my auctions"));
  }
};

export const getMyBids = async (token: string) => {
  try {
    const response = await axios.get<ApiResponse<Auction[]>>(`${getApiBase()}${API.AUCTIONS.MY_BIDS}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch my bids"));
  }
};

export const placeBid = async (auctionId: string, amount: number, token: string) => {
  try {
    const idempotencyKey = `${auctionId}-${amount}-${Date.now()}`;
    const response = await axios.post<ApiResponse<unknown>>(`${getApiBase()}${API.AUCTIONS.LIST}/${auctionId}/bid`, { amount }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Idempotency-Key": idempotencyKey,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as { message?: string } | undefined;
      throw new Error(serverError?.message || "Failed to place bid");
    }
    throw new Error(getApiErrorMessage(error, "Failed to place bid"));
  }
};

export const createAuction = async (data: {
  title: string;
  description: string;
  startingPrice: number;
  category: "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate";
  endsAt?: string;
  imageUrls?: string[];
}, token: string) => {
  try {
    const response = await axios.post<ApiResponse<Auction>>(`${getApiBase()}${API.AUCTIONS.CREATE}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as { message?: string } | undefined;
      throw new Error(serverError?.message || "Failed to create auction");
    }
    throw new Error(getApiErrorMessage(error, "Failed to create auction"));
  }
};

export const uploadAuctionImage = async (file: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post<ApiResponse<{ url: string }>>(`${getApiBase()}${API.AUCTIONS.UPLOAD}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to upload image"));
  }
};

export const updateAuction = async (id: string, data: {
  title: string;
  description: string;
  startingPrice: number;
  category?: string;
  endsAt?: string;
  status?: string;
  isFeatured?: boolean;
  imageUrls?: string[];
}, token: string) => {
  try {
    const response = await axios.put<ApiResponse<Auction>>(`${getApiBase()}${API.AUCTIONS.LIST}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as { message?: string } | undefined;
      throw new Error(serverError?.message || "Failed to update auction");
    }
    throw new Error(getApiErrorMessage(error, "Failed to update auction"));
  }
};

export const deleteAuction = async (id: string, token: string) => {
  try {
    const response = await axios.delete<ApiResponse<unknown>>(`${getApiBase()}${API.AUCTIONS.LIST}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as { message?: string } | undefined;
      throw new Error(serverError?.message || "Failed to delete auction");
    }
    throw new Error(getApiErrorMessage(error, "Failed to delete auction"));
  }
};
