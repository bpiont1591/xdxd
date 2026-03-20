export function getServerAchievements(server, options = {}) {
  const onlineCount = Number(server?.onlineCount || 0);
  const bumpCount = Number(server?.bumpCount || 0);
  const badges = [];

  if (bumpCount >= 1) {
    badges.push({ key: 'first-bump', label: 'Pierwszy bump', tone: 'ok' });
  }

  if (bumpCount >= 100) {
    badges.push({ key: 'hundred-bumps', label: '100 bumpów', tone: 'ok' });
  }

  if (options.isTopTen) {
    badges.push({ key: 'top-10-week', label: 'Top 10 tygodnia', tone: 'warn' });
  }

  if (server?.moderationStatus === 'approved') {
    badges.push({ key: 'verified', label: 'Zweryfikowany', tone: 'ok' });
  }

  if (onlineCount >= 50) {
    badges.push({ key: 'active-community', label: 'Aktywna społeczność', tone: 'ok' });
  }

  return badges;
}
