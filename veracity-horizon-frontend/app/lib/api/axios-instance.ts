import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "").replace(/\/api\/v1$/i, "");

const axiosInstance = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
