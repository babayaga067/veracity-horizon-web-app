import axios from "axios";
import { API } from "./endpoints";
import { getApiBase } from "./config";
import { RegisterFormData, LoginFormData } from "@/app/(auth)/_components/schema";

type ApiResponse<T> = {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: unknown;
};

type AuthPayload = {
  user: Record<string, unknown>;
  token: string;
};

type UpdateProfileData = {
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName?: string;
  phoneNumber?: string;
};

type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const register = async (data: RegisterFormData) => {
  try {
    const response = await axios.post<ApiResponse<null>>(`${getApiBase()}${API.AUTH.REGISTER}`, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Registration failed"));
  }
};

export const login = async (data: LoginFormData) => {
  try {
    const response = await axios.post<ApiResponse<AuthPayload>>(`${getApiBase()}${API.AUTH.LOGIN}`, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Login failed"));
  }
};

export const whoami = async (token: string) => {
  try {
    const response = await axios.get<ApiResponse<AuthPayload["user"]>>(`${getApiBase()}${API.AUTH.WHOAMI}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
  }
};

export const updateProfile = async (formData: FormData, token: string) => {
  try {
    const response = await axios.put<ApiResponse<AuthPayload["user"]>>(`${getApiBase()}${API.AUTH.UPDATE}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Profile update failed"));
  }
};

export const updatePassword = async (data: UpdatePasswordData, token: string) => {
  try {
    const response = await axios.post<ApiResponse<null>>(`${getApiBase()}${API.AUTH.PASSWORD}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Password update failed"));
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post<ApiResponse<null>>(`${getApiBase()}${API.AUTH.FORGOT_PASSWORD}`, { email });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to send reset link"));
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axios.post<ApiResponse<null>>(`${getApiBase()}${API.AUTH.RESET_PASSWORD(token)}`, {
      newPassword,
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to reset password"));
  }
};

export const sendVerificationEmail = async (email: string) => {
  try {
    const response = await axios.post<ApiResponse<null>>(`${getApiBase()}${API.AUTH.SEND_VERIFICATION_EMAIL}`, { email });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to send verification email"));
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const response = await axios.post<ApiResponse<null>>(`${getApiBase()}${API.AUTH.VERIFY_EMAIL}`, { token });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to verify email"));
  }
};

export const uploadImage = async (file: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post<ApiResponse<{ url: string }>>(`${getApiBase()}${API.AUTH.UPLOAD}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data || response.data.success === undefined) {
      throw new Error("Invalid response from image upload");
    }
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Image upload failed"));
  }
};

export const getNotifications = async (page: number = 1, limit: number = 20, token: string) => {
  try {
    const response = await axios.get<ApiResponse<unknown[]>>(`${getApiBase()}${API.NOTIFICATIONS.LIST}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch notifications"));
  }
};

export const markNotificationAsRead = async (id: string, token: string) => {
  try {
    const response = await axios.patch<ApiResponse<null>>(`${getApiBase()}${API.NOTIFICATIONS.MARK_READ(id)}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to mark notification as read"));
  }
};

export const markAllNotificationsAsRead = async (token: string) => {
  try {
    const response = await axios.patch<ApiResponse<null>>(`${getApiBase()}${API.NOTIFICATIONS.MARK_ALL_READ}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to mark all notifications as read"));
  }
};

export const getUnreadNotificationCount = async (token: string) => {
  try {
    const response = await axios.get<ApiResponse<{ count: number }>>(`${getApiBase()}${API.NOTIFICATIONS.UNREAD_COUNT}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch unread count"));
  }
};