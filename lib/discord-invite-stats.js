const DISCORD_API_BASE = "https://discord.com/api/v10";

export function extractInviteCode(inviteUrl = "") {
  const value = String(inviteUrl || "").trim();
  if (!value) return null;

  const match = value.match(/discord(?:\.gg|\.com\/invite)\/([A-Za-z0-9-]+)/i);
  return match?.[1] || null;
}

export async function fetchInviteStats(inviteUrl) {
  const code = extractInviteCode(inviteUrl);
  if (!code) {
    return { onlineCount: null, memberCount: null };
  }

  try {
    const res = await fetch(`${DISCORD_API_BASE}/invites/${code}?with_counts=true&with_expiration=true`, {
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return { onlineCount: null, memberCount: null };
    }

    const data = await res.json();

    return {
      onlineCount: Number.isFinite(data?.approximate_presence_count)
        ? data.approximate_presence_count
        : null,
      memberCount: Number.isFinite(data?.approximate_member_count)
        ? data.approximate_member_count
        : null
    };
  } catch {
    return { onlineCount: null, memberCount: null };
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
