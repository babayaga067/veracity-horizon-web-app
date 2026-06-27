export const getApiBase = (): string => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  return rawBaseUrl.replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
};
