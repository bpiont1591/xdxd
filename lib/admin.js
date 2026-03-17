import crypto from "crypto";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

function getSecret() {
  return process.env.NEXTAUTH_SECRET || "local-dev-secret";
}

function hmac(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyAdminPassword(input) {
  const expected = String(process.env.ADMIN_PASSWORD || "");
  const actual = String(input || "");
  if (!expected) return false;
  return safeEqual(expected, actual);
}

export function createAdminCookieValue() {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const value = `admin.${expiresAt}`;
  const signature = hmac(value);
  return `${value}.${signature}`;
}

export function isValidAdminCookie(cookieValue) {
  if (!cookieValue || typeof cookieValue !== "string") return false;

  const parts = cookieValue.split(".");
  if (parts.length !== 3) return false;

  const [role, expiresAt, signature] = parts;
  if (role !== "admin" || !expiresAt || !signature) return false;

  const raw = `${role}.${expiresAt}`;
  const expected = hmac(raw);

  if (!safeEqual(expected, signature)) return false;
  if (Date.now() > Number(expiresAt)) return false;

  return true;
}
