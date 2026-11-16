/**
 * Cloudflare R2 Storage Client Utilities
 * Handles secure screenshot uploads and signed URL retrieval for Yearnit.
 * Bucket: yearnit-storage
 * Endpoint: https://6f8cc310c2f5b51d23498109b56cfe39.r2.cloudflarestorage.com
 */

import { useState } from "react";

export interface R2UploadResult {
  success: boolean;
  key: string;
  url: string;
  bucket: string;
  category: string;
  sizeBytes: number;
  message?: string;
}

export interface UploadScreenshotOptions {
  category?: "order_proof" | "support" | "avatar" | "feedback" | string;
  userId?: string;
  orderId?: string;
  filename?: string;
}

/**
 * Upload a Screenshot File (File or Blob) to Cloudflare R2 via secure API endpoint
 */
export async function uploadScreenshotToR2(
  file: File | Blob,
  options: UploadScreenshotOptions = {}
): Promise<R2UploadResult> {
  const {
    category = "order_proof",
    userId = "user_guest",
    orderId = "",
    filename = file instanceof File ? file.name : "screenshot.png",
  } = options;

  // Client validation: Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed size of 10MB.");
  }

  // Convert File/Blob to Base64 Data URL
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to encode image to base64."));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const response = await fetch("/api/upload-screenshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_data: base64Data,
      category,
      user_id: userId,
      order_id: orderId,
      filename,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload screenshot to Cloudflare R2.");
  }

  return {
    success: true,
    key: data.key,
    url: data.url,
    bucket: data.bucket,
    category: data.category,
    sizeBytes: data.size_bytes,
    message: data.message,
  };
}

/**
 * Fetch a fresh, time-limited Presigned GET URL for a private R2 object key
 */
export async function getR2SignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const res = await fetch(`/api/screenshot?key=${encodeURIComponent(key)}&expires=${expiresIn}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to get signed URL for screenshot.");
  }
  return data.signed_url;
}

/**
 * React Hook for easy screenshot uploads with state tracking
 */
export function useScreenshotUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<R2UploadResult | null>(null);

  const upload = async (file: File | Blob, options?: UploadScreenshotOptions) => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await uploadScreenshotToR2(file, options);
      setResult(res);
      return res;
    } catch (err: any) {
      const msg = err.message || "Screenshot upload failed.";
      setError(msg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setIsUploading(false);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    isUploading,
    error,
    result,
    reset,
  };
}
