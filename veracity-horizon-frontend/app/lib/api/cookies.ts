"use server";

import { cookies } from "next/headers";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function sanitizeUser(user: Record<string, unknown>) {
  const { password: _, ...safe } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
  return safe;
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}

export async function storeUserData(userData: Record<string, unknown>) {
  const cookieStore = await cookies();
  const safe = sanitizeUser(userData);
  cookieStore.set("user_data", JSON.stringify(safe), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getUserData() {
  try {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get("user_data")?.value;
    return userDataCookie ? JSON.parse(userDataCookie) : null;
  } catch {
    return null;
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
}
