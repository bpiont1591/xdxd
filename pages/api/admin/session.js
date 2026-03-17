import { parse } from "cookie";
import { isValidAdminCookie } from "../../../lib/admin";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const cookies = parse(req.headers.cookie || "");
  const ok = isValidAdminCookie(cookies.discordboard_admin || "");
  return res.status(200).json({ authenticated: ok });
}
