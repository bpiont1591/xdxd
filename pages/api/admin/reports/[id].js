import { parse } from "cookie";
import { isValidAdminCookie } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";
import { denyIfCrossOrigin } from "../../../../lib/request-security";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";

function isAdmin(req) {
  const cookies = parse(req.headers.cookie || "");
  return isValidAdminCookie(cookies.discordboard_admin || "");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Brak autoryzacji admina" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (denyIfCrossOrigin(req, res)) return;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`admin-report:${ip}`, 60, 1000 * 60 * 10);
  if (!rate.allowed) {
    return res.status(429).json({ error: "Za dużo żądań. Spróbuj później." });
  }

  const id = String(req.query.id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "Brak ID zgłoszenia" });
  }

  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, serverId: true }
  });

  if (!report) {
    return res.status(404).json({ error: "Nie znaleziono zgłoszenia" });
  }

  await prisma.report.delete({
    where: { id }
  });

  return res.status(200).json({ ok: true, id, serverId: report.serverId });
}
