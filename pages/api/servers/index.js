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

function getPermissionLabel(guild) {
  if (guild.owner) return "Owner";
  if (canManageGuild(guild)) return "Manage Server";
  return "Brak dostępu";
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

    const manageableGuilds = guilds
      .filter(canManageGuild)
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
        permissionLabel: getPermissionLabel(guild),
        description: "",
        tags: [],
        inviteUrl: "",
        lastBumpAt: null,
        bumpCount: 0,
        botInstalled: false,
        moderationStatus: "pending",
        moderationNote: ""
      }));

    return res.status(200).json(manageableGuilds);
  } catch (error) {
    console.error("GET /api/servers error:", error);
    return res.status(500).json({
      error: "Błąd pobierania serwerów",
      debug: String(error?.message || error)
    });
  }
}