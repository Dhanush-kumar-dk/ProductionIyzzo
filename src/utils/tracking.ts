/**
 * Multi-Platform Advertising & Analytics Tracking Manager
 * Integrates Meta Pixel (Browser & Conversions API), Google Ads, GA4,
 * and Google Consent Mode v2 with deduplication and attribution.
 */

import { getAttribution } from "./attribution";
import { API_BASE_URL } from "../config/api";
import { recordDailyVisit } from "./visitorAnalytics";
import Clarity from "@microsoft/clarity";

export { Clarity };

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: unknown;
    _fbq: unknown;
    __YEARNIT_INITIAL_PV_ID__?: string;
  }
}

const ALLOWED_META_DOMAINS = new Set(["yearnit.in", "www.yearnit.in"]);
const SENSITIVE_ROUTE_PREFIXES = ["/admin", "/profile", "/account"];
const BLOCKED_META_PARAM_KEYS = new Set([
  "email",
  "phone",
  "name",
  "password",
  "upi",
  "upi_id",
  "account_number",
  "ifsc",
  "ifsc_code",
  "bank",
  "token",
  "secret",
  "screenshot_key",
]);

/**
 * Only allow Meta Pixel / CAPI on verified production domains so preview/localhost
 * environments never pollute or trigger domain restrictions in Meta Events Manager.
 */
export function isMetaAllowedDomain(): boolean {
  if (typeof window === "undefined") return false;
  return ALLOWED_META_DOMAINS.has(window.location.hostname.toLowerCase());
}

/**
 * Exclude admin and account/billing/payout routes from Meta Pixel tracking
 * to stay strictly compliant with Meta Business Tool Terms.
 */
export function isSensitiveRoute(pathname?: string): boolean {
  if (typeof window === "undefined") return true;
  const path = (pathname ?? window.location.pathname).toLowerCase();
  return SENSITIVE_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Strips any sensitive query parameters from URLs sent to Meta CAPI.
 */
export function getSanitizedEventUrl(): string {
  if (typeof window === "undefined") return "https://yearnit.in/";
  try {
    const url = new URL(window.location.href);
    const sensitiveParams = ["email", "phone", "token", "upi", "code", "password", "key", "secret"];
    sensitiveParams.forEach((p) => url.searchParams.delete(p));
    return url.toString();
  } catch {
    return `${window.location.origin}${window.location.pathname}`;
  }
}

/**
 * Removes any PII / financial keys before dispatching custom_data to Meta Pixel / CAPI.
 */
function sanitizeMetaParams(params: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (BLOCKED_META_PARAM_KEYS.has(k.toLowerCase())) continue;
    clean[k] = v;
  }
  return clean;
}

// Environment Variables with fallbacks
export const META_PIXEL_ID =
  (import.meta.env.VITE_META_PIXEL_ID as string) ||
  (import.meta.env.NEXT_PUBLIC_META_PIXEL_ID as string) ||
  "1459486569390454";

export const GOOGLE_ADS_ID =
  (import.meta.env.VITE_GOOGLE_ADS_ID as string) ||
  (import.meta.env.NEXT_PUBLIC_GOOGLE_ADS_ID as string) ||
  "";

export const GA4_ID =
  (import.meta.env.VITE_GA4_ID as string) ||
  (import.meta.env.NEXT_PUBLIC_GA4_ID as string) ||
  "";

export const GADS_LEAD_LABEL =
  (import.meta.env.VITE_GADS_LEAD_CONVERSION_LABEL as string) ||
  (import.meta.env.NEXT_PUBLIC_GADS_LEAD_CONVERSION_LABEL as string) ||
  "";

export const GADS_PURCHASE_LABEL =
  (import.meta.env.VITE_GADS_PURCHASE_CONVERSION_LABEL as string) ||
  (import.meta.env.NEXT_PUBLIC_GADS_PURCHASE_CONVERSION_LABEL as string) ||
  "";

export const CLARITY_PROJECT_ID =
  (import.meta.env.VITE_CLARITY_PROJECT_ID as string) ||
  "zdcr53blnh";

export const CONSENT_STORAGE_KEY = "yearnit_cookie_consent";

export interface UserTrackingData {
  email?: string;
  phone?: string;
  name?: string;
  screenshot_key?: string;
}

/**
 * Generates unique event_id for deduplication between client-side Pixels and server-side CAPI.
 */
export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `evt_${timestamp}_${random}`;
}

/**
 * Initializes Google Consent Mode v2 with default denied or stored user consent.
 */
export function initConsentMode(): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function (...args: unknown[]) {
      window.dataLayer.push(args);
    };

  const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
  const isGranted = storedConsent === "granted";

  window.gtag("consent", "default", {
    ad_storage: isGranted ? "granted" : "denied",
    ad_user_data: isGranted ? "granted" : "denied",
    ad_personalization: isGranted ? "granted" : "denied",
    analytics_storage: isGranted ? "granted" : "denied",
    wait_for_update: 500,
  });
}

/**
 * Updates Google Consent Mode state when user accepts or denies.
 */
export function updateConsent(granted: boolean): void {
  const status = granted ? "granted" : "denied";
  localStorage.setItem(CONSENT_STORAGE_KEY, status);

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: status,
      ad_user_data: status,
      ad_personalization: status,
      analytics_storage: status,
    });
  }

  // Synchronize with Microsoft Clarity Consent Mode v2
  try {
    if (granted) {
      Clarity.consentV2({ ad_Storage: "granted", analytics_Storage: "granted" });
    } else {
      Clarity.consentV2({ ad_Storage: "denied", analytics_Storage: "denied" });
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Initializes Meta Pixel in the browser.
 */
export function initMetaPixel(): void {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  if (!isMetaAllowedDomain() || isSensitiveRoute()) return;
  if (window.fbq) return;

  type FbqFunction = {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
    push?: (...args: unknown[]) => void;
  };

  const n: FbqFunction = function (...args: unknown[]) {
    if (n.callMethod) {
      n.callMethod(...args);
    } else if (n.queue) {
      n.queue.push(args);
    }
  };

  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  window.fbq = n;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  const attribution = getAttribution();
  const initParams: Record<string, unknown> = {};
  if (attribution.fbp) initParams.fbp = attribution.fbp;
  if (attribution.fbc) initParams.fbc = attribution.fbc;

  (window.fbq as (action: string, key: string, value: unknown, pixelId?: string) => void)(
    "set",
    "autoConfig",
    false,
    META_PIXEL_ID
  );

  (window.fbq as (action: string, id: string, params?: unknown) => void)(
    "init",
    META_PIXEL_ID,
    initParams
  );
}

/**
 * Initializes Google Tag (gtag.js) for GA4 and Google Ads.
 */
export function initGoogleTags(): void {
  if (typeof window === "undefined") return;
  const tagId = GOOGLE_ADS_ID || GA4_ID;
  if (!tagId) return;

  const scriptId = "google-gtag-script";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function (...args: unknown[]) {
        window.dataLayer.push(args);
      };

    window.gtag("js", new Date());

    if (GOOGLE_ADS_ID) {
      window.gtag("config", GOOGLE_ADS_ID, { send_page_view: false });
    }
    if (GA4_ID) {
      window.gtag("config", GA4_ID, { send_page_view: false });
    }
  }
}

/**
 * Initializes Microsoft Clarity behavioral analytics via the official NPM package.
 */
export function initClarity(): void {
  if (typeof window === "undefined" || !CLARITY_PROJECT_ID) return;

  try {
    Clarity.init(CLARITY_PROJECT_ID);

    // Apply stored user consent state
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedConsent === "granted") {
      Clarity.consentV2({ ad_Storage: "granted", analytics_Storage: "granted" });
    } else if (storedConsent === "denied") {
      Clarity.consentV2({ ad_Storage: "denied", analytics_Storage: "denied" });
    }

    // Attach attribution tags to the Clarity session
    const attribution = getAttribution();
    if (attribution.utm_source) {
      Clarity.setTag("utm_source", attribution.utm_source);
    }
    if (attribution.utm_campaign) {
      Clarity.setTag("utm_campaign", attribution.utm_campaign);
    }
  } catch (err) {
    console.warn("Failed to initialize Microsoft Clarity:", err);
  }
}

/**
 * Master initialization for all advertising trackers.
 */
export function initAllTrackers(): void {
  initConsentMode();
  initMetaPixel();
  initGoogleTags();
  initClarity();
}

/**
 * Tracks standard PageView across all platforms with deduplication ID.
 */
export function trackPageView(
  pagePath?: string,
  options?: { skipMetaPixel?: boolean }
): void {
  if (typeof window === "undefined") return;

  const path = pagePath || window.location.pathname;
  const allowMeta = isMetaAllowedDomain() && !isSensitiveRoute(path);
  const eventId =
    options?.skipMetaPixel && window.__YEARNIT_INITIAL_PV_ID__
      ? window.__YEARNIT_INITIAL_PV_ID__
      : generateEventId();
  const attribution = getAttribution();

  // 0. Update internal daily viewers analytics
  recordDailyVisit(path);

  // 1. Meta Pixel PageView (skipped on first load because index.html base code already fired PageView)
  if (allowMeta && window.fbq && !options?.skipMetaPixel) {
    (window.fbq as (action: string, event: string, params?: unknown, options?: unknown) => void)(
      "track",
      "PageView",
      {},
      { eventID: eventId }
    );
  }

  // 2. Google Ads & GA4 PageView
  if (window.gtag) {
    if (GA4_ID) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: document.title,
        page_location: window.location.href,
        event_id: eventId,
        ...attribution,
      });
    }
    if (GOOGLE_ADS_ID) {
      window.gtag("event", "page_view", {
        send_to: GOOGLE_ADS_ID,
        event_id: eventId,
        page_path: path,
      });
    }
  }

  // 3. Dispatch Server-Side PageView (CAPI) only on allowed production public routes
  if (allowMeta) {
    try {
      fetch(`${API_BASE_URL}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "PageView",
          eventId,
          eventSourceUrl: getSanitizedEventUrl(),
          attribution,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Official Meta Pixel Standard Event names
 */
export type MetaStandardEvent =
  | "AddPaymentInfo"
  | "AddToCart"
  | "AddToWishlist"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "InitiateCheckout"
  | "Lead"
  | "Purchase"
  | "Schedule"
  | "Search"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "ViewContent";

/**
 * Safely parses formatted price strings (e.g. "₹1,099" or "28,990") into a number.
 */
export function parsePriceValue(price?: string | number): number {
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Sends events to Meta Pixel, Google Ads, GA4, and Meta Conversions API (CAPI).
 */
export async function trackEvent(
  eventName: MetaStandardEvent | string,
  params: Record<string, unknown> = {},
  eventId?: string,
  userData?: UserTrackingData
): Promise<void> {
  if (typeof window === "undefined") return;

  const finalEventId = eventId || generateEventId();
  const attribution = getAttribution();
  const allowMeta = isMetaAllowedDomain() && !isSensitiveRoute();
  const cleanParams = sanitizeMetaParams(params);

  // 1. Meta Pixel (Browser) — strictly on public production pages with sanitized params
  if (allowMeta && window.fbq) {
    (window.fbq as (action: string, event: string, params?: unknown, options?: unknown) => void)(
      "track",
      eventName,
      cleanParams,
      { eventID: finalEventId }
    );
  }

  // 2. Google Ads & GA4
  if (window.gtag) {
    // Standard GA4 event
    window.gtag("event", eventName, {
      ...cleanParams,
      event_id: finalEventId,
      ...attribution,
    });

    // Google Ads Specific Conversion on Lead
    if (eventName === "Lead" && GOOGLE_ADS_ID && GADS_LEAD_LABEL) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${GADS_LEAD_LABEL}`,
        event_id: finalEventId,
        ...cleanParams,
      });
    }
  }

  // 3. Server-Side Tracking (Meta Conversions API via /api/track)
  if (allowMeta) {
    try {
      const payload = {
        eventName,
        eventId: finalEventId,
        eventSourceUrl: getSanitizedEventUrl(),
        userData: {
          email: userData?.email || "",
          phone: userData?.phone || "",
          name: userData?.name || "",
          fbp: attribution.fbp,
          fbc: attribution.fbc,
        },
        customData: cleanParams,
        attribution,
      };

      // Non-blocking server dispatch
      fetch(`${API_BASE_URL}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => {
        console.warn("CAPI dispatch failed silently:", err.message);
      });
    } catch {
      // Non-blocking
    }
  }

  // 4. Microsoft Clarity Smart Event
  try {
    Clarity.event(eventName);
  } catch {
    // Non-blocking
  }
}

/**
 * Convenience helpers for all 17 Meta Pixel Standard Events.
 * Every helper triggers fbq('track', ...), GA4, and CAPI (/api/track) with deduplication.
 */
export const metaEvents = {
  addPaymentInfo: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("AddPaymentInfo", params, undefined, userData),

  addToCart: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("AddToCart", { currency: "INR", ...params }, undefined, userData),

  addToWishlist: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("AddToWishlist", { currency: "INR", ...params }, undefined, userData),

  completeRegistration: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("CompleteRegistration", { status: true, ...params }, undefined, userData),

  contact: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("Contact", params, undefined, userData),

  customizeProduct: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("CustomizeProduct", params, undefined, userData),

  donate: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("Donate", { currency: "INR", ...params }, undefined, userData),

  findLocation: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("FindLocation", params, undefined, userData),

  initiateCheckout: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("InitiateCheckout", { currency: "INR", ...params }, undefined, userData),

  lead: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("Lead", params, undefined, userData),

  purchase: (
    value = 0.0,
    currency = "INR",
    params: Record<string, unknown> = {},
    userData?: UserTrackingData
  ) => trackEvent("Purchase", { value, currency, ...params }, undefined, userData),

  schedule: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("Schedule", params, undefined, userData),

  search: (searchString: string, params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("Search", { search_string: searchString, ...params }, undefined, userData),

  startTrial: (
    value = "0.00",
    currency = "INR",
    predictedLtv = "0.00",
    params: Record<string, unknown> = {},
    userData?: UserTrackingData
  ) =>
    trackEvent(
      "StartTrial",
      { value, currency, predicted_ltv: predictedLtv, ...params },
      undefined,
      userData
    ),

  submitApplication: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("SubmitApplication", params, undefined, userData),

  subscribe: (
    value = "0.00",
    currency = "INR",
    predictedLtv = "0.00",
    params: Record<string, unknown> = {},
    userData?: UserTrackingData
  ) =>
    trackEvent(
      "Subscribe",
      { value, currency, predicted_ltv: predictedLtv, ...params },
      undefined,
      userData
    ),

  viewContent: (params: Record<string, unknown> = {}, userData?: UserTrackingData) =>
    trackEvent("ViewContent", { currency: "INR", ...params }, undefined, userData),
};
