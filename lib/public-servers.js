import { prisma } from "./prisma";
import { normalizeServer } from "./storage";
import { buildPublicServerMeta } from "./stats";
import { enrichServersWithInviteStats } from "./discord-invite-stats";

export function normalizeListQuery(raw = {}) {
  const query = String(raw.query || "").trim();
  const category = String(raw.category || "all").trim().toLowerCase() || "all";
  const sort = ["top", "favorites", "recent", "name"].includes(String(raw.sort || ""))
    ? String(raw.sort)
    : "top";
  const page = Math.max(1, Number.parseInt(String(raw.page || 1), 10) || 1);
  const limit = Math.max(1, Math.min(100, Number.parseInt(String(raw.limit || 20), 10) || 20));

  return { query, category, sort, page, limit };
}

export function getBaseWhere(query, category) {
  const where = {
    botInstalled: true,
    moderationStatus: "approved",
    NOT: { lastBumpAt: null },
  };

  const trimmedQuery = String(query || "").trim();
  const trimmedCategory = String(category || "all").trim().toLowerCase();
  const and = [];

  if (trimmedCategory && trimmedCategory !== "all") {
    and.push({ tags: { contains: `\"${trimmedCategory}\"` } });
  }

  if (trimmedQuery) {
    and.push({
      OR: [
        { name: { contains: trimmedQuery, mode: "insensitive" } },
        { description: { contains: trimmedQuery, mode: "insensitive" } },
        { tags: { contains: trimmedQuery.toLowerCase() } },
      ],
    });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

export function getOrderBy(sort) {
  if (sort === "top") {
    return [{ bumpCount: "desc" }, { lastBumpAt: "desc" }];
  }

  if (sort === "favorites") {
    return [{ favorites: { _count: "desc" } }, { lastBumpAt: "desc" }];
  }

  if (sort === "name") {
    return [{ name: "asc" }];
  }

  return [{ createdAt: "desc" }, { lastBumpAt: "desc" }];
}

export async function getPublicServersPayload(raw = {}) {
  const { query, category, sort, page, limit } = normalizeListQuery(raw);
  const where = getBaseWhere(query, category);
  const skip = (page - 1) * limit;

  const [rows, total, metaRows] = await Promise.all([
    prisma.server.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        tags: true,
        inviteUrl: true,
        lastBumpAt: true,
        bumpCount: true,
        botInstalled: true,
        moderationStatus: true,
        moderationNote: true,
        ownerDiscordId: true,
        permissionLabel: true,
        serverType: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favorites: true,
            reports: true,
          },
        },
      },
      orderBy: getOrderBy(sort),
      skip,
      take: limit,
    }),
    prisma.server.count({ where }),
    prisma.server.findMany({
      where: {
        botInstalled: true,
        moderationStatus: "approved",
        NOT: { lastBumpAt: null },
      },
      select: {
        tags: true,
        bumpCount: true,
        _count: {
          select: {
            favorites: true,
            reports: true,
          },
        },
      },
    }),
  ]);

  const approved = rows.map((row) => ({
    ...normalizeServer(row),
    favoriteCount: row._count.favorites,
    reportCount: row._count.reports,
  }));

  const enriched = await enrichServersWithInviteStats(approved);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const baseMeta = buildPublicServerMeta(
    metaRows.map((row, index) => ({
      id: `meta-${index}`,
      tags: normalizeServer({ id: `meta-${index}`, name: "meta", tags: row.tags }).tags,
      bumpCount: row.bumpCount,
      favoriteCount: row._count.favorites,
      reportCount: row._count.reports,
    }))
  );

  return {
    servers: enriched,
    meta: {
      ...baseMeta,
      page: safePage,
      limit,
      total,
      totalPages,
    },
    filters: {
      query,
      category,
      sort,
      page: safePage,
      limit,
    },
  };
}
