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

function safeJsonParse(value, fallback = {}) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value || fallback;
  } catch {
    return fallback;
  }
}

function mapReport(report) {
  return {
    id: report.id,
    reason: report.reason || "",
    userDiscordId: report.userDiscordId || null,
    status: report.status || "new",
    moderatorNote: report.moderatorNote || "",
    reviewedAt: report.reviewedAt || null,
    reviewedByDiscordId: report.reviewedByDiscordId || null,
    createdAt: report.createdAt || null,
    updatedAt: report.updatedAt || null
  };
}

function mapServerForAdmin(row) {
  const normalized = normalizeServer(row);
  const reports = Array.isArray(row.reports) ? row.reports.map(mapReport) : [];
  const reportCount = typeof row?._count?.reports === "number" ? row._count.reports : reports.length;

  return {
    ...normalized,
    reportCount,
    _count: {
      ...(normalized._count || {}),
      reports: reportCount
    },
    reports,
    latestReportAt: reports[0]?.createdAt || null
  };
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
      include: {
        _count: {
          select: {
            reports: true
          }
        },
        reports: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            reason: true,
            userDiscordId: true,
            status: true,
            moderatorNote: true,
            reviewedAt: true,
            reviewedByDiscordId: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }]
    });

    const mapped = rows.map(mapServerForAdmin).sort((a, b) => {
      const aHasReports = a.reportCount > 0 ? 1 : 0;
      const bHasReports = b.reportCount > 0 ? 1 : 0;
      if (aHasReports !== bHasReports) return bHasReports - aHasReports;
      return new Date(b.latestReportAt || b.updatedAt || 0).getTime() - new Date(a.latestReportAt || a.updatedAt || 0).getTime();
    });

    return res.status(200).json({ servers: mapped });
  }

  if (req.method === "PUT") {
    if (denyIfCrossOrigin(req, res)) return;

    const body = safeJsonParse(req.body, {});
    const id = String(body.id || "").trim();
    const moderationStatus = String(body.moderationStatus || "").trim();
    const moderationNote = String(body.moderationNote || "").trim().slice(0, 300);
    const serverType = String(body.serverType || "public").toLowerCase() === "nsfw" ? "nsfw" : "public";

    if (!id) {
      return res.status(400).json({ error: "Brak ID serwera" });
    }

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
        moderationNote,
        serverType
      },
      include: {
        _count: {
          select: {
            reports: true
          }
        },
        reports: {
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            reason: true,
            userDiscordId: true,
            status: true,
            moderatorNote: true,
            reviewedAt: true,
            reviewedByDiscordId: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return res.status(200).json({ server: mapServerForAdmin(row) });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
