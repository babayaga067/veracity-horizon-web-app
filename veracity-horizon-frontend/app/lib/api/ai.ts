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

export interface AISearchResult {
  success: boolean;
  data: unknown[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  ai: {
    detectedCategory: string | null;
    suggestions: { text: string; category?: string }[];
    originalQuery: string;
  };
}

export interface AINavigateResult {
  success: boolean;
  message?: string;
  data?: {
    href: string;
    label: string;
    description: string;
  };
  suggestions?: { href: string; label: string }[];
}

export interface AISuggestions {
  success: boolean;
  data: {
    popularCategories: string[];
    quickActions: { label: string; href: string; icon: string }[];
    tips: string[];
  };
}

export const aiSearch = async (query: string, category?: string, page = 1, limit = 20): Promise<AISearchResult> => {
  try {
    const response = await axios.post<AISearchResult>(`${getApiBase()}${API.AI.SEARCH}`, { query, category, page, limit });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "AI search failed"));
  }
};

export const aiNavigate = async (intent: string, context?: Record<string, unknown>): Promise<AINavigateResult> => {
  try {
    const response = await axios.post<AINavigateResult>(`${getApiBase()}${API.AI.NAVIGATE}`, { intent, context });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "AI navigation failed"));
  }
};

export const aiSuggest = async (): Promise<AISuggestions> => {
  try {
    const response = await axios.get<AISuggestions>(`${getApiBase()}${API.AI.SUGGESTIONS}`);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch suggestions"));
  }
};
