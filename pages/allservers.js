import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import DiscordServerIcon from "../components/DiscordServerIcon";
import SiteHeader from "../components/SiteHeader";
import ServerCommunityStats from "../components/ServerCommunityStats";

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

export default function AllServersPage() {
  const [servers, setServers] = useState([]);
  const [meta, setMeta] = useState({
    categories: [],
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("top");
  const [page, setPage] = useState(1);

  async function loadServers(next = {}) {
    const q = next.query ?? query;
    const c = next.category ?? category;
    const s = next.sort ?? sort;
    const p = next.page ?? page;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: q,
        category: c,
        sort: s,
        page: String(p),
        limit: "20",
      });

      const res = await fetch(`/api/public-servers?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setServers(data.servers || []);
        setMeta(
          data.meta || {
            categories: [],
            page: 1,
            totalPages: 1,
            total: 0,
            limit: 20,
          }
        );
        setPage(data.meta?.page || p);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServers({ page: 1 });
  }, []);

  function renderPagination() {
    const currentPage = meta.page || 1;
    const totalPages = meta.totalPages || 1;

    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination glass">
        <button
          className="btn btn-ghost"
          disabled={currentPage <= 1 || loading}
          onClick={() => loadServers({ page: currentPage - 1 })}
        >
          ← Poprzednia
        </button>

        <div className="pagination-pages">
          {start > 1 && (
            <>
              <button
                className={`page-btn ${currentPage === 1 ? "active" : ""}`}
                onClick={() => loadServers({ page: 1 })}
                disabled={loading}
              >
                1
              </button>
              {start > 2 && <span className="pagination-dots">...</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              className={`page-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => loadServers({ page: p })}
              disabled={loading}
            >
              {p}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="pagination-dots">...</span>
              )}
              <button
                className={`page-btn ${currentPage === totalPages ? "active" : ""}`}
                onClick={() => loadServers({ page: totalPages })}
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className="btn btn-ghost"
          disabled={currentPage >= totalPages || loading}
          onClick={() => loadServers({ page: currentPage + 1 })}
        >
          Następna →
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Wszystkie serwery DISBUMPLY.PL</title>
        <meta
          name="description"
          content="Pełna lista serwerów Discord w katalogu."
        />
      </Head>

      <main className="site-shell home-v9">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <SiteHeader backHref="/" backLabel="STRONA GŁÓWNA" />

        <section className="container panel-card glass allservers-toolbar">
          <div className="section-head compact">
            <div>
              <span className="badge">pełna lista</span>
              <h2>Wszystkie serwery</h2>
              <p className="muted">
                Łącznie: {meta.total || 0} • Strona {meta.page || 1} z{" "}
                {meta.totalPages || 1}
              </p>
            </div>
          </div>

          <div className="toolbar wide allservers-filters">
            <form
              className="searchbar searchbar-clean"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                loadServers({ page: 1 });
              }}
            >
              <input
                type="text"
                placeholder="Szukaj serwera..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>

            <div className="select-wrap">
              <select
                className="select select-dark"
                value={category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategory(value);
                  setPage(1);
                  loadServers({ category: value, page: 1 });
                }}
              >
                <option value="all">Wszystkie kategorie</option>
                {meta.categories.slice(0, 20).map((cat) => (
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
                  setPage(1);
                  loadServers({ sort: value, page: 1 });
                }}
              >
                <option value="top">Top bumpy</option>
                <option value="favorites">Najwięcej ulubionych</option>
                <option value="recent">Najnowsze</option>
                <option value="name">Nazwa A-Z</option>
              </select>
            </div>
          </div>
        </section>

        <section className="servers-section container">
          {!loading && renderPagination()}

          {loading ? (
            <div className="state-card glass">Ładowanie serwerów...</div>
          ) : servers.length === 0 ? (
            <div className="state-card glass">Brak wyników.</div>
          ) : (
            <>
              <div className="home-list">
                {servers.map((server) => {
                  return (
                    <article key={server.id} className="home-list-card glass">
                      <div className="home-list-main">
                        <div className="server-avatar">
                          {server.icon ? (
                            <DiscordServerIcon server={server} size={128} />
                          ) : (
                            <span>{server.name.slice(0, 1)}</span>
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

                          <p className="server-description clamp-3">
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