/**
 * Shared types and helper utilities for the AI Product Scraper.
 * Used by both the admin UI (ScraperManager) and tests.
 */

export type ScraperStatus = "pending" | "running" | "success" | "error";

export interface ScraperRun {
  id: string;
  url: string;
  status: ScraperStatus;
  product_id: string | null;
  error_message: string | null;
  extracted_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  run_id: string;
  status: ScraperStatus;
  product_id?: string;
  product_name?: string;
  error?: string;
}

/**
 * Returns true when the given string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Maps a scraper status value to a human-readable label and a Tailwind colour class.
 */
export function scraperStatusMeta(status: ScraperStatus): {
  label: string;
  colour: string;
} {
  switch (status) {
    case "pending":
      return { label: "Pending", colour: "bg-yellow-100 text-yellow-800" };
    case "running":
      return { label: "Running…", colour: "bg-blue-100 text-blue-800" };
    case "success":
      return { label: "Success", colour: "bg-green-100 text-green-800" };
    case "error":
      return { label: "Error", colour: "bg-red-100 text-red-800" };
  }
}

/**
 * Returns true if the given scraper run is still in-progress (not terminal).
 */
export function isRunActive(run: ScraperRun): boolean {
  return run.status === "pending" || run.status === "running";
}
