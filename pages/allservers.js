import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import DiscordServerIcon from "../components/DiscordServerIcon";

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

function formatCommunityStats(server) {
  const online = Number(server?.onlineCount || 0);
  const total = Number(server?.memberCount || 0);

  if (online > 0 && total > 0) return `${online} online • ${total} razem`;
  if (total > 0) return `${total} członków`;
  return "Brak danych o społeczności";
}

export default function AllServersPage() {
  const [servers, setServers] = useState([]);
  const [meta, setMeta] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("top");

  async function loadServers(next = {}) {
    const q = next.query ?? query;
    const c = next.category ?? category;
    const s = next.sort ?? sort;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: q,
        category: c,
        sort: s,
      });

      const res = await fetch(`/api/public-servers?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setServers(data.servers || []);
        setMeta(data.meta || { categories: [] });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServers();
  }, []);

  return (
    <>
      <Head>
        <title>Wszystkie serwery • Bumply</title>
        <meta
          name="description"
          content="Pełna lista serwerów Discord w katalogu Bumply."
        />
      </Head>

      <main className="site-shell home-v9">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <Link href="/" className="brand brand-link">
            <img
              src="/bumply-logo.png"
              alt="Bumply"
              className="site-logo"
            />
          </Link>

          <Link href="/" className="btn btn-ghost">
            Powrót
          </Link>
        </header>

        <section className="container panel-card glass allservers-toolbar">
          <div className="section-head compact">
            <div>
              <span className="badge">pełna lista</span>
              <h2>Wszystkie serwery</h2>
            </div>
          </div>

          <div className="toolbar wide allservers-filters">
            <div className="servers-toolbar-copy">
              <span className="metric metric-strong">{servers.length} wyników</span>
              <span className="muted">Lepszy układ, ciemne selecty i czytelniejsze filtrowanie.</span>
            </div>
            <form
              className="searchbar searchbar-clean"
              onSubmit={(e) => {
                e.preventDefault();
                loadServers();
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
                  setCategory(e.target.value);
                  loadServers({ category: e.target.value });
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
                  setSort(e.target.value);
                  loadServers({ sort: e.target.value });
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
          {loading ? (
            <div className="state-card glass">Ładowanie serwerów...</div>
          ) : servers.length === 0 ? (
            <div className="state-card glass">Brak wyników.</div>
          ) : (
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
                          <span className="presence-pill">
                            <span className="presence-dot" />
                            {formatCommunityStats(server)}
                          </span>
                          <span className="metric">
                            Bumpów: {server.bumpCount || 0}
                          </span>
                          <span className="metric">
                            ⭐ {server.favoriteCount || 0}
                          </span>
                          <span className="metric">
                            Ostatni: {formatTimeAgo(server.lastBumpAt)}
                          </span>
                          <span className={`server-type-pill ${server.serverType === "nsfw" ? "nsfw" : "public"}`}>
                            {server.serverType === "nsfw" ? "NSFW 🔞" : "Publiczny"}
                          </span>
                        </div>

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
          )}
        </section>
      </main>
    </>
  );
}
