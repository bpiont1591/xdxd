import { prisma } from "../../lib/prisma";
import { normalizeServer } from "../../lib/storage";
import { buildPublicServerMeta, filterAndSortServers } from "../../lib/stats";
import { enrichServersWithInviteStats } from "../../lib/discord-invite-stats";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const query = String(req.query.query || "");
    const category = String(req.query.category || "all");
    const sort = String(req.query.sort || "recent");

    const rows = await prisma.server.findMany({
      where: {
        botInstalled: true,
        moderationStatus: "approved",
        NOT: { lastBumpAt: null }
      },
      include: {
        favorites: true,
        reports: true
      },
      orderBy: [
        { bumpCount: "desc" },
        { lastBumpAt: "desc" }
      ]
    });

    const approved = rows.map((row) => {
      const server = normalizeServer(row);
      return {
        ...server,
        favoriteCount: row.favorites.length,
        reportCount: row.reports.length
      };
    });

    const enriched = await enrichServersWithInviteStats(approved);
    const filtered = filterAndSortServers(enriched, query, category, sort);
    const meta = buildPublicServerMeta(enriched);

    return res.status(200).json({
      servers: filtered,
      meta
    });
  } catch (error) {
    console.error("GET /api/public-servers error:", error);

    return res.status(500).json({
      error: "Nie udało się pobrać listy publicznych serwerów",
      details: error?.message || String(error)
    });
  }
}
