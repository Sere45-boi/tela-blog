type RateLimitInfo = {
  count: number;
  resetAt: number;
};

// In-memory store for rate limiting. Note: In a serverless environment like Vercel,
// this will reset on cold starts. For true distributed rate limiting, consider Upstash/Redis.
const store = new Map<string, RateLimitInfo>();

export function rateLimit(identifier: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetIn: record.resetAt - now };
  }

  record.count += 1;
  store.set(identifier, record);
  return { success: true, remaining: limit - record.count };
}
