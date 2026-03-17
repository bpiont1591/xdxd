const globalStore = global.__discordboardRateLimitStore || new Map();
if (!global.__discordboardRateLimitStore) {
  global.__discordboardRateLimitStore = globalStore;
}

function now() {
  return Date.now();
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export function checkRateLimit(key, limit, windowMs) {
  const current = now();
  const entry = globalStore.get(key);

  if (!entry || current > entry.resetAt) {
    const fresh = {
      count: 1,
      resetAt: current + windowMs
    };
    globalStore.set(key, fresh);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: fresh.resetAt
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: False,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count += 1;
  globalStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt
  };
}
