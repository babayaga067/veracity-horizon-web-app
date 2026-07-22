export const getApiBase = (): string => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  return rawBaseUrl.replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
};

export const imageUrl = (input: string | undefined | null): string => {
  if (!input) return "";
  if (input.startsWith("data:") || input.startsWith("http")) return input;
  const filename = input.split('/').pop() || input;
  return `${getApiBase()}/api/v1/images/${filename}`;
};
