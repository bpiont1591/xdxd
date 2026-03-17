import { serialize } from "cookie";
import { denyIfCrossOrigin } from "../../../lib/request-security";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (denyIfCrossOrigin(req, res)) return;

  res.setHeader(
    "Set-Cookie",
    serialize("discordboard_admin", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0)
    })
  );

  return res.status(200).json({ ok: true });
}
