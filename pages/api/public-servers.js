import { prisma } from "../../lib/prisma";
import { normalizeServer } from "../../lib/storage";
import { buildPublicServerMeta } from "../../lib/stats";
import { enrichServersWithInviteStats } from "../../lib/discord-invite-stats";

function getBaseWhere(query, category) {
  const where = {
    botInstalled: true,
    moderationStatus: "approved",
    NOT: { lastBumpAt: null }
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
        { tags: { contains: trimmedQuery.toLowerCase() } }
      ]
    });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

function getOrderBy(sort) {
  if (sort === "top") {
    return [{ bumpCount: "desc" }, { lastBumpAt: "desc" }];
  }

  if (sort === "favorites") {
    return [{ favorites: { _count: "desc" } }, { lastBumpAt: "desc" }];
  }

  if (sort === "name") {
    return [{ name: "asc" }];
  }

  return [{ lastBumpAt: "desc" }, { bumpCount: "desc" }];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const query = String(req.query.query || "");
    const category = String(req.query.category || "all");
    const sort = String(req.query.sort || "recent");
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));

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
              reports: true
            }
          }
        },
        orderBy: getOrderBy(sort),
        skip,
        take: limit
      }),
      prisma.server.count({ where }),
      prisma.server.findMany({
        where: {
          botInstalled: true,
          moderationStatus: "approved",
          NOT: { lastBumpAt: null }
        },
        select: {
          tags: true,
          bumpCount: true,
          _count: {
            select: {
              favorites: true,
              reports: true
            }
          }
        }
      })
    ]);

    const approved = rows.map((row) => ({
      ...normalizeServer(row),
      favoriteCount: row._count.favorites,
      reportCount: row._count.reports
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
        reportCount: row._count.reports
      }))
    );

    return res.status(200).json({
      servers: enriched,
      meta: {
        ...baseMeta,
        page: safePage,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error("GET /api/public-servers error:", error);

    return res.status(500).json({
      error: "Nie udało się pobrać listy publicznych serwerów",
      details: error?.message || String(error)
    });
  }
}
