"use server";

import { register, login } from "@/app/lib/api/auth";
import { RegisterFormData, LoginFormData } from "@/app/(auth)/_components/schema";
import { setTokenCookie, storeUserData } from "../api/cookies";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

// Handle user registration
export const handleRegisterUser = async (data: RegisterFormData) => {
  try {
    const result = await register(data);

    return result.success
      ? { success: true, message: result.message, data: result.data }
      : { success: false, message: result.message || "Registration failed" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Registration failed") };
  }
};

// Handle user login
export const handleLoginUser = async (data: LoginFormData) => {
  try {
    const result = await login(data);

    if (!result.success || !result.data) {
      return { success: false, message: result.message || "Login failed" };
    }

    const { user, token } = result.data;
    if (!user || !token) {
      return { success: false, message: "Login failed" };
    }

    await setTokenCookie(token);
    await storeUserData(user);

    return { success: true, message: result.message, data: result.data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Login failed") };
  }
};
