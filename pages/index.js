import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
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

export default function Home() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState([]);
  const [meta, setMeta] = useState({
    totalServers: 0,
    totalBumps: 0,
    totalFavorites: 0,
    totalReports: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  async function loadServers(next = {}) {
    const q = next.query ?? query;
    const c = next.category ?? category;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: q,
        category: c,
        sort: "top",
      });

      const res = await fetch(`/api/public-servers?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setServers((data.servers || []).slice(0, 12));
        setMeta(
          data.meta || {
            totalServers: 0,
            totalBumps: 0,
            totalFavorites: 0,
            totalReports: 0,
            categories: [],
          }
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServers();
  }, []);

  const featuredCategories = useMemo(
    () => meta.categories.slice(0, 10),
    [meta.categories]
  );

  const isModerator = String(session?.user?.id || "") === "1418289596457812088";

  return (
    <>
      <Head>
        <title>Bumply</title>
        <meta
          name="description"
          content="Polski katalog serwerów Discord z wyszukiwarką, kategoriami, ulubionymi i panelem właściciela."
        />
      </Head>

      <main className="site-shell directory-home home-v11">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <Link href="/" className="brand brand-link">
            <img
              src="/bumply-logo.png"
              alt="Bumply"
              style={{ height: "200px", width: "auto", display: "block" }}
            />
          </Link>

          <div className="topbar-actions">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost">
                  Dashboard
                </Link>
                {isModerator ? (
                  <Link href="/admin" className="btn btn-ghost">
                    Moderacja
                  </Link>
                ) : null}
                <button
                  className="btn btn-ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => signIn("discord")}
              >
                Zaloguj przez Discord
              </button>
            )}
          </div>
        </header>

        <section className="home-v9-hero container glass">
          <div className="home-v9-hero-copy">
            <span className="badge">katalog serwerów</span>
            <h1>Znajdź aktywne serwery Discord</h1>
            <p>
              Przeglądaj kategorie, szukaj po tagach i sprawdzaj
              najaktywniejsze listingi.
            </p>

            <div className="hero-mini-stats">
              <span>{meta.totalServers} serwerów</span>
              <span>{meta.totalBumps} bumpów</span>
              <span>{meta.totalFavorites} ulubionych</span>
              <span>{meta.categories.length} kategorii</span>
            </div>
          </div>

          <form
            className="directory-search home-v9-search"
            onSubmit={(e) => {
              e.preventDefault();
              loadServers();
            }}
          >
            <input
              type="text"
              placeholder="Wpisz nazwę serwera, tag lub kategorię..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Szukaj
            </button>
          </form>

          <div className="home-v9-actions">
            {status === "authenticated" ? (
              <Link href="/dashboard" className="btn btn-primary">
                Dodaj serwer
              </Link>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => signIn("discord")}
              >
                Dodaj serwer
              </button>
            )}
            <Link href="/allservers" className="btn btn-ghost">
              Zobacz wszystkie
            </Link>
          </div>
        </section>

        <section className="category-strip container">
          <div className="section-head compact">
            <div>
              <span className="badge">kategorie</span>
              <h2>Popularne kategorie</h2>
            </div>
          </div>

          <div className="category-grid compact-categories">
            <button
              className={`category-chip large ${
                category === "all" ? "active" : ""
              }`}
              onClick={() => {
                setCategory("all");
                loadServers({ category: "all" });
              }}
            >
              <strong>Wszystkie</strong>
              <span>{meta.totalServers}</span>
            </button>

            {featuredCategories.map((item) => (
              <button
                key={item.name}
                className={`category-chip large ${
                  category === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setCategory(item.name);
                  loadServers({ category: item.name });
                }}
              >
                <strong>#{item.name}</strong>
                <span>{item.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="listing" className="servers-section container">
          <div className="section-head">
            <div>
              <span className="badge">strona główna</span>
              <h2>Najaktywniejsze serwery</h2>
              <p>Maksymalnie 12 pozycji na stronie głównej.</p>
            </div>
            <Link href="/allservers" className="btn btn-ghost">
              Zobacz wszystkie
            </Link>
          </div>

          {loading ? (
            <div className="state-card glass">Ładowanie serwerów...</div>
          ) : servers.length === 0 ? (
            <div className="state-card glass">
              <h3>Brak wyników</h3>
              <p>Spróbuj innej kategorii albo wyszukiwania.</p>
            </div>
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
                          <span className="metric">
                            Bumpów: {server.bumpCount || 0}
                          </span>
                          <span className="metric">
                            ⭐ {server.favoriteCount || 0}
                          </span>
                          <span className="metric">
                            Ostatni: {formatTimeAgo(server.lastBumpAt)}
                          </span>
                        </div>

                        <div className="tag-list">
                          {server.tags?.length ? (
                            server.tags.slice(0, 5).map((tag) => (
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