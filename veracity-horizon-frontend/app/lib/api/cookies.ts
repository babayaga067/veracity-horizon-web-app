"use server";

import { cookies } from "next/headers";

// Store JWT securely
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,   // prevents client-side JS access
    secure: true,     // only sent over HTTPS
    sameSite: "strict", // prevents CSRF
  });
}

// Retrieve JWT
export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}

// Store user object securely
export async function storeUserData(userData: Record<string, unknown>) {
  const cookieStore = await cookies();
  cookieStore.set("user_data", JSON.stringify(userData), {
    secure: true,
    sameSite: "strict",
  });
}

// Retrieve user object
export async function getUserData() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data")?.value;
  return userDataCookie ? JSON.parse(userDataCookie) : null;
}

// Clear cookies on logout
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
}
