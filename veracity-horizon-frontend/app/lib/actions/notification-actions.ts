"use server";

import { getTokenCookie } from "../api/cookies";
import { getApiBase } from "../api/config";
import { API } from "../api/endpoints";

export async function getNotificationsAction(page: number = 1, limit: number = 20) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };
    const response = await fetch(
      `${getApiBase()}${API.NOTIFICATIONS.LIST}?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to fetch notifications" };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };
    const response = await fetch(
      `${getApiBase()}${API.NOTIFICATIONS.MARK_READ(id)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };
    const response = await fetch(
      `${getApiBase()}${API.NOTIFICATIONS.MARK_ALL_READ}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to mark all notifications as read" };
  }
}

export async function getUnreadCountAction() {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Not authenticated" };
    const response = await fetch(
      `${getApiBase()}${API.NOTIFICATIONS.UNREAD_COUNT}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to fetch unread count" };
  }
}