export function normalizeImageUrls(imageUrls?: string[]): string[] {
  if (!imageUrls) return [];
  return imageUrls.map((url) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const idx = trimmed.indexOf("/api/v1/images/");
      if (idx !== -1) return trimmed.slice(idx + "/api/v1/images/".length);
    }
    if (trimmed.startsWith("/") && trimmed.includes("/")) {
      const parts = trimmed.split("/");
      return parts[parts.length - 1];
    }
    if (trimmed.includes("/")) return trimmed.split("/").pop() || trimmed;
    return trimmed;
  }).filter((s): s is string => s !== "");
}

export function cleanImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const idx = trimmed.indexOf("/api/v1/images/");
    if (idx !== -1) return trimmed.slice(idx + "/api/v1/images/".length);
    return trimmed;
  }
  if (trimmed.startsWith("/api/v1/images/")) return trimmed.slice("/api/v1/images/".length);
  const name = trimmed.split("/").pop() || trimmed;
  return name;
}
