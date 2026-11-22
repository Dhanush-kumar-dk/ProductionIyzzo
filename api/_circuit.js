/**
 * Zero-dependency Circuit Breaker & Resilient Fetch for Serverless
 *
 * Implements:
 * - Strict timeout abort signals
 * - Exponential backoff retries
 * - 3-state Circuit Breaker (CLOSED, OPEN, HALF_OPEN)
 * - Safe fallback execution (prevents 504 Gateway Timeouts)
 */

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
    this.timeoutMs = options.timeoutMs || 5000;
    this.maxRetries = options.maxRetries || 2;

    this.state = "CLOSED"; // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }

  isOpen() {
    if (this.state === "OPEN") {
      if (Date.now() >= this.nextAttempt) {
        this.state = "HALF_OPEN";
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
      console.warn(
        `[CircuitBreaker] Circuit '${this.name}' tripped to OPEN. Next retry at ${new Date(this.nextAttempt).toISOString()}`
      );
    }
  }

  /**
   * Execute an async action protected by this circuit breaker
   */
  async execute(action, fallback = null) {
    if (this.isOpen()) {
      console.warn(`[CircuitBreaker] Circuit '${this.name}' is OPEN. Fast-failing to fallback.`);
      if (typeof fallback === "function") return fallback();
      return fallback;
    }

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const timeoutPromise = new Promise((_, reject) => {
          if (controller.signal.aborted) {
            return reject(new Error(`Operation timed out after ${this.timeoutMs}ms`));
          }
          controller.signal.addEventListener("abort", () => {
            reject(new Error(`Operation timed out after ${this.timeoutMs}ms`));
          });
        });

        const result = await Promise.race([action(controller.signal), timeoutPromise]);
        clearTimeout(timer);
        this.recordSuccess();
        return result;
      } catch (err) {
        clearTimeout(timer);
        attempt++;
        const isLastAttempt = attempt > this.maxRetries;

        if (isLastAttempt) {
          this.recordFailure();
          console.error(
            `[CircuitBreaker] '${this.name}' failed after ${attempt} attempts: ${err.message}`
          );
          if (typeof fallback === "function") return fallback(err);
          if (fallback !== null) return fallback;
          throw err;
        }

        // Exponential backoff wait (100ms, 200ms, etc.)
        const backoffMs = Math.min(1000, 100 * Math.pow(2, attempt - 1));
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }
}

// Global registry of breakers
const breakerRegistry = new Map();

export function getCircuitBreaker(name, options = {}) {
  if (!breakerRegistry.has(name)) {
    breakerRegistry.set(name, new CircuitBreaker(name, options));
  }
  return breakerRegistry.get(name);
}

/**
 * Resilient fetch helper wrapped in a circuit breaker
 */
export async function resilientFetch(url, fetchOptions = {}, breakerOptions = {}) {
  const serviceName = breakerOptions.name || new URL(url).hostname;
  const breaker = getCircuitBreaker(serviceName, breakerOptions);

  return breaker.execute(async (signal) => {
    const combinedSignal = fetchOptions.signal
      ? AbortSignal.any([fetchOptions.signal, signal])
      : signal;

    const res = await fetch(url, {
      ...fetchOptions,
      signal: combinedSignal,
    });

    if (res.status >= 500 && res.status !== 503) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    return res;
  }, breakerOptions.fallback);
}
