import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";
import { fetchInviteStats } from "../../../lib/discord-invite-stats";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  try {
    const row = await prisma.server.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
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
      }
    });

    if (!row) {
      return res.status(404).json({ error: "Nie znaleziono serwera" });
    }

    const server = normalizeServer(row);

    if (server.moderationStatus !== "approved" || !server.botInstalled || !server.lastBumpAt) {
      return res.status(404).json({ error: "Nie znaleziono serwera" });
    }

    const inviteStats = await fetchInviteStats(server.inviteUrl);

    return res.status(200).json({
      server: {
        ...server,
        favoriteCount: row._count.favorites,
        reportCount: row._count.reports,
        ...inviteStats
      }
    });
  } catch (error) {
    console.error("GET /api/server/[id] error:", error);
    return res.status(500).json({ error: "Nie udało się pobrać serwera" });
  }
}
