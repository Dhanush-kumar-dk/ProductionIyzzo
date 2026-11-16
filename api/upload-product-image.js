/**
 * Vercel Serverless Function: /api/upload-product-image
 * Handles secure product image uploads and stores them in Cloudflare R2 Bucket.
 * Target folder: yearnit-storage/Product-image/
 */

import crypto from "crypto";
import {
  R2_BUCKET_NAME,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  uploadToR2,
  getR2PresignedGetUrl,
} from "./_r2.js";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function verifyMagicBytes(buffer, declaredMime) {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return declaredMime.includes("jpeg") || declaredMime.includes("jpg");
  }

  // PNG: 89 50 4E 47 (0x89 'PNG')
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return declaredMime.includes("png");
  }

  // GIF: 47 49 46 38 ('GIF8')
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return declaredMime.includes("gif");
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return declaredMime.includes("webp");
  }

  return true; // allow other modern formats like avif
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
      image_data,
      filename = "product.png",
      product_id = "",
      slot = "primary", // primary | image1 | image2
    } = req.body || {};

    if (!image_data || typeof image_data !== "string") {
      return res.status(400).json({
        error: "Missing image_data payload. Provide a valid base64 data URL.",
      });
    }

    const matches = image_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({
        error: "Invalid image format. Expected Base64 Data URL (data:image/...;base64,...).",
      });
    }

    const mimeType = matches[1].toLowerCase().trim();
    const base64Data = matches[2];

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(400).json({
        error: `Unsupported image format (${mimeType}). Allowed: PNG, JPEG, WebP, GIF, AVIF.`,
      });
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    if (imageBuffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({
        error: "Image exceeds maximum allowed size of 10MB.",
      });
    }

    const isValid = verifyMagicBytes(imageBuffer, mimeType);
    if (!isValid) {
      return res.status(400).json({
        error: "Security rejection: Uploaded file signature does not match image format.",
      });
    }

    let ext = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";
    else if (mimeType.includes("avif")) ext = "avif";

    // Target folder structure: yearnit-storage/Product-image/
    const cleanBaseName = String(filename)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30) || "product";

    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const key = `Product-image/${timestamp}_${cleanBaseName}_${randomSuffix}.${ext}`;

    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return res.status(500).json({
        success: false,
        error:
          "Cloudflare R2 API Token credentials missing. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in environment variables so files can be written to yearnit-storage/Product-image/.",
        bucket: R2_BUCKET_NAME,
        target_path: `yearnit-storage/${key}`,
      });
    }

    const uploadResult = await uploadToR2({
      key,
      buffer: imageBuffer,
      contentType: mimeType,
      bucket: R2_BUCKET_NAME,
      metadata: {
        folder: "Product-image",
        slot,
        product_id: String(product_id).slice(0, 50),
        original_name: String(filename).replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80),
      },
    });

    // Generate maximum duration presigned URL (7 days / 604800 seconds)
    const longLivedUrl = getR2PresignedGetUrl(key, R2_BUCKET_NAME, 604800);
    const proxyUrl = `/api/product-image?key=${encodeURIComponent(key)}`;

    return res.status(200).json({
      success: true,
      message: "Product image successfully stored in Cloudflare R2 bucket: yearnit-storage/Product-image/",
      key: uploadResult.key,
      url: proxyUrl, // permanent proxy URL that serves from R2
      presigned_url: longLivedUrl,
      bucket: R2_BUCKET_NAME,
      folder: "Product-image",
      slot,
      size_bytes: imageBuffer.length,
      storage_provider: "cloudflare_r2",
    });
  } catch (error) {
    console.error("Product image upload error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process and store product image.",
    });
  }
}
