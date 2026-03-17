import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";

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
    return res.status(401).json({ error: "Brak sesji Discord" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const discordRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });

    if (!discordRes.ok) {
      return res.status(discordRes.status).json({
        error: "Nie udało się pobrać serwerów z Discord API"
      });
    }

    const guilds = await discordRes.json();
    const manageableGuilds = guilds.filter(canManageGuild);
    const saved = await prisma.server.findMany();
    const mapped = saved.map(normalizeServer);

    const merged = manageableGuilds.map((guild) => {
      const existing = mapped.find((entry) => entry.id === guild.id);
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        ownerDiscordId: session.user?.id || null,
        permissionLabel: getPermissionLabel(guild),
        description: existing?.description || "",
        tags: existing?.tags || [],
        inviteUrl: existing?.inviteUrl || "",
        lastBumpAt: existing?.lastBumpAt || null,
        bumpCount: existing?.bumpCount || 0,
        botInstalled: existing?.botInstalled || false,
        moderationStatus: existing?.moderationStatus || "pending",
        moderationNote: existing?.moderationNote || ""
      };
    });

    return res.status(200).json(merged);
  } catch (error) {
    console.error("GET /api/servers error:", error);
    return res.status(500).json({ error: "Błąd pobierania serwerów" });
  }
}
