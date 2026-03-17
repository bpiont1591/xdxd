import { prisma } from "./prisma";

export const BUMP_COOLDOWN_MS = 2 * 60 * 60 * 1000;

export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseTags(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

export function normalizeServer(server) {
  return {
    id: server.id,
    name: server.name || "Unknown Server",
    slug: server.slug || slugify(server.name || server.id),
    icon: server.icon || null,
    description: server.description || "",
    tags: parseTags(server.tags),
    inviteUrl: server.inviteUrl || "",
    lastBumpAt: server.lastBumpAt ? new Date(server.lastBumpAt).toISOString() : null,
    bumpCount: Number(server.bumpCount || 0),
    botInstalled: Boolean(server.botInstalled),
    moderationStatus: server.moderationStatus || "pending",
    moderationNote: server.moderationNote || "",
    ownerDiscordId: server.ownerDiscordId || null,
    permissionLabel: server.permissionLabel || "Owner",
    createdAt: server.createdAt ? new Date(server.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: server.updatedAt ? new Date(server.updatedAt).toISOString() : new Date().toISOString()
  };
}

export async function readSavedServers() {
  const rows = await prisma.server.findMany({
    orderBy: { updatedAt: "desc" }
  });
  return rows.map(normalizeServer);
}

export async function getServerByIdOrSlug(id) {
  const row = await prisma.server.findFirst({
    where: {
      OR: [{ id }, { slug: id }]
    }
  });
  return row ? normalizeServer(row) : null;
}

export async function upsertServer(server) {
  const row = await prisma.server.upsert({
    where: { id: server.id },
    create: {
      id: server.id,
      name: server.name,
      slug: server.slug || slugify(server.name),
      icon: server.icon || null,
      description: server.description || "",
      tags: JSON.stringify(server.tags || []),
      inviteUrl: server.inviteUrl || "",
      lastBumpAt: server.lastBumpAt ? new Date(server.lastBumpAt) : null,
      bumpCount: Number(server.bumpCount || 0),
      botInstalled: Boolean(server.botInstalled),
      moderationStatus: server.moderationStatus || "pending",
      moderationNote: server.moderationNote || "",
      ownerDiscordId: server.ownerDiscordId || null,
      permissionLabel: server.permissionLabel || "Owner"
    },
    update: {
      name: server.name,
      slug: server.slug || slugify(server.name),
      icon: server.icon || null,
      description: server.description || "",
      tags: JSON.stringify(server.tags || []),
      inviteUrl: server.inviteUrl || "",
      lastBumpAt: server.lastBumpAt ? new Date(server.lastBumpAt) : null,
      bumpCount: Number(server.bumpCount || 0),
      botInstalled: Boolean(server.botInstalled),
      moderationStatus: server.moderationStatus || "pending",
      moderationNote: server.moderationNote || "",
      ownerDiscordId: server.ownerDiscordId || null,
      permissionLabel: server.permissionLabel || "Owner"
    }
  });

  return normalizeServer(row);
}
