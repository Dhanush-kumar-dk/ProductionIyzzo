// src/utils/r2Storage.ts
/**
 * Front-end helper: converts a File to a base64 Data URL and POSTs
 * it to the backend /api/upload-screenshot endpoint which stores the
 * image in Cloudflare R2 under "Screenshot/" and returns a signed URL.
 */
import { useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface R2UploadResult {
  success: boolean;
  key: string;
  url: string;
  bucket: string;
  folder: string;
  size_bytes?: number;
}

// ─────────────────────────────────────────────
// Internal helper: File → base64 data URL
// ─────────────────────────────────────────────
function fileToBase64DataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// Core upload function
// ─────────────────────────────────────────────
export async function uploadScreenshotToR2(
  file: File,
  options?: {
    category?: string;
    userId?: string;
    filename?: string;
    orderId?: string;
  }
): Promise<R2UploadResult> {
  // The backend API expects a JSON body with a base64 data URL
  const image_data = await fileToBase64DataUrl(file);

  const response = await fetch("/api/upload-screenshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_data,
      category: options?.category ?? "support",
      user_id: options?.userId ?? "anonymous",
      order_id: options?.orderId ?? "",
      filename: options?.filename ?? file.name,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to upload screenshot");
  }

  const data = (await response.json()) as R2UploadResult;
  return data;
}

// ─────────────────────────────────────────────
// React hook used by UploadScreenshotModal
// ─────────────────────────────────────────────
export function useScreenshotUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<R2UploadResult | null>(null);

  const upload = async (
    file: File,
    options?: {
      category?: string;
      userId?: string;
      filename?: string;
      orderId?: string;
    }
  ): Promise<R2UploadResult> => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadScreenshotToR2(file, options);
      setResult(res);
      return res;
    } catch (err: any) {
      const msg = err?.message ?? "Upload failed";
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

  return { upload, isUploading, error, result, reset };
}
