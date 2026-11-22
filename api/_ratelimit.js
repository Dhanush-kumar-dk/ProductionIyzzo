/**
 * Zero-dependency Serverless Rate Limiter for Vercel
 * Supports:
 *  1. Distributed Upstash Redis (via UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL & KV_REST_API_TOKEN)
 *  2. In-memory sliding window fallback (works locally, preview branches, and when Upstash is not configured)
 *
 * Emits standard headers:
 *  - X-RateLimit-Limit
 *  - X-RateLimit-Remaining
 *  - X-RateLimit-Reset
 *  - Retry-After (on HTTP 429)
 */

// In-memory fallback cache
const memoryStore = new Map();
const MAX_MEMORY_KEYS = 5000;

function pruneMemoryStore() {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "127.0.0.1"
  );
}

/**
 * Check rate limit using Upstash Redis REST API
 */
async function checkUpstash(key, limit, windowSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  try {
    const pipelineUrl = `${url.replace(/\/$/, "")}/pipeline`;
    const res = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds, "NX"],
        ["TTL", key],
      ]),
    });

    if (!res.ok) return null;

    const results = await res.json();
    const count = Number(results[0]?.result || 1);
    const ttl = Number(results[2]?.result || windowSeconds);
    const resetTime = Date.now() + Math.max(ttl, 1) * 1000;

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetTime,
      retryAfter: Math.max(1, ttl),
    };
  } catch (err) {
    console.warn("[RateLimit] Upstash Redis check failed, falling back to memory:", err.message);
    return null;
  }
}

/**
 * Check rate limit using in-memory store
 */
function checkMemory(key, limit, windowMs) {
  if (memoryStore.size > MAX_MEMORY_KEYS) {
    pruneMemoryStore();
  }

  const now = Date.now();
  let record = memoryStore.get(key);

  if (!record || record.resetAt <= now) {
    record = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, record);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: record.resetAt,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  return {
    success: record.count <= limit,
    limit,
    remaining,
    resetTime: record.resetAt,
    retryAfter,
  };
}

/**
 * Core rate limit checker
 * @param {string} identifier - unique key (IP or user ID)
 * @param {object} options - { limit: number, windowMs: number, keyPrefix: string }
 */
export async function checkRateLimit(identifier, options = {}) {
  const limit = options.limit || 20;
  const windowMs = options.windowMs || 60 * 1000;
  const prefix = options.keyPrefix || "rl";
  const windowSeconds = Math.ceil(windowMs / 1000);
  const cacheKey = `${prefix}:${identifier}`;

  // Try Upstash first if configured
  const upstashResult = await checkUpstash(cacheKey, limit, windowSeconds);
  if (upstashResult) {
    return upstashResult;
  }

  // Fallback to in-memory sliding window
  return checkMemory(cacheKey, limit, windowMs);
}

/**
 * Helper to apply rate limiting in a Vercel Serverless Function
 * @returns {Promise<boolean>} true if allowed, false if rate limited (429 response sent)
 */
export async function applyRateLimit(req, res, options = {}) {
  const ip = getClientIp(req);
  const identifier = options.customKey || ip;
  const result = await checkRateLimit(identifier, options);

  // Set standard rate limit headers
  res.setHeader("X-RateLimit-Limit", String(result.limit));
  res.setHeader("X-RateLimit-Remaining", String(result.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)));

  if (!result.success) {
    res.setHeader("Retry-After", String(result.retryAfter));
    const responsePayload = {
      success: false,
      error: `Too many requests. Rate limit of ${result.limit} requests per minute exceeded. Please retry after ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    };

    if (typeof res.status === "function") {
      res.status(429).json(responsePayload);
    } else {
      res.statusCode = 429;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(responsePayload));
    }
    return false;
  }

  return true;
}
