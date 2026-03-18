const inviteCache = new Map();
const CACHE_MS = 1000 * 60 * 5;

export function extractInviteCode(value = "") {
  const input = String(value || "").trim();
  if (!input) return "";
  const match = input.match(/(?:discord\.gg\/|discord\.com\/invite\/)([A-Za-z0-9-]+)/i);
  return match?.[1] || "";
}

export function getInviteValidation(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return { state: "empty", message: "Brak invite. Statystyki społeczności nie będą widoczne." };
  const code = extractInviteCode(trimmed);
  if (!code) {
    return {
      state: "invalid",
      message: "Link musi wyglądać jak https://discord.gg/... albo https://discord.com/invite/...",
    };
  }
  return {
    state: "valid",
    message: "Invite wygląda poprawnie. Po zapisie pobierzemy liczby online i wszystkich członków.",
    code,
  };
}

export async function fetchInviteStats(inviteUrl = "") {
  const code = extractInviteCode(inviteUrl);
  if (!code) {
    return {
      communityOnline: null,
      communityTotal: null,
      communityStatus: "missing",
    };
  }

  const cached = inviteCache.get(code);
  if (cached && Date.now() - cached.time < CACHE_MS) {
    return cached.value;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const value = {
        communityOnline: null,
        communityTotal: null,
        communityStatus: response.status === 404 ? "invalid" : "error",
      };
      inviteCache.set(code, { time: Date.now(), value });
      return value;
    }

    const data = await response.json();
    const value = {
      communityOnline: Number.isFinite(data.approximate_presence_count)
        ? data.approximate_presence_count
        : null,
      communityTotal: Number.isFinite(data.approximate_member_count)
        ? data.approximate_member_count
        : null,
      communityStatus:
        Number.isFinite(data.approximate_presence_count) || Number.isFinite(data.approximate_member_count)
          ? "available"
          : "missing",
    };

    inviteCache.set(code, { time: Date.now(), value });
    return value;
  } catch {
    const value = {
      communityOnline: null,
      communityTotal: null,
      communityStatus: "error",
    };
    inviteCache.set(code, { time: Date.now(), value });
    return value;
  }
}

export async function attachInviteStats(server) {
  const stats = await fetchInviteStats(server?.inviteUrl || "");
  return {
    ...server,
    ...stats,
  };
}

export async function attachInviteStatsToServers(servers = []) {
  return Promise.all((servers || []).map((server) => attachInviteStats(server)));
}
