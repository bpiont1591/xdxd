import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";

const MANAGE_GUILD = 32n;
const DISCORD_API_BASE = "https://discord.com/api/v10";

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

async function checkBotInstalledLive(guildId) {
  const botToken = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;
  const botClientId =
    process.env.DISCORD_BOT_CLIENT_ID ||
    process.env.CLIENT_ID ||
    process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  if (!botToken || !botClientId) {
    return {
      installed: false,
      source: "discord-live",
      error: "Brak DISCORD_BOT_TOKEN/BOT_TOKEN albo DISCORD_BOT_CLIENT_ID/CLIENT_ID w env"
    };
  }

  try {
    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${botClientId}`, {
      headers: {
        Authorization: `Bot ${botToken}`
      }
    });

    if (response.status === 404) {
      return { installed: false, source: "discord-live", error: null };
    }

    if (response.ok) {
      return { installed: true, source: "discord-live", error: null };
    }

    const rawText = await response.text();
    return {
      installed: false,
      source: "discord-live",
      error: `Discord API ${response.status}: ${rawText || "unknown error"}`
    };
  } catch (error) {
    return {
      installed: false,
      source: "discord-live",
      error: error?.message || "Nie udało się sprawdzić statusu bota"
    };
  }
}

async function readSavedRows(guildIds) {
  if (!guildIds.length) return [];
  try {
    return await prisma.server.findMany({
      where: {
        id: { in: guildIds }
      }
    });
  } catch (error) {
    console.error("DB fallback in GET /api/servers:", error);
    return [];
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
    const discordRes = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
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

    const manageableGuilds = Array.isArray(guilds) ? guilds.filter(canManageGuild) : [];
    const guildIds = manageableGuilds.map((guild) => guild.id);

    const savedRows = await readSavedRows(guildIds);
    const savedMap = new Map(savedRows.map((row) => [row.id, normalizeServer(row)]));

    const liveBotStatuses = await Promise.all(
      manageableGuilds.map(async (guild) => {
        const status = await checkBotInstalledLive(guild.id);
        return [guild.id, status];
      })
    );

    const botStatusMap = new Map(liveBotStatuses);

    const mergedGuilds = manageableGuilds.map((guild) => {
      const saved = savedMap.get(guild.id);
      const liveBotStatus = botStatusMap.get(guild.id) || {
        installed: false,
        source: "discord-live",
        error: "Brak wyniku sprawdzenia"
      };

      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
        permissionLabel: getPermissionLabel(guild),
        description: saved?.description || "",
        tags: saved?.tags || [],
        inviteUrl: saved?.inviteUrl || "",
        lastBumpAt: saved?.lastBumpAt || null,
        bumpCount: saved?.bumpCount || 0,
        botInstalled: Boolean(liveBotStatus.installed),
        botStatusSource: liveBotStatus.source,
        botStatusError: liveBotStatus.error,
        moderationStatus: saved?.moderationStatus || "pending",
        moderationNote: saved?.moderationNote || "",
        slug: saved?.slug || null,
        ownerDiscordId: saved?.ownerDiscordId || null,
        createdAt: saved?.createdAt || null,
        updatedAt: saved?.updatedAt || null
      };
    });

    return res.status(200).json(mergedGuilds);
  } catch (error) {
    console.error("GET /api/servers error:", error);
    return res.status(500).json({
      error: "Błąd pobierania serwerów",
      debug: String(error?.message || error)
    });
  }
}
