import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { normalizeServer, slugify, upsertJsonServer, getJsonServerById } from "../../../lib/storage";

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
  res.setHeader("Cache-Control", "no-store");
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({ error: "Brak sesji Discord. Zaloguj się ponownie." });
  }

  const { guildId } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const discordRes = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });

    let guilds = null;
    try {
      guilds = await discordRes.json();
    } catch {
      guilds = null;
    }

    if (!discordRes.ok) {
      const isAuthProblem = discordRes.status === 401 || discordRes.status === 403;
      return res.status(discordRes.status).json({
        error: isAuthProblem
          ? "Discord API error: sesja wygasła albo scope guilds nie działa. Wyloguj się i zaloguj ponownie."
          : "Nie udało się zweryfikować serwerów użytkownika",
        debug: guilds
      });
    }

    const targetGuild = Array.isArray(guilds)
      ? guilds.find((guild) => guild.id === guildId && canManageGuild(guild))
      : null;

    if (!targetGuild) {
      return res.status(403).json({
        error: "Ten serwer nie należy do listy owner/manage server zalogowanego użytkownika"
      });
    }

    const body = req.body || {};
    const description = String(body.description || "").trim().slice(0, 250);
    const rawTags = Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(",");
    const tags = rawTags
      .map((tag) => String(tag || "").trim().toLowerCase().replace(/^#+/, "").replace(/\s+/g, "-"))
      .filter(Boolean)
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 5);
    const inviteUrl = String(body.inviteUrl || "").trim();

    if (!isValidInviteUrl(inviteUrl)) {
      return res.status(400).json({
        error: "Invite URL musi wyglądać jak https://discord.gg/... albo https://discord.com/invite/..."
      });
    }

    let existing = null;
    try {
      existing = await prisma.server.findUnique({ where: { id: guildId } });
    } catch (error) {
      console.error("Prisma findUnique failed in PUT /api/servers/[guildId]:", error);
      existing = await getJsonServerById(guildId);
    }

    const safeSlug = `${slugify(targetGuild.name)}-${guildId}`;

    try {
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
      console.error("Prisma upsert failed in PUT /api/servers/[guildId], fallback JSON:", error);

      const row = await upsertJsonServer({
        id: guildId,
        name: targetGuild.name,
        slug: safeSlug,
        icon: targetGuild.icon,
        description,
        tags,
        inviteUrl,
        ownerDiscordId: session.user?.id || null,
        permissionLabel: getPermissionLabel(targetGuild),
        moderationStatus: existing?.moderationStatus || "pending",
        moderationNote: existing?.moderationNote || "",
        botInstalled: Boolean(existing?.botInstalled)
      });

      return res.status(200).json({
        ...row,
        savedInFallbackJson: true
      });
    }
  } catch (error) {
    console.error("PUT /api/servers/[guildId] error:", error);
    return res.status(500).json({
      error: "Błąd zapisu serwera",
      debug: String(error?.message || error)
    });
  }
}
