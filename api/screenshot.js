/**
 * Vercel Serverless Function: /api/screenshot
 * Securely resolves Cloudflare R2 object keys to temporary signed URLs.
 * Keeps bucket strictly private while granting authorized time-limited access.
 */

import {
  R2_BUCKET_NAME,
  R2_ACCOUNT_ID,
  getR2PresignedGetUrl,
  signR2Request,
} from "./_r2.js";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const key = req.query.key || (req.body && req.body.key);
  const expiresIn = parseInt(req.query.expires || (req.body && req.body.expires) || "3600", 10);

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing required screenshot 'key' parameter." });
  }

  // Security sanitize key: prevent path traversal or accessing root
  const cleanKey = key.replace(/^\/+/, "");
  if (!cleanKey.startsWith("screenshots/") && !cleanKey.startsWith("avatars/")) {
    return res.status(403).json({ error: "Access denied: Unauthorized storage path." });
  }

  try {
    const signedUrl = getR2PresignedGetUrl(cleanKey, R2_BUCKET_NAME, Math.min(expiresIn, 86400));

    return res.status(200).json({
      success: true,
      key: cleanKey,
      bucket: R2_BUCKET_NAME,
      signed_url: signedUrl,
      expires_in_seconds: expiresIn,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to generate signed URL." });
  }
}
