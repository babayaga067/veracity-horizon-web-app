import { describe, it, expect } from "vitest";
import { normalizeImageUrls, cleanImageUrl } from "../../../src/utils/image.util";

/**
 * UNIT TESTS — UTILS LAYER
 * Validates the pure image-URL normalisation helpers that keep asset paths
 * consistent across environments.
 */
describe("utils/image.util", () => {
  describe("normalizeImageUrls", () => {
    it("returns an empty array for undefined input", () => {
      expect(normalizeImageUrls(undefined)).toEqual([]);
    });

    it("extracts the filename from a full http URL", () => {
      const result = normalizeImageUrls([
        "http://localhost:8089/api/v1/images/abc-123.png",
      ]);
      expect(result).toEqual(["abc-123.png"]);
    });

    it("keeps a bare filename untouched", () => {
      expect(normalizeImageUrls(["photo.jpg"])).toEqual(["photo.jpg"]);
    });

    it("handles absolute paths and strips empty entries", () => {
      expect(normalizeImageUrls(["/api/v1/images/x.png", "", "  "])).toEqual([
        "x.png",
      ]);
    });
  });

  describe("cleanImageUrl", () => {
    it("returns trimmed input when empty", () => {
      expect(cleanImageUrl("")).toBe("");
    });

    it("extracts filename from a hosted image URL", () => {
      expect(cleanImageUrl("https://host/api/v1/images/xyz.webp")).toBe(
        "xyz.webp"
      );
    });

    it("handles a leading /api/v1/images/ prefix", () => {
      expect(cleanImageUrl("/api/v1/images/foo.png")).toBe("foo.png");
    });
  });
});
