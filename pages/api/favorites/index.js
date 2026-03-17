import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Brak sesji użytkownika" });
  }

  try {
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
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const serverId = String(body.serverId || "");

      if (!serverId) {
        return res.status(400).json({ error: "Brak serverId" });
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
        await prisma.favorite.delete({
          where: {
            userDiscordId_serverId: {
              userDiscordId: session.user.id,
              serverId
            }
          }
        });

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
  } catch (error) {
    console.error("Favorites API error:", error);
    return res.status(500).json({
      error: "Nie udało się obsłużyć ulubionych",
      details: error?.message || String(error)
    });
  }
}