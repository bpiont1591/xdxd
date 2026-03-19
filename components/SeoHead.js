import Head from "next/head";
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl, buildKeywords, cleanText, truncate } from "../lib/seo";

export default function SeoHead({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  keywords = [],
  type = "website",
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const safeDescription = truncate(description || "Polska lista serwerów Discord. Odkrywaj aktywne społeczności, wyszukuj kategorie i promuj własny serwer Discord.", 160);
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(image);
  const keywordContent = buildKeywords(keywords);

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={keywordContent} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <link rel="canonical" href={canonical} />

      <meta property="og:locale" content="pl_PL" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={ogImage} />

      {Array.isArray(jsonLd)
        ? jsonLd.map((entry, index) => (
            <script
              key={`jsonld-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
            />
          ))
        : jsonLd ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          ) : null}
    </Head>
  );
}
