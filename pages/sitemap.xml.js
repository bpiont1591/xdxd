import { prisma } from "../lib/prisma";
import { normalizeServer } from "../lib/storage";
import { SITE_URL } from "../lib/seo";

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function getServerSideProps({ res }) {
  const staticRoutes = [
    { loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_URL}/allservers`, changefreq: "hourly", priority: "0.9" },
    { loc: `${SITE_URL}/faq`, changefreq: "weekly", priority: "0.6" },
    { loc: `${SITE_URL}/privacy`, changefreq: "monthly", priority: "0.3" },
    { loc: `${SITE_URL}/terms`, changefreq: "monthly", priority: "0.3" }
  ];

  let serverRoutes = [];

  try {
    const rows = await prisma.server.findMany({
      where: {
        botInstalled: true,
        moderationStatus: "approved",
        NOT: { lastBumpAt: null }
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        lastBumpAt: true,
        name: true,
        tags: true
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 5000
    });

    serverRoutes = rows.map((row) => {
      const server = normalizeServer(row);
      const slug = server.slug || server.id;
      const lastmod = row.updatedAt || row.lastBumpAt || new Date();

      return {
        loc: `${SITE_URL}/servers/${encodeURIComponent(slug)}`,
        lastmod: new Date(lastmod).toISOString(),
        changefreq: "daily",
        priority: "0.8"
      };
    });
  } catch (error) {
    console.error("Failed to generate sitemap", error);
  }

  const urls = [...staticRoutes, ...serverRoutes]
    .map(
      (entry) => `<url><loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""}<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function SitemapXml() {
  return null;
}
