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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (denyIfCrossOrigin(req, res)) return;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`reports:${session.user.id}:${ip}`, 10, 1000 * 60 * 30);
  if (!rate.allowed) {
    return res.status(429).json({ error: "Za dużo zgłoszeń. Spróbuj później." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const serverId = String(body.serverId || "").trim();
  const reason = String(body.reason || "").trim().slice(0, 300);

  if (!serverId || !reason) {
    return res.status(400).json({ error: "Brak serverId albo powodu zgłoszenia" });
  }

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { id: true, moderationStatus: true, botInstalled: true }
  });

  if (!server || server.moderationStatus !== "approved" || !server.botInstalled) {
    return res.status(404).json({ error: "Nie znaleziono serwera do zgłoszenia" });
  }

  const recentReport = await prisma.report.findFirst({
    where: {
      serverId,
      userDiscordId: session.user.id,
      createdAt: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (recentReport) {
    const count = await prisma.report.count({ where: { serverId } });
    return res.status(200).json({ ok: true, count, deduplicated: true });
  }

  await prisma.report.create({
    data: {
      userDiscordId: session.user.id,
      serverId,
      reason
    }
  });

  const count = await prisma.report.count({ where: { serverId } });
  return res.status(200).json({ ok: true, count });
}
