import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";
import { attachInviteStatsToServers } from "../../../lib/discord-invite";

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

    const manageableGuilds = guilds.filter(canManageGuild);
    const guildIds = manageableGuilds.map((guild) => guild.id);

    const savedRows = guildIds.length
      ? await prisma.server.findMany({
          where: {
            id: { in: guildIds }
          }
        })
      : [];

    const savedMap = new Map(savedRows.map((row) => [row.id, normalizeServer(row)]));

    const mergedGuilds = manageableGuilds.map((guild) => {
      const saved = savedMap.get(guild.id);

      return {
        id: guild.id,
        name: saved?.name || guild.name,
        icon: saved?.icon || guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
        permissionLabel: getPermissionLabel(guild),
        description: saved?.description || "",
        tags: saved?.tags || [],
        inviteUrl: saved?.inviteUrl || "",
        lastBumpAt: saved?.lastBumpAt || null,
        bumpCount: saved?.bumpCount || 0,
        botInstalled: Boolean(saved?.botInstalled),
        moderationStatus: saved?.moderationStatus || "pending",
        moderationNote: saved?.moderationNote || "",
        slug: saved?.slug || null,
        ownerDiscordId: saved?.ownerDiscordId || null,
        serverType: saved?.serverType || "public",
        createdAt: saved?.createdAt || null,
        updatedAt: saved?.updatedAt || null
      };
    });

    return res.status(200).json(await attachInviteStatsToServers(mergedGuilds));
  } catch (error) {
    console.error("GET /api/servers error:", error);
    return res.status(500).json({
      error: "Błąd pobierania serwerów",
      debug: String(error?.message || error)
    });
  }
}
