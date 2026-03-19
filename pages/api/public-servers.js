import { getPublicServersPayload } from "../../lib/public-servers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await getPublicServersPayload(req.query);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("GET /api/public-servers error:", error);

    return res.status(500).json({
      error: "Nie udało się pobrać listy publicznych serwerów",
      details: error?.message || String(error),
    });
  }
}
