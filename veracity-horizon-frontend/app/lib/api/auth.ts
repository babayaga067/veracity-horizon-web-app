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

export const updateProfile = async (data: UpdateProfileData, token: string) => {
  try {
    const response = await axios.put<ApiResponse<AuthPayload["user"]>>(`${getApiBase()}${API.AUTH.UPDATE}`, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
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