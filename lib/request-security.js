export function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return true;

  try {
    const parsed = new URL(origin);
    return parsed.host === host;
  } catch {
    return false;
  }
}

export function denyIfCrossOrigin(req, res) {
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "Niedozwolone pochodzenie żądania" });
    return true;
  }
  return false;
}
