import { prisma } from "../../../lib/prisma";
import { normalizeServer, slugify } from "../../../lib/storage";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-bot-secret"];
  if (!secret || secret !== process.env.BOT_SHARED_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const guildId = String(body.guildId || "");
    const guildName = String(body.guildName || "");
    const guildIcon = body.guildIcon || null;

    if (!guildId || !guildName) {
      return res.status(400).json({ error: "Brak guildId albo guildName" });
    }

    const row = await prisma.server.upsert({
      where: { id: guildId },
      create: {
        id: guildId,
        name: guildName,
        slug: slugify(guildName),
        icon: guildIcon,
        botInstalled: true
      },
      update: {
        name: guildName,
        slug: slugify(guildName),
        icon: guildIcon,
        botInstalled: true
      }
    });

    return res.status(200).json({ ok: true, server: normalizeServer(row) });
  } catch (error) {
    console.error("POST /api/bot/install error:", error);
    return res.status(500).json({ error: "Nie udało się oznaczyć instalacji bota" });
  }
}
