import { serialize } from "cookie";
import { createAdminCookieValue, verifyAdminPassword } from "../../../lib/admin";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";
import { denyIfCrossOrigin } from "../../../lib/request-security";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (denyIfCrossOrigin(req, res)) return;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`admin-login:${ip}`, 8, 1000 * 60 * 15);

  if (!rate.allowed) {
    return res.status(429).json({ error: "Za dużo prób logowania. Spróbuj później." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const password = String(body.password || "");

  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: "Nieprawidłowe hasło admina" });
  }

  res.setHeader(
    "Set-Cookie",
    serialize("discordboard_admin", createAdminCookieValue(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8
    })
  );

  return res.status(200).json({ ok: true });
}
