/**
 * Vercel Serverless Function: /api/upload-screenshot
 * Handles secure screenshot ingestion and uploads to Cloudflare R2 Bucket (yearnit-storage).
 * Target storage directory: yearnit-storage/Screenshot/
 */

import crypto from "crypto";
import {
  R2_ACCOUNT_ID,
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
]);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

/**
 * Verify image magic bytes for security against malicious file masquerading
 */
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

  return false;
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
      category = "order_proof",
      user_id = "anonymous",
      order_id = "",
      filename = "screenshot.png",
    } = req.body || {};

    if (!image_data || typeof image_data !== "string") {
      return res.status(400).json({
        error: "Missing image_data payload. Provide a valid base64 data URL.",
      });
    }

    // Extract MIME type and base64 payload
    const matches = image_data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({
        error:
          "Invalid image format. Expected Base64 Data URL (data:image/...;base64,...).",
      });
    }

    const mimeType = matches[1].toLowerCase().trim();
    const base64Data = matches[2];

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.status(400).json({
        error: `Unsupported image format (${mimeType}). Allowed: PNG, JPEG, WebP, GIF.`,
      });
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    if (imageBuffer.length > MAX_SIZE_BYTES) {
      return res.status(400).json({
        error: "Image exceeds maximum allowed size of 10MB.",
      });
    }

    // Security check: verify magic numbers match declared MIME
    const isValidImage = verifyMagicBytes(imageBuffer, mimeType);
    if (!isValidImage) {
      return res.status(400).json({
        error:
          "Security rejection: Uploaded file signature does not match image format.",
      });
    }

    // Map extension from MIME
    let ext = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";

    // Target folder structure: yearnit-storage/Screenshot/
    const cleanBaseName = String(filename)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30) || "screenshot";

    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const key = `Screenshot/${timestamp}_${cleanBaseName}_${randomSuffix}.${ext}`;

    // Cloudflare R2 Upload Check
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return res.status(500).json({
        success: false,
        error:
          "Cloudflare R2 API Token credentials missing. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in environment variables so files can be written to yearnit-storage/Screenshot/.",
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
        uploaded_by: user_id,
        category: String(category).slice(0, 30),
        order_id: String(order_id).slice(0, 50),
        original_name: String(filename).replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Screenshot successfully stored in Cloudflare R2 bucket: yearnit-storage/Screenshot/",
      key: uploadResult.key,
      url: uploadResult.url,
      bucket: R2_BUCKET_NAME,
      folder: "Screenshot",
      size_bytes: imageBuffer.length,
      storage_provider: "cloudflare_r2",
    });
  } catch (error) {
    console.error("Screenshot upload error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process and store screenshot.",
    });
  }
}
