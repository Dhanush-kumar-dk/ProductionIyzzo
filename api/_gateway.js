/**
 * Unified Serverless API Gateway Middleware for Vercel
 *
 * Centralizes:
 * 1. CORS & Security headers
 * 2. Request correlation ID & timing (X-Request-Id, X-Response-Time)
 * 3. Rate limiting (using _ratelimit.js)
 * 4. Auth & Admin Key enforcement (requireAdmin / requireAuth)
 * 5. Method enforcement
 * 6. Structured JSON error logging & safe 500 error envelopes
 */

import crypto from "crypto";
import { applyRateLimit, getClientIp } from "./_ratelimit.js";

export function withGateway(handler, options = {}) {
  const {
    allowedMethods = ["GET", "POST", "OPTIONS"],
    rateLimit = null, // e.g. { limit: 20, windowMs: 60000, keyPrefix: 'api' }
    requireAdmin = false,
    requireAuth = false,
    name = "api-route",
  } = options;

  return async function (req, res) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ip = getClientIp(req);

    // Standard CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "));
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, apikey, x-admin-key, X-CSRF-Token, X-Requested-With, Accept"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Request-Id", requestId);

    // Express-like compatibility wrapper for Vercel functions
    if (typeof res.status !== "function") {
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
    }
    if (typeof res.json !== "function") {
      res.json = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };
    }

    // 1. Handle HTTP OPTIONS preflight
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // 2. Validate Allowed HTTP Methods
    if (!allowedMethods.includes(req.method)) {
      res.setHeader("Allow", allowedMethods.join(", "));
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed. Allowed: ${allowedMethods.join(", ")}`,
        requestId,
      });
    }

    // 3. Apply Centralized Rate Limiting if specified
    if (rateLimit) {
      const allowed = await applyRateLimit(req, res, {
        limit: rateLimit.limit || 30,
        windowMs: rateLimit.windowMs || 60000,
        keyPrefix: rateLimit.keyPrefix || name,
      });
      if (!allowed) {
        console.warn(`[Gateway:RateLimit] IP ${ip} exceeded limit on ${name}`);
        return;
      }
    }

    // 4. Enforce Admin API Key for sensitive ingestion/sync endpoints
    if (requireAdmin) {
      const authHeader = req.headers["authorization"] || "";
      const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
      const customKey = req.headers["x-admin-key"] || req.query?.adminKey;
      const providedKey = bearerToken || customKey;

      const expectedAdminKey =
        process.env.ADMIN_API_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (expectedAdminKey) {
        if (!providedKey || providedKey !== expectedAdminKey) {
          console.warn(`[Gateway:Auth] Unauthorized admin access attempt from IP ${ip} on ${name}`);
          return res.status(401).json({
            success: false,
            error: "Unauthorized. Valid admin API key or Bearer token is required.",
            requestId,
          });
        }
      } else {
        // Log warning if ADMIN_API_KEY is not yet set in production
        if (process.env.NODE_ENV === "production") {
          console.warn(`[Gateway:Auth] Warning: ADMIN_API_KEY is not set for protected route ${name}!`);
        }
      }
    }

    // 5. Enforce User Authorization Header
    if (requireAuth) {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized. Missing Authorization header.",
          requestId,
        });
      }
    }

    // 6. Execute Handler with timing and unified error boundary
    try {
      await handler(req, res);
      const duration = Date.now() - startTime;
      res.setHeader("X-Response-Time-Ms", String(duration));
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`[Gateway:Error] Uncaught exception in ${name} (${duration}ms) [${requestId}]:`, err);

      if (!res.headersSent) {
        res.setHeader("X-Response-Time-Ms", String(duration));
        res.status(500).json({
          success: false,
          error: "An internal server error occurred.",
          requestId,
        });
      }
    }
  };
}
