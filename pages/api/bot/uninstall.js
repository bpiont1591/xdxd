import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";

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

    if (!guildId) {
      return res.status(400).json({ error: "Brak guildId" });
    }

    const existing = await prisma.server.findUnique({ where: { id: guildId } });

    if (!existing) {
      return res.status(200).json({ ok: true, removed: false });
    }

    const row = await prisma.server.update({
      where: { id: guildId },
      data: {
        botInstalled: false
      }
    });

    return res.status(200).json({
      ok: true,
      server: normalizeServer(row)
    });
  } catch (error) {
    console.error("POST /api/bot/uninstall error:", error);
    return res.status(500).json({ error: "Nie udało się oznaczyć usunięcia bota" });
  }
}
