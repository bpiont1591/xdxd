const DISCORD_API_BASE = "https://discord.com/api/v10";
const INVITE_TTL_MS = 1000 * 60 * 5;
const inviteCache = global.__discordboardInviteStatsCache || new Map();

if (!global.__discordboardInviteStatsCache) {
  global.__discordboardInviteStatsCache = inviteCache;
}

export function extractInviteCode(inviteUrl = "") {
  const value = String(inviteUrl || "").trim();
  if (!value) return null;

  const match = value.match(/discord(?:\.gg|\.com\/invite)\/([A-Za-z0-9-]+)/i);
  return match?.[1] || null;
}

function getCachedInviteStats(code) {
  const entry = inviteCache.get(code);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    inviteCache.delete(code);
    return null;
  }
  return entry.value;
}

function setCachedInviteStats(code, value) {
  inviteCache.set(code, {
    value,
    expiresAt: Date.now() + INVITE_TTL_MS
  });
  return value;
}

export async function fetchInviteStats(inviteUrl) {
  const code = extractInviteCode(inviteUrl);
  if (!code) {
    return { onlineCount: null, memberCount: null };
  }

  const cached = getCachedInviteStats(code);
  if (cached) {
    return cached;
  }

  try {
    const res = await fetch(`${DISCORD_API_BASE}/invites/${code}?with_counts=true&with_expiration=true`, {
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return setCachedInviteStats(code, { onlineCount: null, memberCount: null });
    }

    const data = await res.json();

    return setCachedInviteStats(code, {
      onlineCount: Number.isFinite(data?.approximate_presence_count)
        ? data.approximate_presence_count
        : null,
      memberCount: Number.isFinite(data?.approximate_member_count)
        ? data.approximate_member_count
        : null
    });
  } catch {
    return setCachedInviteStats(code, { onlineCount: null, memberCount: null });
  }
}

export async function enrichServersWithInviteStats(servers = []) {
  return Promise.all(
    (servers || []).map(async (server) => ({
      ...server,
      ...(await fetchInviteStats(server?.inviteUrl))
    }))
  );
}
