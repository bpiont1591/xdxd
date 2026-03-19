import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { denyIfCrossOrigin } from "../../../lib/request-security";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Brak sesji użytkownika" });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(`favorites:${req.method}:${session.user.id}:${ip}`, req.method === "GET" ? 60 : 30, 1000 * 60 * 10);
  if (!rate.allowed) {
    return res.status(429).json({ error: "Za dużo żądań. Spróbuj później." });
  }

  if (req.method === "GET") {
    const favorites = await prisma.favorite.findMany({
      where: { userDiscordId: session.user.id },
      include: { server: true },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      favorites: favorites.map((item) => ({
        serverId: item.serverId,
        server: item.server
      }))
    });
  }

  if (req.method === "POST") {
    if (denyIfCrossOrigin(req, res)) return;

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const serverId = String(body.serverId || "").trim();

    if (!serverId) {
      return res.status(400).json({ error: "Brak serverId" });
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { id: true, moderationStatus: true, botInstalled: true }
    });

    if (!server || server.moderationStatus !== "approved" || !server.botInstalled) {
      return res.status(404).json({ error: "Nie znaleziono serwera do zapisania" });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userDiscordId_serverId: {
          userDiscordId: session.user.id,
          serverId
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      const count = await prisma.favorite.count({ where: { serverId } });
      return res.status(200).json({ favorite: false, count });
    }

    await prisma.favorite.create({
      data: {
        userDiscordId: session.user.id,
        serverId
      }
    });

    const count = await prisma.favorite.count({ where: { serverId } });
    return res.status(200).json({ favorite: true, count });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
