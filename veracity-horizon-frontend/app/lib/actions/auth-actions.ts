"use server";

import { register, login, updateProfile, updatePassword, whoami, uploadImage, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail } from "@/app/lib/api/auth";
import { createAuction, uploadAuctionImage, getMyAuctions, getMyBids, placeBid, updateAuction, deleteAuction } from "@/app/lib/api/auctions";
import { RegisterFormData, LoginFormData } from "@/app/(auth)/_components/schema";
import { setTokenCookie, storeUserData, clearAuthCookies, getTokenCookie } from "../api/cookies";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

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

export const handleUpdateProfile = async (formData: FormData) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await updateProfile(formData, token);
    if (result.success && result.data) {
      await storeUserData(result.data);
    }

    return result.success
      ? { success: true, message: result.message, data: result.data }
      : { success: false, message: result.message || "Profile update failed" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Profile update failed") };
  }
};

export const handleUpdatePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await updatePassword(data, token);

    return result.success
      ? { success: true, message: result.message }
      : { success: false, message: result.message || "Password update failed" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Password update failed") };
  }
};

export const handleLogout = async () => {
  await clearAuthCookies();
};

export const handleGetCurrentUser = async () => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await whoami(token);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message || "Failed to fetch user" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to fetch user") };
  }
};

export const handleCreateAuction = async (data: {
  title: string;
  description: string;
  startingPrice: number;
  category: string;
  endsAt?: string;
  imageUrls?: string[];
  status?: string;
  isFeatured?: boolean;
}) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await createAuction(data, token);
    return result.success
      ? { success: true, message: result.message, data: result.data }
      : { success: false, message: result.message || "Failed to create auction" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create auction" };
  }
};

export const handleGetMyAuctions = async () => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }
    const result = await getMyAuctions(token);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message || "Failed to fetch auctions" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to fetch auctions" };
  }
};

export const handleGetMyBids = async () => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await getMyBids(token);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message || "Failed to fetch bids" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to fetch bids" };
  }
};

export const handlePlaceBid = async (auctionId: string, amount: number) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await placeBid(auctionId, amount, token);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message || "Failed to place bid" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to place bid" };
  }
};

export const handleUploadAuctionImage = async (file: File) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await uploadAuctionImage(file, token);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message || "Failed to upload image" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to upload image" };
  }
};

export const handleUpdateAuction = async (id: string, data: {
  title: string;
  description: string;
  startingPrice: number;
  category?: string;
  endsAt?: string;
  status?: string;
  isFeatured?: boolean;
  imageUrls?: string[];
}) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await updateAuction(id, data, token);
    return result.success
      ? { success: true, message: result.message, data: result.data }
      : { success: false, message: result.message || "Failed to update auction" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update auction" };
  }
};

export const handleDeleteAuction = async (id: string) => {
  try {
    const token = await getTokenCookie();
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await deleteAuction(id, token);
    return result.success
      ? { success: true, message: result.message }
      : { success: false, message: result.message || "Failed to delete auction" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to delete auction" };
  }
};

export const handleForgotPassword = async (email: string) => {
  try {
    const result = await forgotPassword(email);
    return result.success
      ? { success: true, message: result.message || "Password reset link sent" }
      : { success: false, message: result.message || "Failed to send reset link" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to send reset link" };
  }
};

export const handleRequestPasswordReset = handleForgotPassword;

export const handleResetPassword = async (token: string, newPassword: string) => {
  try {
    const result = await resetPassword(token, newPassword);
    return result.success
      ? { success: true, message: result.message || "Password reset successfully" }
      : { success: false, message: result.message || "Failed to reset password" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to reset password" };
  }
};

export const handleSendVerificationEmail = async (email: string) => {
  try {
    const result = await sendVerificationEmail(email);
    return result.success
      ? { success: true, message: result.message || "Verification email sent" }
      : { success: false, message: result.message || "Failed to send verification email" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to send verification email" };
  }
};

export const handleVerifyEmail = async (token: string) => {
  try {
    const result = await verifyEmail(token);
    return result.success
      ? { success: true, message: result.message || "Email verified successfully" }
      : { success: false, message: result.message || "Failed to verify email" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to verify email" };
  }
};