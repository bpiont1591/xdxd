import Link from "next/link";
import DiscordServerIcon from "../components/DiscordServerIcon";
import BrandLogo from "../components/BrandLogo";
import ServerCommunityStats from "../components/ServerCommunityStats";
import SeoHead from "../components/SeoHead";
import { SITE_URL } from "../lib/seo";
import { getPublicServersPayload, normalizeListQuery } from "../lib/public-servers";

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

function isNewServer(dateString) {
  if (!dateString) return false;

  const createdAt = new Date(dateString).getTime();
  if (Number.isNaN(createdAt)) return false;

  const fourteenDays = 14 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt <= fourteenDays;
}

function buildAllServersQuery(params = {}) {
  const search = new URLSearchParams();

  if (params.query) search.set("query", params.query);
  if (params.category && params.category !== "all") search.set("category", params.category);
  if (params.sort && params.sort !== "top") search.set("sort", params.sort);
  if (params.page && Number(params.page) > 1) search.set("page", String(params.page));

  return search.toString();
}

function buildAllServersHref(params = {}) {
  const qs = buildAllServersQuery(params);
  return qs ? `/allservers?${qs}` : "/allservers";
}

export async function getServerSideProps({ query }) {
  const filters = normalizeListQuery(query);
  const fallbackMeta = {
    categories: [],
    page: filters.page,
    totalPages: 1,
    total: 0,
    limit: filters.limit,
  };

  try {
    const payload = await getPublicServersPayload(filters);
    return {
      props: {
        initialServers: payload.servers || [],
        initialMeta: payload.meta || fallbackMeta,
        filters: payload.filters || filters,
      },
    };
  } catch (error) {
    console.error("allservers SSR error:", error);
    return {
      props: {
        initialServers: [],
        initialMeta: fallbackMeta,
        filters,
      },
    };
  }
}

export default function AllServersPage({ initialServers, initialMeta, filters }) {
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
  const currentPath = buildAllServersHref({
    query: filters?.query,
    category: filters?.category,
    sort: filters?.sort,
    page: currentPage,
  });

  const hasActiveFilters = Boolean(filters?.query) || (filters?.category && filters.category !== "all") || (filters?.sort && filters.sort !== "top") || Number(currentPage) > 1;
  const noindex = hasActiveFilters;

  function renderPagination() {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i += 1) pages.push(i);

    return (
      <nav className="pagination glass" aria-label="Paginacja wyników">
        <div>
          {currentPage > 1 ? (
            <Link
              className="btn btn-ghost"
              href={buildAllServersHref({ ...filters, page: currentPage - 1 })}
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
              <Link className={`page-btn ${currentPage === 1 ? "active" : ""}`} href={buildAllServersHref({ ...filters, page: 1 })}>
                1
              </Link>
              {start > 2 && <span className="pagination-dots">...</span>}
            </>
          )}

          {pages.map((p) => (
            <Link
              key={p}
              className={`page-btn ${currentPage === p ? "active" : ""}`}
              href={buildAllServersHref({ ...filters, page: p })}
              aria-current={currentPage === p ? "page" : undefined}
            >
              {p}
            </Link>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="pagination-dots">...</span>}
              <Link
                className={`page-btn ${currentPage === totalPages ? "active" : ""}`}
                href={buildAllServersHref({ ...filters, page: totalPages })}
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
              href={buildAllServersHref({ ...filters, page: currentPage + 1 })}
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
        title="Wszystkie serwery Discord Polska - pełna lista"
        description="Przeglądaj wszystkie publiczne serwery Discord w katalogu DISBUMPLY.PL. Odkrywaj polskie społeczności, znajdź aktywne grupy i dołącz do nowych serwerów Discord."
        path={currentPath}
        noindex={noindex}
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
          description: "Pełna lista publicznych serwerów Discord w katalogu DISBUMPLY.PL.",
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
                Masz tu {meta.total || 0} serwerów. Strona {currentPage} z {totalPages}.
              </p>
            </div>
          </div>

          <div className="toolbar wide allservers-filters">
            <form className="searchbar searchbar-clean" method="get" action="/allservers">
              <input type="text" placeholder="Szukaj serwera..." defaultValue={filters?.query || ""} name="query" />
              {filters?.category && filters.category !== "all" ? <input type="hidden" name="category" value={filters.category} /> : null}
              {filters?.sort && filters.sort !== "top" ? <input type="hidden" name="sort" value={filters.sort} /> : null}
            </form>

            <div className="select-wrap">
              <label className="sr-only" htmlFor="category-select">Kategoria</label>
              <select
                id="category-select"
                className="select select-dark"
                value={filters?.category || "all"}
                onChange={(e) => {
                  window.location.href = buildAllServersHref({ ...filters, category: e.target.value, page: 1 });
                }}
                name="category"
              >
                <option value="all">Wszystkie kategorie</option>
                {(meta.categories || []).slice(0, 50).map((cat) => (
                  <option key={cat.name} value={cat.name}>#{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="select-wrap">
              <label className="sr-only" htmlFor="sort-select">Sortowanie</label>
              <select
                id="sort-select"
                className="select select-dark"
                value={filters?.sort || "top"}
                onChange={(e) => {
                  window.location.href = buildAllServersHref({ ...filters, sort: e.target.value, page: 1 });
                }}
                name="sort"
              >
                <option value="top">Top bumpy</option>
                <option value="favorites">Najwięcej ulubionych</option>
                <option value="recent">Nowe serwery</option>
                <option value="name">Nazwa A-Z</option>
              </select>
            </div>
          </div>
        </section>

        <section className="container seo-copy-block glass">
          <span className="badge">katalog discord</span>
          <h1>Wszystkie serwery Discord w jednym miejscu</h1>
          <p className="muted">Nowe serwery znajdziesz tutaj po przełączeniu sortowania na &quot;Nowe serwery&quot;.</p>
        </section>

        <section className="servers-section container">
          {renderPagination()}

          {servers.length === 0 ? (
            <div className="state-card glass">Brak wyników.</div>
          ) : (
            <>
              <div className="home-list">
                {servers.map((server) => {
                  const detailHref = `/servers/${encodeURIComponent(server.slug || server.id)}`;

                  return (
                    <article key={server.id} className="home-list-card glass">
                      <div className="home-list-main">
                        <div className="server-avatar">
                          {server.icon ? <DiscordServerIcon server={server} size={128} /> : <span>{server.name?.slice(0, 1) || "?"}</span>}
                        </div>

                        <div className="home-list-copy">
                          <div className="home-list-topline">
                            <h3>{server.name}</h3>
                            <span className="metric">Bumpów: {server.bumpCount || 0}</span>
                            <span className="metric">⭐ {server.favoriteCount || 0}</span>
                            <span className="metric">Ostatni: {formatTimeAgo(server.lastBumpAt)}</span>
                            {isNewServer(server.createdAt) ? (
                              <span className="server-type-pill public">🆕 Nowy serwer</span>
                            ) : null}
                            <span className={`server-type-pill ${server.serverType === "nsfw" ? "nsfw" : "public"}`}>
                              {server.serverType === "nsfw" ? "NSFW 🔞" : "Publiczny"}
                            </span>
                          </div>

                          <ServerCommunityStats
                            online={server.onlineCount}
                            total={server.memberCount}
                            status={
                              Number.isFinite(Number(server.onlineCount)) || Number.isFinite(Number(server.memberCount))
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
                                <span className="tag" key={tag}>#{tag}</span>
                              ))
                            ) : (
                              <span className="muted">Brak tagów</span>
                            )}
                          </div>

                          <p className="server-description clamp-5">{server.description || "Brak opisu serwera."}</p>
                        </div>
                      </div>

                      <div className="home-list-actions">
                        <Link className="btn btn-ghost" href={detailHref}>Szczegóły</Link>
                        {server.inviteUrl ? (
                          <a className="btn btn-primary" href={server.inviteUrl} target="_blank" rel="noreferrer">
                            Dołącz
                          </a>
                        ) : (
                          <button className="btn btn-disabled" disabled>Brak invite</button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {renderPagination()}
            </>
          )}
        </section>
      </main>
    </>
  );
}
