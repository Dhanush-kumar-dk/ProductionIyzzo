/**
 * Vercel Serverless Function: /api/product-image?key=Product-image/...
 * Streams product images directly from Cloudflare R2 bucket (yearnit-storage).
 * Includes immutable cache headers so images load instantly across store products.
 */

import { R2_BUCKET_NAME, signR2Request } from "./_r2.js";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const key = req.query.key;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing required 'key' query parameter." });
  }

  const cleanKey = key.replace(/^\/+/, "");
  // Only allow serving from Product-image/ and Screenshot/
  if (
    !cleanKey.startsWith("Product-image/") &&
    !cleanKey.startsWith("product-image/") &&
    !cleanKey.startsWith("Screenshot/")
  ) {
    return res.status(403).json({ error: "Access denied: Unauthorized storage path." });
  }

  try {
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
    // Cache for 1 year, immutable
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Error serving product image from R2:", error);
    return res.status(500).json({ error: "Failed to stream product image from R2." });
  }
}
