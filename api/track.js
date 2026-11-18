/**
 * Vercel Serverless Function: /api/track
 * Handles Meta Conversions API (CAPI) server-side event dispatch with
 * SHA-256 PII hashing, event_id deduplication, and strict Business Tool Terms filtering.
 */

import crypto from "crypto";

const SENSITIVE_PATH_PREFIXES = ["/admin", "/profile", "/account"];
const BLOCKED_CUSTOM_KEYS = new Set([
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

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function sha256Normalized(value) {
  if (!value || typeof value !== "string") return undefined;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

function sha256Phone(phone) {
  if (!phone || typeof phone !== "string") return undefined;
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 7) return undefined;
  return crypto.createHash("sha256").update(digits).digest("hex");
}

function sanitizeCustomData(customData) {
  const clean = {};
  if (!customData || typeof customData !== "object") return clean;
  for (const [k, v] of Object.entries(customData)) {
    if (v === undefined || v === null || v === "") continue;
    if (BLOCKED_CUSTOM_KEYS.has(k.toLowerCase())) continue;
    clean[k] = v;
  }
  return clean;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const {
      eventName = "PageView",
      eventId,
      eventSourceUrl,
      userData = {},
      customData = {},
      attribution = {},
    } = req.body || {};

    // Never forward events from sensitive admin/profile/billing paths
    const sourceUrl = String(eventSourceUrl || req.headers.referer || "https://yearnit.in");
    try {
      const parsed = new URL(sourceUrl);
      const pathLower = parsed.pathname.toLowerCase();
      if (SENSITIVE_PATH_PREFIXES.some((prefix) => pathLower.startsWith(prefix))) {
        return res.status(200).json({
          success: true,
          skipped: true,
          reason: "sensitive_route_excluded",
        });
      }
    } catch {
      // Fallback to default URL
    }

    const metaPixelId =
      process.env.META_PIXEL_ID ||
      process.env.VITE_META_PIXEL_ID ||
      "1459486569390454";

    const metaAccessToken =
      process.env.META_ACCESS_TOKEN ||
      process.env.FB_ACCESS_TOKEN ||
      "";

    // Forward to Meta Graph Conversions API only when access token is configured
    if (metaPixelId && metaAccessToken) {
      try {
        const hashedEmail = sha256Normalized(userData.email);
        const hashedPhone = sha256Phone(userData.phone);

        const clientIp = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
          .split(",")[0]
          .trim();

        const metaUserData = {
          client_ip_address: clientIp || undefined,
          client_user_agent: req.headers["user-agent"] || undefined,
          fbp: userData.fbp || attribution.fbp || undefined,
          fbc: userData.fbc || attribution.fbc || undefined,
          ...(hashedEmail ? { em: [hashedEmail] } : {}),
          ...(hashedPhone ? { ph: [hashedPhone] } : {}),
        };

        const payload = {
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: sourceUrl,
              action_source: "website",
              user_data: metaUserData,
              custom_data: sanitizeCustomData(customData),
            },
          ],
        };

        await fetch(
          `https://graph.facebook.com/v19.0/${metaPixelId}/events?access_token=${encodeURIComponent(metaAccessToken)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } catch (metaErr) {
        console.warn("Meta CAPI dispatch warning:", metaErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      received: true,
      event: eventName,
      eventId: eventId || null,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Tracking endpoint error:", error);
    return res.status(200).json({
      success: false,
      error: error.message || "Failed to process tracking event",
    });
  }
}
