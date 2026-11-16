/**
 * Vercel Serverless Function: /api/track
 * Handles server-side tracking (Meta Conversions API / CAPI and custom telemetry).
 * Prevents 404 errors when the frontend dispatches tracking events.
 */

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  res.setHeader("X-Content-Type-Options", "nosniff");
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

    const metaPixelId =
      process.env.META_PIXEL_ID ||
      process.env.VITE_META_PIXEL_ID ||
      "";

    const metaAccessToken =
      process.env.META_ACCESS_TOKEN ||
      process.env.FB_ACCESS_TOKEN ||
      "";

    // If Meta Conversions API credentials are configured, forward to Meta Graph API
    if (metaPixelId && metaAccessToken) {
      try {
        const payload = {
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl || req.headers.referer || "https://yearnit.in",
              action_source: "website",
              user_data: {
                client_ip_address: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
                client_user_agent: req.headers["user-agent"],
                fbp: userData.fbp || attribution.fbp,
                fbc: userData.fbc || attribution.fbc,
              },
              custom_data: customData,
            },
          ],
        };

        await fetch(`https://graph.facebook.com/v19.0/${metaPixelId}/events?access_token=${metaAccessToken}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (metaErr) {
        // Non-blocking for client
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
