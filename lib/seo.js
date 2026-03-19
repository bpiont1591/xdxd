export const SITE_URL = "https://disbumply.pl";
export const SITE_NAME = "DISBUMPLY.PL";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/allserver-logo.png`;

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function truncate(value = "", max = 160) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

export function buildKeywords(extra = []) {
  const base = [
    "lista discord",
    "lista serwerów discord",
    "polski discord",
    "serwery discord",
    "katalog discord",
    "discord serwery",
    "discord server list polska",
    "publiczna lista discord"
  ];

  return Array.from(new Set([...base, ...extra.filter(Boolean)])).join(", ");
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "Disbumply",
    url: SITE_URL,
    inLanguage: "pl-PL",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/allservers?query={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}
