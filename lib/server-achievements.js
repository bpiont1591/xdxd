const DAY_MS = 24 * 60 * 60 * 1000;

function toTimestamp(value) {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function isWithinDays(value, days) {
  const ts = toTimestamp(value);
  if (!ts) return false;
  return Date.now() - ts <= days * DAY_MS;
}

export function getServerAchievements(server, options = {}) {
  const onlineCount = Number(server?.onlineCount || 0);
  const memberCount = Number(server?.memberCount || 0);
  const bumpCount = Number(server?.bumpCount || 0);
  const favoriteCount = Number(server?.favoriteCount || 0);
  const reportCount = Number(server?.reportCount || 0);
  const badges = [];

  if (isWithinDays(server?.createdAt, 2)) {
    badges.push({ key: 'new-server', label: '🆕 Nowy serwer', tone: 'info' });
  }

  if (isWithinDays(server?.lastBumpAt, 1)) {
    badges.push({ key: 'fresh-bump', label: '⚡ Aktywny dziś', tone: 'ok' });
  }

  if (favoriteCount >= 10) {
    badges.push({ key: 'community-favorite', label: '⭐ Ulubieniec', tone: 'warn' });
  }

  if (bumpCount >= 250) {
    badges.push({ key: 'bump-legend', label: '👑 Legenda bumpów', tone: 'warn' });
  } else if (bumpCount >= 100) {
    badges.push({ key: 'hundred-bumps', label: '🔥 100+ bumpów', tone: 'ok' });
  } else if (bumpCount >= 1) {
    badges.push({ key: 'first-bump', label: '🚀 Pierwszy bump', tone: 'ok' });
  }

  if (options.isTopTen) {
    badges.push({ key: 'top-10-week', label: '🏆 Top 10', tone: 'warn' });
  }

  if (server?.moderationStatus === 'approved') {
    badges.push({ key: 'verified', label: '✔ Zweryfikowany', tone: 'ok' });
  }

  if (onlineCount >= 50 || memberCount >= 300) {
    badges.push({ key: 'active-community', label: '💬 Aktywna społeczność', tone: 'info' });
  }

  if (reportCount >= 5) {
    badges.push({ key: 'watched', label: '👀 Pod obserwacją', tone: 'danger' });
  }

  return badges.slice(0, 5);
}
