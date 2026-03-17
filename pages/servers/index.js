import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const MANAGE_GUILD = 32n;

function canManageGuild(guild) {
  try {
    const permissions = BigInt(guild.permissions ?? "0");
    return guild.owner || (permissions & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return Boolean(guild.owner);
  }
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({
      error: "Brak sesji Discord"
    });
  }

  try {
    const discordRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });

    const guilds = await discordRes.json();

    if (!discordRes.ok) {
      return res.status(discordRes.status).json({
        error: "Discord API error",
        debug: guilds
      });
    }

    const manageableGuilds = guilds.filter(canManageGuild);

    return res.status(200).json(manageableGuilds);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Błąd pobierania serwerów"
    });
  }
}