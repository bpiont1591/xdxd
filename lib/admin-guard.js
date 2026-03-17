export const MODERATOR_DISCORD_ID = "1418289596457812088";

export function isModeratorDiscordUser(session) {
  return Boolean(session?.user?.id) && String(session.user.id) === MODERATOR_DISCORD_ID;
}
