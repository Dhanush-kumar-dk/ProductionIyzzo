/**
 * Multi-Platform Advertising & Analytics Tracking Manager
 * Integrates Meta Pixel (Browser & Conversions API), Google Ads, GA4,
 * and Google Consent Mode v2 with deduplication and attribution.
 */

import { getAttribution } from "./attribution";
import { API_BASE_URL } from "../config/api";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
    _fbq: any;
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
  (import.meta.env.VITE_GADS_LEAD_LABEL as string) ||
  (import.meta.env.NEXT_PUBLIC_GADS_LEAD_LABEL as string) ||
  "";

export const GTM_ID =
  (import.meta.env.VITE_GTM_ID as string) ||
  (import.meta.env.NEXT_PUBLIC_GTM_ID as string) ||
  "GTM-53M6FK9L";

const CONSENT_STORAGE_KEY = "_consent_mode_v2";

/**
 * Generate unique UUID for CAPI + Browser Pixel deduplication
 */
export function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
}

/**
 * Initialize Google Consent Mode v2
 * Defaults to 'denied' until the user provides consent.
 */
export function initConsentMode(): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
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

  window.gtag("set", "ads_data_redaction", !isGranted);
}

/**
 * Update consent after user acceptance
 */
export function updateConsent(granted: boolean): void {
  if (typeof window === "undefined") return;

  const status = granted ? "granted" : "denied";
  localStorage.setItem(CONSENT_STORAGE_KEY, status);

  if (window.gtag) {
    window.gtag("consent", "update", {
      ad_storage: status,
      ad_user_data: status,
      ad_personalization: status,
      analytics_storage: status,
    });
    window.gtag("set", "ads_data_redaction", !granted);
  }

  // Trigger pageview on grant if not already recorded
  if (granted) {
    trackPageView(window.location.pathname);
  }
}

export function hasUserConsented(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_STORAGE_KEY) === "granted";
}

/**
 * Initialize Meta Pixel script
 */
export function initMetaPixel(): void {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  if (window.fbq) return;

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
  /* eslint-enable */

  window.fbq("init", META_PIXEL_ID);
}

/**
 * Initialize Google Tag (gtag.js) for Google Ads and GA4
 */
export function initGoogleTag(): void {
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
      function () {
        window.dataLayer.push(arguments);
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
 * Initialize all marketing pixels safely
 */
export function initAllTrackers(): void {
  initConsentMode();
  initMetaPixel();
  initGoogleTag();
}

/**
 * Fire PageView for SPA route transitions
 */
export function trackPageView(url: string = window.location.pathname): void {
  if (typeof window === "undefined") return;

  // Meta Pixel PageView
  if (window.fbq) {
    window.fbq("track", "PageView");
  }

  // Google Ads / GA4 PageView
  if (window.gtag) {
    if (GA4_ID) {
      window.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
    if (GOOGLE_ADS_ID) {
      window.gtag("event", "page_view", {
        send_to: GOOGLE_ADS_ID,
        page_path: url,
      });
    }
  }
}

export interface UserTrackingData {
  email?: string;
  phone?: string;
  name?: string;
  city?: string;
}

/**
 * Core Universal Tracking Dispatcher
 * Sends events to Meta Pixel, Google Ads, GA4, and Meta Conversions API (CAPI).
 */
export async function trackEvent(
  eventName: "ViewContent" | "Lead" | "Contact" | "InitiateCheckout" | "Purchase" | string,
  params: Record<string, any> = {},
  eventId?: string,
  userData?: UserTrackingData
): Promise<void> {
  if (typeof window === "undefined") return;

  const finalEventId = eventId || generateEventId();
  const attribution = getAttribution();

  // 1. Meta Pixel (Browser)
  if (window.fbq) {
    window.fbq("track", eventName, params, { eventID: finalEventId });
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
  } catch (err) {
    // Non-blocking
  }
}
