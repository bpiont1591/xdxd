import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Brak sesji użytkownika" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const serverId = String(body.serverId || "");
    const reason = String(body.reason || "").trim().slice(0, 300);

    if (!serverId || !reason) {
      return res.status(400).json({
        error: "Brak serverId albo powodu zgłoszenia"
      });
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
  } catch (error) {
    console.error("Reports API error:", error);
    return res.status(500).json({
      error: "Nie udało się dodać zgłoszenia",
      details: error?.message || String(error)
    });
  }
}