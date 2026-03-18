import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";
import { attachInviteStats } from "../../../lib/discord-invite";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  const row = await prisma.server.findFirst({
    where: {
      OR: [{ id }, { slug: id }]
    },
    include: {
      favorites: true,
      reports: true
    }
  });

  if (!row) {
    return res.status(404).json({ error: "Nie znaleziono serwera" });
  }

  const server = normalizeServer(row);

  if (server.moderationStatus !== "approved" || !server.botInstalled || !server.lastBumpAt) {
    return res.status(404).json({ error: "Nie znaleziono serwera" });
  }

  return res.status(200).json({
    server: await attachInviteStats({
      ...server,
      favoriteCount: row.favorites.length,
      reportCount: row.reports.length
    })
  });
}
