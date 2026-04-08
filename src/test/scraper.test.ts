import { describe, it, expect } from "vitest";
import {
  isValidUrl,
  scraperStatusMeta,
  isRunActive,
  type ScraperRun,
  type ScraperStatus,
} from "@/lib/scraperTypes";

describe("isValidUrl", () => {
  it("returns true for a valid https URL", () => {
    expect(isValidUrl("https://itelsolar.com/product/some-product/")).toBe(true);
  });

  it("returns true for a valid http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("returns false for a plain domain without protocol", () => {
    expect(isValidUrl("itelsolar.com/product/")).toBe(false);
  });

  it("returns false for a non-HTTP protocol", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
  });

  it("returns false for a random string", () => {
    expect(isValidUrl("not a url at all")).toBe(false);
  });
});

describe("scraperStatusMeta", () => {
  const statuses: ScraperStatus[] = ["pending", "running", "success", "error"];

  it("returns a label and colour for every status", () => {
    for (const status of statuses) {
      const meta = scraperStatusMeta(status);
      expect(typeof meta.label).toBe("string");
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.colour).toBe("string");
      expect(meta.colour.length).toBeGreaterThan(0);
    }
  });

  it("pending → yellow colour", () => {
    expect(scraperStatusMeta("pending").colour).toContain("yellow");
  });

  it("running → blue colour", () => {
    expect(scraperStatusMeta("running").colour).toContain("blue");
  });

  it("success → green colour", () => {
    expect(scraperStatusMeta("success").colour).toContain("green");
  });

  it("error → red colour", () => {
    expect(scraperStatusMeta("error").colour).toContain("red");
  });
});

describe("isRunActive", () => {
  const makeRun = (status: ScraperStatus): ScraperRun => ({
    id: "test-id",
    url: "https://example.com",
    status,
    product_id: null,
    error_message: null,
    extracted_data: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  it("returns true for pending status", () => {
    expect(isRunActive(makeRun("pending"))).toBe(true);
  });

  it("returns true for running status", () => {
    expect(isRunActive(makeRun("running"))).toBe(true);
  });

  it("returns false for success status", () => {
    expect(isRunActive(makeRun("success"))).toBe(false);
  });

  it("returns false for error status", () => {
    expect(isRunActive(makeRun("error"))).toBe(false);
  });
});
