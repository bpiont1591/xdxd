function getModeratorIds() {
  const raw = process.env.MODERATOR_DISCORD_IDS || process.env.ADMIN_DISCORD_IDS || "1418289596457812088";
  return new Set(
    String(raw)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

export function isModeratorDiscordUser(session) {
  const userId = String(session?.user?.id || "").trim();
  if (!userId) return false;
  return getModeratorIds().has(userId);
}
