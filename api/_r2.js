/**
 * Cloudflare R2 S3-Compatible Client (Zero-Dependency Node.js ES Module)
 * Bucket: yearnit-storage
 * Endpoint: https://6f8cc310c2f5b51d23498109b56cfe39.r2.cloudflarestorage.com
 */

import crypto from "crypto";

export const R2_ACCOUNT_ID =
  process.env.R2_ACCOUNT_ID || "6f8cc310c2f5b51d23498109b56cfe39";

export const R2_BUCKET_NAME =
  process.env.R2_BUCKET_NAME || "yearnit-storage";

export const R2_ACCESS_KEY_ID =
  process.env.R2_ACCESS_KEY_ID ||
  process.env.VITE_R2_ACCESS_KEY_ID ||
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
  "";

export const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ||
  process.env.VITE_R2_SECRET_ACCESS_KEY ||
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
  "";

export const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
export const R2_REGION = "auto";

function sha256(str, encoding = "hex") {
  return crypto.createHash("sha256").update(str).digest(encoding);
}

function hmac(key, str, encoding) {
  const h = crypto.createHmac("sha256", key).update(str);
  return encoding ? h.digest(encoding) : h.digest();
}

function getSigningKey(secretKey, dateStamp, region = R2_REGION, service = "s3") {
  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  return kSigning;
}

/**
 * Generate AWS SigV4 signed headers for direct S3 / R2 API requests (e.g. PUT, GET, DELETE)
 */
export function signR2Request({
  method = "GET",
  key,
  bucket = R2_BUCKET_NAME,
  payload = Buffer.alloc(0),
  contentType = "application/octet-stream",
  customHeaders = {},
}) {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = sha256(payload);

  // Encode each segment of URI properly
  const cleanKey = key.replace(/^\/+/, "");
  const canonicalUri = `/${encodeURIComponent(bucket)}/${cleanKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  const headersToSign = {
    "content-type": contentType,
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...customHeaders,
  };

  const sortedHeaderKeys = Object.keys(headersToSign).sort();
  const canonicalHeaders =
    sortedHeaderKeys.map((k) => `${k.toLowerCase()}:${headersToSign[k].trim()}\n`).join("");
  const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(";");

  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    "", // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${R2_REGION}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(R2_SECRET_ACCESS_KEY, dateStamp, R2_REGION, "s3");
  const signature = hmac(signingKey, stringToSign, "hex");

  const authHeader = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `${R2_ENDPOINT}${canonicalUri}`,
    headers: {
      Host: host,
      "Content-Type": contentType,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authHeader,
      ...customHeaders,
    },
  };
}

/**
 * Generate a secure time-limited Presigned GET URL for private R2 objects (default: 3600s / 1 hour)
 */
export function getR2PresignedGetUrl(key, bucket = R2_BUCKET_NAME, expiresIn = 3600) {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    // If keys not set, fallback to direct endpoint URL
    return `${R2_ENDPOINT}/${bucket}/${key.replace(/^\/+/, "")}`;
  }

  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const cleanKey = key.replace(/^\/+/, "");
  const canonicalUri = `/${encodeURIComponent(bucket)}/${cleanKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  const credentialScope = `${dateStamp}/${R2_REGION}/s3/aws4_request`;

  const queryParams = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${R2_ACCESS_KEY_ID}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  };

  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join("&");

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(R2_SECRET_ACCESS_KEY, dateStamp, R2_REGION, "s3");
  const signature = hmac(signingKey, stringToSign, "hex");

  return `${R2_ENDPOINT}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Upload a Buffer or Base64 file directly to Cloudflare R2
 */
export async function uploadToR2({
  key,
  buffer,
  contentType = "image/png",
  bucket = R2_BUCKET_NAME,
  metadata = {},
}) {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY environment variables must be configured to upload to Cloudflare R2."
    );
  }

  const customHeaders = {};
  for (const [mKey, mVal] of Object.entries(metadata)) {
    customHeaders[`x-amz-meta-${mKey.toLowerCase()}`] = String(mVal);
  }

  const signed = signR2Request({
    method: "PUT",
    key,
    bucket,
    payload: buffer,
    contentType,
    customHeaders,
  });

  const res = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body: buffer,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudflare R2 PUT failed with status ${res.status}: ${errorText}`);
  }

  // Generate private signed GET URL
  const signedUrl = getR2PresignedGetUrl(key, bucket, 3600);

  return {
    success: true,
    key,
    bucket,
    url: signedUrl,
    size: buffer.length,
    contentType,
  };
}
