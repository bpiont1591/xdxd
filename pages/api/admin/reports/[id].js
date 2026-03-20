import { parse } from "cookie";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { isValidAdminCookie } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import { denyIfCrossOrigin } from "../../../../lib/request-security";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";

function isAdminCookie(req) {
  const cookies = parse(req.headers.cookie || "");
  return isValidAdminCookie(cookies.discordboard_admin || "");
}

function parseBody(body) {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body || {};
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!isAdminCookie(req)) {
    return res.status(401).json({ error: "Brak autoryzacji admina" });
  }

  const session = await getServerSession(req, res, authOptions);
  const moderatorId = String(session?.user?.id || "").trim() || null;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`admin-report:${ip}:${req.method}`, 60, 1000 * 60 * 10);
  if (!rate.allowed) {
    return res.status(429).json({ error: "Za dużo żądań. Spróbuj później." });
  }

  const id = String(req.query.id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "Brak ID zgłoszenia" });
  }

  if (req.method === "DELETE") {
    if (denyIfCrossOrigin(req, res)) return;

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, serverId: true }
    });

    if (!report) {
      return res.status(404).json({ error: "Nie znaleziono zgłoszenia" });
    }

    await prisma.report.delete({ where: { id } });
    return res.status(200).json({ ok: true, id, serverId: report.serverId });
  }

  if (req.method === "PATCH") {
    if (denyIfCrossOrigin(req, res)) return;

    const body = parseBody(req.body);
    const status = String(body.status || "").trim().toLowerCase();
    const moderatorNote = String(body.moderatorNote || "").trim().slice(0, 300);

    if (!["new", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ error: "Nieprawidłowy status zgłoszenia" });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, serverId: true }
    });

    if (!report) {
      return res.status(404).json({ error: "Nie znaleziono zgłoszenia" });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        moderatorNote,
        reviewedAt: status === "new" ? null : new Date(),
        reviewedByDiscordId: status === "new" ? null : moderatorId
      },
      select: {
        id: true,
        serverId: true,
        reason: true,
        userDiscordId: true,
        status: true,
        moderatorNote: true,
        reviewedAt: true,
        reviewedByDiscordId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json({ ok: true, report: updated });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
