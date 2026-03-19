import { prisma } from "../../../lib/prisma";
import { BUMP_COOLDOWN_MS, normalizeServer } from "../../../lib/storage";

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

    const existing = await prisma.server.findUnique({ where: { id: guildId } });

    if (!existing) {
      return res.status(404).json({ error: "Serwer nie został wcześniej dodany w panelu strony" });
    }

    if (!existing.botInstalled) {
      return res.status(403).json({ error: "Bot nie jest aktywowany dla tego serwera" });
    }

    if (existing.moderationStatus !== "approved") {
      return res.status(412).json({
        error: "Serwer nie ma jeszcze potwierdzonego statusu",
        moderationStatus: existing.moderationStatus || "pending"
      });
    }

    const now = Date.now();
    const last = existing.lastBumpAt ? new Date(existing.lastBumpAt).getTime() : 0;
    const nextAllowed = last + BUMP_COOLDOWN_MS;

    if (last && now < nextAllowed) {
      return res.status(429).json({
        error: "Cooldown aktywny",
        nextBumpAt: new Date(nextAllowed).toISOString()
      });
    }

    const row = await prisma.server.update({
      where: { id: guildId },
      data: {
        name: guildName || existing.name,
        icon: guildIcon ?? existing.icon ?? null,
        bumpCount: Number(existing.bumpCount || 0) + 1,
        lastBumpAt: new Date(now)
      }
    });

    return res.status(200).json({
      ok: true,
      server: normalizeServer(row),
      nextBumpAt: new Date(now + BUMP_COOLDOWN_MS).toISOString()
    });
  } catch (error) {
    console.error("POST /api/bot/bump error:", error);
    return res.status(500).json({ error: "Nie udało się wykonać bumpa" });
  }
}
