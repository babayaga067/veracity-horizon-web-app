import axios from "axios";
import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
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

// Register user
export const register = async (data: RegisterFormData) => {
  try {
    const response = await axiosInstance.post<ApiResponse<null>>(API.AUTH.REGISTER, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Registration failed"));
  }
};

// Login user
export const login = async (data: LoginFormData) => {
  try {
    const response = await axiosInstance.post<ApiResponse<AuthPayload>>(API.AUTH.LOGIN, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, "Login failed"));
  }
};
