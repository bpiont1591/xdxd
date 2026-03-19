import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import DiscordServerIcon from "../components/DiscordServerIcon";
import BrandLogo from "../components/BrandLogo";
import ServerCommunityStats from "../components/ServerCommunityStats";
import SeoHead from "../components/SeoHead";
import { SITE_URL } from "../lib/seo";

function formatTimeAgo(dateString) {
  if (!dateString) return "Nigdy";

  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 60) return `${minutes} min temu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;

  const days = Math.floor(hours / 24);
  return `${days} dni temu`;
}

function normalizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function normalizePositiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildAllServersQuery(params = {}) {
  const search = new URLSearchParams();

  if (params.query) search.set("query", params.query);
  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }
  if (params.sort && params.sort !== "top") {
    search.set("sort", params.sort);
  }
  if (params.page && Number(params.page) > 1) {
    search.set("page", String(params.page));
  }

  return search.toString();
}

function buildAllServersHref(params = {}) {
  const qs = buildAllServersQuery(params);
  return qs ? `/allservers?${qs}` : "/allservers";
}

export async function getServerSideProps(context) {
  const rawQuery = normalizeString(context.query.query, "");
  const rawCategory = normalizeString(context.query.category, "all") || "all";
  const rawSort = normalizeString(context.query.sort, "top") || "top";
  const rawPage = normalizePositiveInt(context.query.page, 1);

  const apiParams = new URLSearchParams({
    query: rawQuery,
    category: rawCategory,
    sort: rawSort,
    page: String(rawPage),
    limit: "20",
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    SITE_URL ||
    "https://www.disbumply.pl";

  const fallbackMeta = {
    categories: [],
    page: rawPage,
    totalPages: 1,
    total: 0,
    limit: 20,
  };

  try {
    const response = await fetch(
      `${siteUrl}/api/public-servers?${apiParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        props: {
          initialServers: [],
          initialMeta: fallbackMeta,
          initialQuery: rawQuery,
          initialCategory: rawCategory,
          initialSort: rawSort,
        },
      };
    }

    const data = await response.json();

    return {
      props: {
        initialServers: Array.isArray(data.servers) ? data.servers : [],
        initialMeta: data.meta || fallbackMeta,
        initialQuery: rawQuery,
        initialCategory: rawCategory,
        initialSort: rawSort,
      },
    };
  } catch (error) {
    return {
      props: {
        initialServers: [],
        initialMeta: fallbackMeta,
        initialQuery: rawQuery,
        initialCategory: rawCategory,
        initialSort: rawSort,
      },
    };
  }
}

export default function AllServersPage({
  initialServers,
  initialMeta,
  initialQuery,
  initialCategory,
  initialSort,
}) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery || "");
  const [category, setCategory] = useState(initialCategory || "all");
  const [sort, setSort] = useState(initialSort || "top");

  useEffect(() => {
    setQuery(initialQuery || "");
    setCategory(initialCategory || "all");
    setSort(initialSort || "top");
  }, [initialQuery, initialCategory, initialSort]);

  const servers = Array.isArray(initialServers) ? initialServers : [];
  const meta = initialMeta || {
    categories: [],
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  };

  const currentPage = meta.page || 1;
  const totalPages = meta.totalPages || 1;

  const currentPath = useMemo(() => {
    const qs = buildAllServersQuery({
      query: initialQuery,
      category: initialCategory,
      sort: initialSort,
      page: currentPage,
    });

    return qs ? `/allservers?${qs}` : "/allservers";
  }, [initialCategory, initialQuery, initialSort, currentPage]);

  async function pushFilters(next = {}) {
    const nextQuery = next.query ?? query;
    const nextCategory = next.category ?? category;
    const nextSort = next.sort ?? sort;
    const nextPage = next.page ?? 1;

    const href = buildAllServersHref({
      query: nextQuery,
      category: nextCategory,
      sort: nextSort,
      page: nextPage,
    });

    await router.push(href);
  }

  function renderPagination() {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return (
      <nav className="pagination glass" aria-label="Paginacja wyników">
        <div>
          {currentPage > 1 ? (
            <Link
              className="btn btn-ghost"
              href={buildAllServersHref({
                query: initialQuery,
                category: initialCategory,
                sort: initialSort,
                page: currentPage - 1,
              })}
            >
              ← Poprzednia
            </Link>
          ) : (
            <span className="btn btn-ghost disabled" aria-disabled="true">
              ← Poprzednia
            </span>
          )}
        </div>

        <div className="pagination-pages">
          {start > 1 && (
            <>
              <Link
                className={`page-btn ${currentPage === 1 ? "active" : ""}`}
                href={buildAllServersHref({
                  query: initialQuery,
                  category: initialCategory,
                  sort: initialSort,
                  page: 1,
                })}
              >
                1
              </Link>
              {start > 2 && <span className="pagination-dots">...</span>}
            </>
          )}

          {pages.map((p) => (
            <Link
              key={p}
              className={`page-btn ${currentPage === p ? "active" : ""}`}
              href={buildAllServersHref({
                query: initialQuery,
                category: initialCategory,
                sort: initialSort,
                page: p,
              })}
              aria-current={currentPage === p ? "page" : undefined}
            >
              {p}
            </Link>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="pagination-dots">...</span>
              )}
              <Link
                className={`page-btn ${
                  currentPage === totalPages ? "active" : ""
                }`}
                href={buildAllServersHref({
                  query: initialQuery,
                  category: initialCategory,
                  sort: initialSort,
                  page: totalPages,
                })}
              >
                {totalPages}
              </Link>
            </>
          )}
        </div>

        <div>
          {currentPage < totalPages ? (
            <Link
              className="btn btn-ghost"
              href={buildAllServersHref({
                query: initialQuery,
                category: initialCategory,
                sort: initialSort,
                page: currentPage + 1,
              })}
            >
              Następna →
            </Link>
          ) : (
            <span className="btn btn-ghost disabled" aria-disabled="true">
              Następna →
            </span>
          )}
        </div>
      </nav>
    );
  }

  return (
    <>
      <SeoHead
        title="Wszystkie serwery Discord - lista Discord"
        description="Przeglądaj wszystkie serwery Discord w katalogu DISBUMPLY.PL. Sortuj, filtruj i wyszukuj polskie społeczności Discord według kategorii i aktywności."
        path={currentPath}
        keywords={[
          "wszystkie serwery discord",
          "lista serwerów discord",
          "serwery discord katalog",
          "polskie serwery discord",
        ]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Wszystkie serwery Discord",
          url: `${SITE_URL}${currentPath}`,
          inLanguage: "pl-PL",
          description:
            "Pełna lista publicznych serwerów Discord w katalogu DISBUMPLY.PL.",
        }}
      />

      <main className="site-shell home-v9">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <BrandLogo />
          <Link href="/" className="btn btn-ghost">
            POWRÓT
          </Link>
        </header>

        <section className="container panel-card glass allservers-toolbar">
          <div className="section-head compact">
            <div>
              <span className="badge">pełna lista</span>
              <h2>Wszystkie serwery</h2>
              <p className="muted">
                Łącznie: {meta.total || 0} • Strona {currentPage} z{" "}
                {totalPages}
              </p>
            </div>
          </div>

          <div className="toolbar wide allservers-filters">
            <form
              className="searchbar searchbar-clean"
              onSubmit={(e) => {
                e.preventDefault();
                pushFilters({ page: 1 });
              }}
            >
              <input
                type="text"
                placeholder="Szukaj serwera..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                name="query"
              />
            </form>

            <div className="select-wrap">
              <select
                className="select select-dark"
                value={category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategory(value);
                  pushFilters({ category: value, page: 1 });
                }}
                name="category"
              >
                <option value="all">Wszystkie kategorie</option>
                {(meta.categories || []).slice(0, 50).map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    #{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-wrap">
              <select
                className="select select-dark"
                value={sort}
                onChange={(e) => {
                  const value = e.target.value;
                  setSort(value);
                  pushFilters({ sort: value, page: 1 });
                }}
                name="sort"
              >
                <option value="top">Top bumpy</option>
                <option value="favorites">Najwięcej ulubionych</option>
                <option value="recent">Najnowsze</option>
                <option value="name">Nazwa A-Z</option>
              </select>
            </div>
          </div>
        </section>

        <section className="container seo-copy-block glass">
          <span className="badge">katalog discord</span>
          <h1>Wszystkie serwery Discord w jednym miejscu</h1>
          <p className="muted large">
            Ta podstrona zbiera pełną listę serwerów Discord, dzięki czemu
            Google dostaje czytelny katalog, a użytkownik może filtrować wyniki
            bez przekopywania się przez internetowy śmietnik.
          </p>
        </section>

        <section className="servers-section container">
          {renderPagination()}

          {servers.length === 0 ? (
            <div className="state-card glass">Brak wyników.</div>
          ) : (
            <>
              <div className="home-list">
                {servers.map((server) => (
                  <article key={server.id} className="home-list-card glass">
                    <div className="home-list-main">
                      <div className="server-avatar">
                        {server.icon ? (
                          <DiscordServerIcon server={server} size={128} />
                        ) : (
                          <span>{server.name?.slice(0, 1) || "?"}</span>
                        )}
                      </div>

                      <div className="home-list-copy">
                        <div className="home-list-topline">
                          <h3>{server.name}</h3>

                          <span className="metric">
                            Bumpów: {server.bumpCount || 0}
                          </span>

                          <span className="metric">
                            ⭐ {server.favoriteCount || 0}
                          </span>

                          <span className="metric">
                            Ostatni: {formatTimeAgo(server.lastBumpAt)}
                          </span>

                          <span
                            className={`server-type-pill ${
                              server.serverType === "nsfw" ? "nsfw" : "public"
                            }`}
                          >
                            {server.serverType === "nsfw"
                              ? "NSFW 🔞"
                              : "Publiczny"}
                          </span>
                        </div>

                        <ServerCommunityStats
                          online={server.onlineCount}
                          total={server.memberCount}
                          status={
                            Number.isFinite(Number(server.onlineCount)) ||
                            Number.isFinite(Number(server.memberCount))
                              ? "available"
                              : server.inviteUrl
                              ? "idle"
                              : "invalid"
                          }
                          compact
                          className="top-gap"
                        />

                        <div className="tag-list">
                          {server.tags?.length ? (
                            server.tags.slice(0, 6).map((tag) => (
                              <span className="tag" key={tag}>
                                #{tag}
                              </span>
                            ))
                          ) : (
                            <span className="muted">Brak tagów</span>
                          )}
                        </div>

                        <p className="server-description clamp-5">
                          {server.description || "Brak opisu serwera."}
                        </p>
                      </div>
                    </div>

                    <div className="home-list-actions">
                      <Link
                        className="btn btn-ghost"
                        href={`/servers/${server.id}`}
                      >
                        Szczegóły
                      </Link>

                      {server.inviteUrl ? (
                        <a
                          className="btn btn-primary"
                          href={server.inviteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Dołącz
                        </a>
                      ) : (
                        <button className="btn btn-disabled" disabled>
                          Brak invite
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </section>
      </main>
    </>
  );
}