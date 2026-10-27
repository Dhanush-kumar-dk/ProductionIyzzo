/**
 * Attribution & Marketing Query Capture Utility
 * Captures UTM tags, GCLID, FBCLID, and Meta first-party cookies
 * for end-to-end multi-touch attribution.
 */

export interface AttributionData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  gclid: string;
  fbclid: string;
  fbp: string;
  fbc: string;
  landing_page: string;
  referrer: string;
  first_seen: string;
}

const STORAGE_KEY = "_marketing_attribution";

/**
 * Read cookie by name
 */
export function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : "";
}

/**
 * Set a first-party cookie
 */
export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Captures and returns marketing attribution data on visit.
 * Persists in sessionStorage & cookies so it is never lost during navigation.
 */
export function captureAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return {
      utm_source: "",
      utm_medium: "",
      utm_campaign: "",
      utm_content: "",
      utm_term: "",
      gclid: "",
      fbclid: "",
      fbp: "",
      fbc: "",
      landing_page: "",
      referrer: "",
      first_seen: new Date().toISOString(),
    };
  }

  const urlParams = new URLSearchParams(window.location.search);

  // Read from existing session if already captured
  let existingData: Partial<AttributionData> = {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || getCookie(STORAGE_KEY);
    if (raw) existingData = JSON.parse(raw);
  } catch {
    // ignore parse error
  }

  // Meta Pixel cookies
  const fbp = getCookie("_fbp");
  let fbc = getCookie("_fbc");

  // Construct _fbc from fbclid if not yet created by Meta Pixel
  const fbclid = urlParams.get("fbclid") || existingData.fbclid || "";
  if (fbclid && !fbc) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    setCookie("_fbc", fbc, 90);
  }

  const attribution: AttributionData = {
    utm_source: urlParams.get("utm_source") || existingData.utm_source || "",
    utm_medium: urlParams.get("utm_medium") || existingData.utm_medium || "",
    utm_campaign: urlParams.get("utm_campaign") || existingData.utm_campaign || "",
    utm_content: urlParams.get("utm_content") || existingData.utm_content || "",
    utm_term: urlParams.get("utm_term") || existingData.utm_term || "",
    gclid: urlParams.get("gclid") || existingData.gclid || "",
    fbclid: fbclid,
    fbp: fbp || existingData.fbp || "",
    fbc: fbc || existingData.fbc || "",
    landing_page: existingData.landing_page || window.location.href,
    referrer: existingData.referrer || document.referrer || "",
    first_seen: existingData.first_seen || new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    setCookie(STORAGE_KEY, JSON.stringify(attribution), 30);
  } catch (err) {
    console.warn("Could not save attribution state:", err);
  }

  return attribution;
}

export function getAttribution(): AttributionData {
  return captureAttribution();
}
