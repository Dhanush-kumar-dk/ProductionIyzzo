/**
 * Multi-Platform Advertising & Analytics Tracking Manager
 * Integrates Meta Pixel (Browser & Conversions API), Google Ads, GA4,
 * and Google Consent Mode v2 with deduplication and attribution.
 */

import { getAttribution } from "./attribution";
import { API_BASE_URL } from "../config/api";
import { recordDailyVisit } from "./visitorAnalytics";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: unknown;
    _fbq: unknown;
  }
}

// Environment Variables with fallbacks
export const META_PIXEL_ID =
  (import.meta.env.VITE_META_PIXEL_ID as string) ||
  (import.meta.env.NEXT_PUBLIC_META_PIXEL_ID as string) ||
  "";

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

export const CONSENT_STORAGE_KEY = "yearnit_cookie_consent";

export interface UserTrackingData {
  email?: string;
  phone?: string;
  name?: string;
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
  if (typeof window === "undefined" || !window.gtag) return;

  const status = granted ? "granted" : "denied";
  localStorage.setItem(CONSENT_STORAGE_KEY, status);

  window.gtag("consent", "update", {
    ad_storage: status,
    ad_user_data: status,
    ad_personalization: status,
    analytics_storage: status,
  });
}

/**
 * Initializes Meta Pixel in the browser.
 */
export function initMetaPixel(): void {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
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
 * Master initialization for all advertising trackers.
 */
export function initAllTrackers(): void {
  initConsentMode();
  initMetaPixel();
  initGoogleTags();
}

/**
 * Tracks standard PageView across all platforms with deduplication ID.
 */
export function trackPageView(pagePath?: string): void {
  if (typeof window === "undefined") return;

  const eventId = generateEventId();
  const attribution = getAttribution();
  const path = pagePath || window.location.pathname;

  // 0. Update internal daily viewers analytics
  recordDailyVisit(path);

  // 1. Meta Pixel PageView
  if (window.fbq) {
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

  // 3. Dispatch Server-Side PageView (CAPI)
  try {
    fetch(`${API_BASE_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "PageView",
        eventId,
        eventSourceUrl: window.location.href,
        attribution,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Non-blocking
  }
}

/**
 * Sends events to Meta Pixel, Google Ads, GA4, and Meta Conversions API (CAPI).
 */
export async function trackEvent(
  eventName: "ViewContent" | "Lead" | "Contact" | "InitiateCheckout" | "Purchase" | string,
  params: Record<string, unknown> = {},
  eventId?: string,
  userData?: UserTrackingData
): Promise<void> {
  if (typeof window === "undefined") return;

  const finalEventId = eventId || generateEventId();
  const attribution = getAttribution();

  // 1. Meta Pixel (Browser)
  if (window.fbq) {
    (window.fbq as (action: string, event: string, params?: unknown, options?: unknown) => void)(
      "track",
      eventName,
      params,
      { eventID: finalEventId }
    );
  }

  // 2. Google Ads & GA4
  if (window.gtag) {
    // Standard GA4 event
    window.gtag("event", eventName, {
      ...params,
      event_id: finalEventId,
      ...attribution,
    });

    // Google Ads Specific Conversion on Lead
    if (eventName === "Lead" && GOOGLE_ADS_ID && GADS_LEAD_LABEL) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${GADS_LEAD_LABEL}`,
        event_id: finalEventId,
        ...params,
      });
    }
  }

  // 3. Server-Side Tracking (Meta Conversions API via /api/track)
  try {
    const payload = {
      eventName,
      eventId: finalEventId,
      eventSourceUrl: window.location.href,
      userData: {
        email: userData?.email || "",
        phone: userData?.phone || "",
        name: userData?.name || "",
        fbp: attribution.fbp,
        fbc: attribution.fbc,
      },
      customData: params,
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
