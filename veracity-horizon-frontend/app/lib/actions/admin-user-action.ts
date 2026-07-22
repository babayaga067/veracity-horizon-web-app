"use server";

import { API } from "@/app/lib/api/endpoints";
import { getApiBase } from "@/app/lib/api/config";
import { getTokenCookie } from "@/app/lib/api/cookies";
import type { PaginationMeta } from "@/app/lib/types/pagination";
import type { User } from "@/app/lib/types/user";

export type UsersResponse = {
  data: User[];
  meta: PaginationMeta;
};

export type UserResponse = {
  data: User;
};

export async function fetchUsersAction(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<{ success: boolean; data?: UsersResponse; message?: string }> {
  const token = await getTokenCookie();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);

  const response = await fetch(`${getApiBase()}${API.ADMIN.USERS}?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    return { success: false, message: result.message || "Failed to fetch users" };
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
}

export async function fetchUserByIdAction(id: string): Promise<{ success: boolean; data?: User; message?: string }> {
  const token = await getTokenCookie();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }
  const response = await fetch(`${getApiBase()}${API.ADMIN.USER_BY_ID(id)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    return { success: false, message: result.message || "Failed to fetch user" };
  }
  return {
    success: true,
    data: result.data,
  };
}

export async function createAdminUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role?: string;
}) {
  const token = await getTokenCookie();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }
  const response = await fetch(`${getApiBase()}${API.ADMIN.USER_CREATE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return {
    success: response.ok,
    data: result.data,
    message: result.message,
  };
}

export async function updateAdminUser(id: string, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  role?: string;
}) {
  const token = await getTokenCookie();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }
  const response = await fetch(`${getApiBase()}${API.ADMIN.USER_BY_ID(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return {
    success: response.ok,
    data: result.data,
    message: result.message,
  };
}

export async function deleteAdminUser(id: string) {
  const token = await getTokenCookie();
  if (!token) {
    return { success: false, message: "Not authenticated" };
  }
  const response = await fetch(`${getApiBase()}${API.ADMIN.USER_DELETE(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  return {
    success: response.ok,
    message: result.message,
  };
}