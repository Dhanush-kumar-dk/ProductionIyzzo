/**
 * Amazon Affiliate & PA-API / Creators API Utilities
 * Manages tracking tags, ASIN parsing, and safe affiliate URL generation.
 * Adheres strictly to Amazon Associates Program Operating Agreement.
 */

export const DEFAULT_PARTNER_TAG =
  (import.meta.env.VITE_DEFAULT_PARTNER_TAG as string) || "dk29112306-21";

export const BASE_PARTNER_TAG =
  (import.meta.env.VITE_BASE_PARTNER_TAG as string) || "dk29112306-21";

/**
 * Get active partner/tracking ID from localStorage or fallback to default
 */
export function getActiveTrackingId(): string {
  if (typeof window === "undefined") return DEFAULT_PARTNER_TAG;
  const stored = localStorage.getItem("trackingId");
  if (stored && stored.trim().length > 0) {
    return stored.trim();
  }
  return DEFAULT_PARTNER_TAG;
}

/**
 * Extract 10-character Amazon ASIN from any URL or string
 */
export function extractAsin(input: string): string | null {
  if (!input) return null;
  const match = input.match(/(?:\/dp\/|\/gp\/product\/|\/ASIN\/|^)([A-Z0-9]{10})(?:[/?&#]|$)/i);
  return match && match[1] ? match[1].toUpperCase() : null;
}

/**
 * Construct or update an Amazon Affiliate URL with the proper tracking tag.
 * Direct amazon.in URL with no cloaking or redirection.
 */
export function buildAffiliateUrl(rawUrl: string, customTag?: string | null): string {
  const tag = (customTag && customTag.trim().length > 0) ? customTag.trim() : getActiveTrackingId();

  if (!rawUrl || rawUrl.trim() === "") {
    return `https://www.amazon.in/?tag=${encodeURIComponent(tag)}`;
  }

  const cleanInput = rawUrl.trim();

  // If input is simply an ASIN
  if (/^[A-Z0-9]{10}$/i.test(cleanInput)) {
    return `https://www.amazon.in/dp/${cleanInput.toUpperCase()}?tag=${encodeURIComponent(tag)}`;
  }

  try {
    const parsed = new URL(cleanInput.startsWith("http") ? cleanInput : `https://${cleanInput}`);
    
    // Set or overwrite the affiliate tag
    parsed.searchParams.set("tag", tag);
    
    // Ensure direct Amazon domain
    return parsed.toString();
  } catch {
    // If URL parsing fails, attempt regex extraction of ASIN
    const asin = extractAsin(cleanInput);
    if (asin) {
      return `https://www.amazon.in/dp/${asin}?tag=${encodeURIComponent(tag)}`;
    }

    const separator = cleanInput.includes("?") ? "&" : "?";
    return `${cleanInput}${separator}tag=${encodeURIComponent(tag)}`;
  }
}

/**
 * Construct a marketplace search link with the active tracking tag
 */
export function buildMarketplaceSearchUrl(keyword: string, customTag?: string | null): string {
  const tag = (customTag && customTag.trim().length > 0) ? customTag.trim() : getActiveTrackingId();
  return `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&tag=${encodeURIComponent(tag)}`;
}

export const buildAmazonSearchUrl = buildMarketplaceSearchUrl;
