/**
 * Vercel Serverless Function: /api/screenshot
 * Securely resolves Cloudflare R2 object keys to temporary signed URLs OR streams them directly.
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
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
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
  const shouldStream = req.query.stream === "true" || req.query.serve === "true";

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing required 'key' parameter." });
  }

  // Security sanitize key: prevent path traversal or accessing unauthorized prefixes
  const cleanKey = key.replace(/^\/+/, "");
  if (
    !cleanKey.startsWith("Screenshot/") &&
    !cleanKey.startsWith("screenshots/") &&
    !cleanKey.startsWith("Product-image/") &&
    !cleanKey.startsWith("product-image/") &&
    !cleanKey.startsWith("avatars/")
  ) {
    return res.status(403).json({ error: "Access denied: Unauthorized storage path." });
  }

  try {
    // If streaming requested (e.g. for product images / direct display)
    if (shouldStream) {
      const signed = signR2Request({
        method: "GET",
        key: cleanKey,
        bucket: R2_BUCKET_NAME,
      });

      const r2Res = await fetch(signed.url, { headers: signed.headers });
      if (!r2Res.ok) {
        return res.status(r2Res.status).json({
          error: `Cloudflare R2 returned status ${r2Res.status} for key ${cleanKey}`,
        });
      }

      const contentType = r2Res.headers.get("content-type") || "image/png";
      const buffer = Buffer.from(await r2Res.arrayBuffer());

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      return res.status(200).send(buffer);
    }

    // Default: generate secure presigned URL
    const signedUrl = getR2PresignedGetUrl(cleanKey, R2_BUCKET_NAME, Math.min(expiresIn, 604800));

    return res.status(200).json({
      success: true,
      key: cleanKey,
      bucket: R2_BUCKET_NAME,
      signed_url: signedUrl,
      expires_in_seconds: expiresIn,
    });
  } catch (err) {
    console.error("Screenshot endpoint error:", err);
    return res.status(500).json({ error: err.message || "Failed to process R2 object request." });
  }
}
