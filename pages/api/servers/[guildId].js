import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { normalizeServer, slugify } from "../../../lib/storage";

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

function isValidInviteUrl(value) {
  if (!value) return true;
  return /^https:\/\/(discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]+$/i.test(value);
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({ error: "Brak sesji Discord" });
  }

  const { guildId } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const discordRes = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });

    if (!discordRes.ok) {
      return res.status(discordRes.status).json({
        error: "Nie udało się zweryfikować serwerów użytkownika"
      });
    }

    const guilds = await discordRes.json();
    const targetGuild = Array.isArray(guilds)
      ? guilds.find((guild) => guild.id === guildId && canManageGuild(guild))
      : null;

    if (!targetGuild) {
      return res.status(403).json({
        error: "Ten serwer nie należy do listy owner/manage server zalogowanego użytkownika"
      });
    }

    const body = req.body || {};
    const description = String(body.description || "").trim().slice(0, 1000);
    const tags = String(body.tags || "")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10);
    const inviteUrl = String(body.inviteUrl || "").trim();

    if (!isValidInviteUrl(inviteUrl)) {
      return res.status(400).json({
        error: "Invite URL musi wyglądać jak https://discord.gg/... albo https://discord.com/invite/..."
      });
    }

    const existing = await prisma.server.findUnique({ where: { id: guildId } });
    const safeSlug = `${slugify(targetGuild.name)}-${guildId}`;

    const row = await prisma.server.upsert({
      where: { id: guildId },
      create: {
        id: guildId,
        name: targetGuild.name,
        slug: safeSlug,
        icon: targetGuild.icon,
        description,
        tags: JSON.stringify(tags),
        inviteUrl,
        ownerDiscordId: session.user?.id || null,
        permissionLabel: getPermissionLabel(targetGuild),
        moderationStatus: existing?.moderationStatus || "pending",
        moderationNote: existing?.moderationNote || "",
        botInstalled: Boolean(existing?.botInstalled)
      },
      update: {
        name: targetGuild.name,
        slug: safeSlug,
        icon: targetGuild.icon,
        description,
        tags: JSON.stringify(tags),
        inviteUrl,
        ownerDiscordId: session.user?.id || null,
        permissionLabel: getPermissionLabel(targetGuild)
      }
    });

    return res.status(200).json(normalizeServer(row));
  } catch (error) {
    console.error("PUT /api/servers/[guildId] error:", error);
    return res.status(500).json({ error: "Błąd zapisu serwera" });
  }
}
