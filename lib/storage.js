import fs from "fs/promises";
import path from "path";
import { prisma } from "./prisma";

export const BUMP_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const JSON_DB_PATH = path.join(process.cwd(), "data", "servers.json");

export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseServerMeta(value) {
  if (Array.isArray(value)) {
    return { tags: value, listingType: "public" };
  }

  try {
    const parsed = JSON.parse(value || "[]");
    if (Array.isArray(parsed)) {
      return { tags: parsed, listingType: "public" };
    }
    if (parsed && typeof parsed === "object") {
      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        listingType: parsed.listingType === "nsfw" ? "nsfw" : "public"
      };
    }
  } catch {}

  return { tags: [], listingType: "public" };
}

export function parseTags(value) {
  return parseServerMeta(value).tags;
}

export function serializeServerMeta(tags = [], listingType = "public") {
  return JSON.stringify({
    tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
    listingType: listingType === "nsfw" ? "nsfw" : "public"
  });
}

export function normalizeServer(server) {
  const meta = parseServerMeta(server.tags);

  return {
    id: server.id,
    name: server.name || "Unknown Server",
    slug: server.slug || slugify(server.name || server.id),
    icon: server.icon || null,
    description: server.description || "",
    tags: meta.tags,
    inviteUrl: server.inviteUrl || "",
    lastBumpAt: server.lastBumpAt ? new Date(server.lastBumpAt).toISOString() : null,
    bumpCount: Number(server.bumpCount || 0),
    botInstalled: Boolean(server.botInstalled),
    moderationStatus: server.moderationStatus || "pending",
    moderationNote: server.moderationNote || "",
    ownerDiscordId: server.ownerDiscordId || null,
    permissionLabel: server.permissionLabel || "Owner",
    listingType: meta.listingType,
    createdAt: server.createdAt ? new Date(server.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: server.updatedAt ? new Date(server.updatedAt).toISOString() : new Date().toISOString()
  };
}

async function readJsonDatabase() {
  try {
    const raw = await fs.readFile(JSON_DB_PATH, "utf8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonDatabase(rows) {
  await fs.mkdir(path.dirname(JSON_DB_PATH), { recursive: true });
  await fs.writeFile(JSON_DB_PATH, JSON.stringify(rows, null, 2), "utf8");
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

export async function getJsonServerById(id) {
  const rows = await readJsonDatabase();
  const row = rows.find((item) => item.id === id || item.slug === id);
  return row ? normalizeServer(row) : null;
}

export async function upsertJsonServer(server) {
  const rows = await readJsonDatabase();
  const now = new Date().toISOString();
  const rawRow = {
    ...server,
    slug: server.slug || slugify(server.name),
    tags: serializeServerMeta(server.tags, server.listingType),
    createdAt: server.createdAt || now,
    updatedAt: now
  };

  const index = rows.findIndex((item) => item.id === rawRow.id);
  if (index >= 0) {
    rows[index] = { ...rows[index], ...rawRow };
  } else {
    rows.push(rawRow);
  }

  await writeJsonDatabase(rows);
  return normalizeServer(rawRow);
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
      tags: serializeServerMeta(server.tags, server.listingType),
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
      tags: serializeServerMeta(server.tags, server.listingType),
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
