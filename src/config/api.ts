export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "");

/**
 * Amazon PA-API & Creators API Partner Configurations
 */
export const DEFAULT_PARTNER_TAG: string =
  (import.meta.env.VITE_DEFAULT_PARTNER_TAG as string) || "dk29112306-21.izzyo_app";

export const BASE_PARTNER_TAG: string =
  (import.meta.env.VITE_BASE_PARTNER_TAG as string) || "dk29112306-21";

export const AMAZON_CLIENT_ID: string =
  (import.meta.env.VITE_AMAZON_CLIENT_ID as string) ||
  "amzn1.application-oa2-client.f8f28dd1a3664ec8a6d1f65bdc663539";

export const AMAZON_CLIENT_SECRET: string =
  (import.meta.env.VITE_AMAZON_CLIENT_SECRET as string) ||
  "amzn1.oa2-cs.v1.60b806dafb8ddfe7803af43b427058db60a6a78d5d4c03717543d9035d1ef5d6";
