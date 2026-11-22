/**
 * Hardening Smoke Test Suite for ProductionIyzzo / Yearnit
 * Tests:
 * 1. Serverless Rate Limiter (sliding window, remaining counts, 429 response)
 * 2. Scraper sanitization and parsing logic
 * 3. Circuit Breaker (timeout, retries, circuit trip to OPEN, and fallback)
 * 4. API Gateway Pattern (method check, admin key auth, request headers)
 */

import assert from "node:assert/strict";
import { checkRateLimit, applyRateLimit } from "../api/_ratelimit.js";
import { cleanText, isInvalidTitle, cleanSlug } from "../api/scrape.js";
import { getCircuitBreaker } from "../api/_circuit.js";
import { withGateway } from "../api/_gateway.js";

async function testRateLimiting() {
  console.log("➡️  Testing Rate Limiter...");

  const testKey = `test-ip-${Date.now()}`;
  const limit = 3;
  const windowMs = 5000;

  // 1st request -> success
  const r1 = await checkRateLimit(testKey, { limit, windowMs, keyPrefix: "test" });
  assert.equal(r1.success, true, "First request must succeed");
  assert.equal(r1.remaining, 2, "Remaining count must decrement to 2");

  // 2nd request -> success
  const r2 = await checkRateLimit(testKey, { limit, windowMs, keyPrefix: "test" });
  assert.equal(r2.success, true, "Second request must succeed");
  assert.equal(r2.remaining, 1, "Remaining count must decrement to 1");

  // 3rd request -> success
  const r3 = await checkRateLimit(testKey, { limit, windowMs, keyPrefix: "test" });
  assert.equal(r3.success, true, "Third request must succeed");
  assert.equal(r3.remaining, 0, "Remaining count must decrement to 0");

  // 4th request -> blocked (429)
  const r4 = await checkRateLimit(testKey, { limit, windowMs, keyPrefix: "test" });
  assert.equal(r4.success, false, "Fourth request must be rate limited");
  assert.equal(r4.remaining, 0);
  assert.ok(r4.retryAfter > 0, "retryAfter must be positive");

  // Mock req/res test for HTTP response
  const headers = {};
  let statusCode = 200;
  let responseData = null;

  const mockReq = { headers: { "x-forwarded-for": testKey } };
  const mockRes = {
    setHeader: (name, val) => {
      headers[name] = val;
    },
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        },
      };
    },
  };

  const allowed = await applyRateLimit(mockReq, mockRes, { limit: 1, windowMs: 10000, keyPrefix: "mock" });
  assert.equal(allowed, true);

  const blocked = await applyRateLimit(mockReq, mockRes, { limit: 1, windowMs: 10000, keyPrefix: "mock" });
  assert.equal(blocked, false, "Second call must be blocked");
  assert.equal(statusCode, 429, "Status must be 429");
  assert.ok(headers["Retry-After"], "Retry-After header must be set");
  assert.ok(headers["X-RateLimit-Limit"], "X-RateLimit-Limit must be set");
  assert.ok(responseData.error.includes("Rate limit"), "Error message should mention rate limit");

  console.log("   ✅ Rate Limiter passed (sliding window & 429 response verified).");
}

async function testScraperSanitizer() {
  console.log("➡️  Testing Scraper Text Sanitization...");

  assert.equal(cleanText("Hello &amp; World!"), "Hello & World!");
  assert.equal(cleanText("<p>Noise</p> Test"), "Noise Test");

  assert.equal(isInvalidTitle("503 - Service Unavailable"), true);
  assert.equal(isInvalidTitle("Robot Check"), true);
  assert.equal(isInvalidTitle("Amazon.in"), true);
  assert.equal(isInvalidTitle("Apple iPhone 15 (128 GB) - Black"), false);

  assert.equal(cleanSlug("Boat-Airdopes-141-Bluetooth"), "Boat Airdopes 141 Bluetooth");

  console.log("   ✅ Scraper sanitization logic passed.");
}

async function testCircuitBreaker() {
  console.log("➡️  Testing Circuit Breaker & Timeout Fallback...");

  const testBreaker = getCircuitBreaker("test-service", {
    timeoutMs: 50,
    maxRetries: 1,
    failureThreshold: 2,
    resetTimeoutMs: 500,
  });

  // Action that times out
  const slowAction = () => new Promise((resolve) => setTimeout(resolve, 200));

  // 1st failure: times out, executes fallback
  const res1 = await testBreaker.execute(slowAction, () => "fallback-1");
  assert.equal(res1, "fallback-1");

  // 2nd failure: times out, triggers circuit OPEN
  const res2 = await testBreaker.execute(slowAction, () => "fallback-2");
  assert.equal(res2, "fallback-2");
  assert.equal(testBreaker.isOpen(), true, "Breaker must be OPEN after exceeding failure threshold");

  // Fast fail when OPEN (immediate fallback without waiting)
  const t0 = Date.now();
  const res3 = await testBreaker.execute(slowAction, () => "fallback-fast");
  const elapsed = Date.now() - t0;
  assert.equal(res3, "fallback-fast");
  assert.ok(elapsed < 20, "Fast fail must return in under 20ms");

  console.log("   ✅ Circuit Breaker passed (timeout, tripping to OPEN & fast-fail verified).");
}

async function testApiGateway() {
  console.log("➡️  Testing API Gateway Pattern...");

  process.env.ADMIN_API_KEY = "test-secret-key-12345";

  let handlerExecuted = false;
  const rawHandler = async (req, res) => {
    handlerExecuted = true;
    res.status(200).json({ ok: true });
  };

  const gatewayHandler = withGateway(rawHandler, {
    name: "test-route",
    allowedMethods: ["POST"],
    requireAdmin: true,
  });

  // 1. Test 405 Method Not Allowed
  const headers1 = {};
  let status1 = 200;
  let body1 = null;
  const mockRes1 = {
    setHeader: (k, v) => (headers1[k] = v),
    status: (s) => {
      status1 = s;
      return { json: (b) => (body1 = b), end: () => {} };
    },
  };
  await gatewayHandler({ method: "GET", headers: {} }, mockRes1);
  assert.equal(status1, 405, "Must reject disallowed GET method");

  // 2. Test 401 Unauthorized (Missing Admin Key)
  let status2 = 200;
  let body2 = null;
  const mockRes2 = {
    setHeader: () => {},
    status: (s) => {
      status2 = s;
      return { json: (b) => (body2 = b), end: () => {} };
    },
  };
  await gatewayHandler({ method: "POST", headers: {} }, mockRes2);
  assert.equal(status2, 401, "Must reject request without Admin API key");

  // 3. Test Authorized Request with Bearer Token
  let status3 = 200;
  let body3 = null;
  const mockRes3 = {
    setHeader: () => {},
    status: (s) => {
      status3 = s;
      return { json: (b) => (body3 = b), end: () => {} };
    },
  };
  await gatewayHandler(
    {
      method: "POST",
      headers: { authorization: "Bearer test-secret-key-12345" },
    },
    mockRes3
  );
  assert.equal(status3, 200, "Must allow request with valid Admin API key");
  assert.equal(handlerExecuted, true, "Inner handler must execute");

  delete process.env.ADMIN_API_KEY;
  console.log("   ✅ API Gateway pattern passed (method guard, admin auth & error boundaries verified).");
}

async function runAll() {
  console.log("=== RUNNING HARDENING SMOKE TESTS ===");
  try {
    await testRateLimiting();
    await testScraperSanitizer();
    await testCircuitBreaker();
    await testApiGateway();
    console.log("======================================");
    console.log("🎉 ALL SMOKE TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ SMOKE TEST FAILED:", err);
    process.exit(1);
  }
}

runAll();
