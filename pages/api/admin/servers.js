import { parse } from "cookie";
import { isValidAdminCookie } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { normalizeServer } from "../../../lib/storage";
import { denyIfCrossOrigin } from "../../../lib/request-security";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";

function isAdmin(req) {
  const cookies = parse(req.headers.cookie || "");
  return isValidAdminCookie(cookies.discordboard_admin || "");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Brak autoryzacji admina" });
  }

  const ip = getClientIp(req);
  const rate = checkRateLimit(`admin-servers:${ip}:${req.method}`, req.method === "GET" ? 120 : 40, 1000 * 60 * 10);

  if (!rate.allowed) {
    return res.status(429).json({ error: "Za dużo żądań. Spróbuj później." });
  }

  if (req.method === "GET") {
    const rows = await prisma.server.findMany({
      orderBy: { updatedAt: "desc" }
    });

    return res.status(200).json({ servers: rows.map(normalizeServer) });
  }

  if (req.method === "PUT") {
    if (denyIfCrossOrigin(req, res)) return;

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const id = String(body.id || "");
    const moderationStatus = String(body.moderationStatus || "");
    const moderationNote = String(body.moderationNote || "").trim().slice(0, 300);

    if (!["pending", "approved", "rejected"].includes(moderationStatus)) {
      return res.status(400).json({ error: "Nieprawidłowy status moderacji" });
    }

    const existing = await prisma.server.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Nie znaleziono serwera" });
    }

    const row = await prisma.server.update({
      where: { id },
      data: {
        moderationStatus,
        moderationNote
      }
    });

    return res.status(200).json({ server: normalizeServer(row) });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
