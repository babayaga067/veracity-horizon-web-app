export const getApiBase = (): string => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  return rawBaseUrl.replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
};

export const imageUrl = (input: string | undefined | null): string => {
  if (!input || input.trim() === "") return "";
  const trimmed = input.trim();
  if (trimmed.startsWith("data:")) return trimmed;

  const apiBase = getApiBase();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const idx = trimmed.indexOf("/api/v1/images/");
    if (idx !== -1) {
      const filename = trimmed.slice(idx + "/api/v1/images/".length);
      return `${apiBase}/api/v1/images/${filename}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  let filename = trimmed;
  if (trimmed.includes("/")) {
    filename = trimmed.split("/").pop() || trimmed;
  }

  return `${apiBase}/api/v1/images/${filename}`;
};

export const imageUrlFallback = (input: string | undefined | null, fallback: string): string => {
  const url = imageUrl(input);
  return url || fallback;
};
