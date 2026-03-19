import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import DiscordServerIcon from "../components/DiscordServerIcon";
import BrandLogo from "../components/BrandLogo";
import DiscordGlyph from "../components/DiscordGlyph";
import ServerCommunityStats from "../components/ServerCommunityStats";
import SeoHead from "../components/SeoHead";
import { buildOrganizationSchema, SITE_URL } from "../lib/seo";

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
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Czym jest lista Discord?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To katalog publicznych serwerów Discord, w którym użytkownik może wyszukiwać społeczności według kategorii, tematu i aktywności."
        }
      },
      {
        "@type": "Question",
        name: "Jak dodać serwer Discord do katalogu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wystarczy zalogować się przez Discord, dodać swój serwer, uzupełnić opis, tagi i zaproszenie, a potem regularnie go bumpować."
        }
      },
      {
        "@type": "Question",
        name: "Jak znaleźć polskie serwery Discord?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Najłatwiej użyć wyszukiwarki i filtrów kategorii, aby przeglądać aktywne polskie serwery Discord według zainteresowań."
        }
      }
    ]
  };

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
      <SeoHead
        title="Lista Discord i serwery Discord Polska"
        description="DISBUMPLY.PL to polska lista Discord i katalog serwerów Discord. Wyszukuj aktywne społeczności, odkrywaj kategorie i promuj własny serwer Discord."
        path="/"
        keywords={["lista discord polska", "serwery discord polska", "polskie serwery discord", "katalog serwerów discord"]}
        jsonLd={[
          buildOrganizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Lista Discord i serwery Discord Polska",
            url: SITE_URL,
            inLanguage: "pl-PL",
            description: "Publiczna lista serwerów Discord w Polsce.",
            about: ["Discord", "serwery Discord", "lista Discord", "społeczności online"]
          },
          faqSchema
        ]}
      />

      <main className="site-shell directory-home home-v11">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <BrandLogo />

          <div className="topbar-actions">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost">
                DASHBOARD
                </Link>
                {isModerator ? (
                  <Link href="/admin" className="btn btn-ghost">
                MODERACJA
                  </Link>
                ) : null}
                <button
                  className="btn btn-ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                WYLOGUJ SIĘ
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary btn-discord"
                onClick={() => signIn("discord")}
              >
                <DiscordGlyph />
                <span>​ZALOGUJ SIĘ PRZEZ DISCORD​</span>
              </button>
            )}
          </div>
        </header>

        <section className="home-v9-hero container glass">
          <div className="home-v9-hero-copy compact">
            <span className="badge">katalog serwerów</span>

            <div className="hero-mini-stats">
              <span>{meta.totalServers} serwerów</span>
              <span>{meta.totalBumps} bumpów</span>
              <span>{meta.totalFavorites} ulubionych</span>
              <span>{meta.categories.length} kategorii</span>
            </div>
          </div>

          <form
            className="directory-search home-v9-search searchbar-clean hero-search"
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
          </form>

          <div className="home-v9-actions">
            {status === "authenticated" ? (
              <Link href="/dashboard" className="btn btn-primary">
                DODAJ SERWER
              </Link>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => signIn("discord")}
              >
                DODAJ SERWER
              </button>
            )}
            <Link href="/allservers" className="btn btn-ghost">
              ​ZOBACZ WSZYSTKIE​
            </Link>
          </div>
        </section>

        <section className="container seo-copy-block glass">
          <span className="badge">lista discord</span>
          <h1>Lista Discord dla polskich społeczności</h1>
          <p className="muted large">
            Szukasz miejsca, gdzie da się szybko znaleźć sensowny serwer Discord zamiast błądzić po przypadkowych zaproszeniach z internetu?
            Tutaj masz publiczny katalog, czyli normalną listę Discord z wyszukiwarką, kategoriami i aktywnością serwerów.
          </p>
          <div className="seo-copy-grid top-gap">
            <div className="panel-card glass">
              <h2>Jak działa katalog serwerów Discord</h2>
              <p>
                DISBUMPLY.PL porządkuje serwery Discord według tagów, kategorii i aktualnej aktywności. Dzięki temu użytkownik może łatwo
                znaleźć serwery gamingowe, społeczności tematyczne, serwery anime, roleplay, muzyczne, edukacyjne albo zwykłe miejsca do
                pogadania bez szukania igły w stogu cyfrowego siana.
              </p>
            </div>
            <div className="panel-card glass">
              <h2>Po co komu lista Discord</h2>
              <p>
                Taka lista Discord pomaga zarówno właścicielom serwerów, jak i ludziom szukającym nowej społeczności. Jeden chce widoczności w Google,
                drugi chce znaleźć aktywny serwer Discord po polsku. Niesłychane, obie strony mogą zyskać naraz.
              </p>
            </div>
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

        <section className="container seo-faq-block">
          <div className="section-head compact">
            <div>
              <span className="badge">FAQ</span>
              <h2>Najczęstsze pytania o serwery Discord</h2>
            </div>
          </div>

          <div className="seo-copy-grid">
            <article className="panel-card glass">
              <h3>Jak znaleźć dobry serwer Discord?</h3>
              <p>Najlepiej filtrować po kategorii, sprawdzić opis, liczbę ulubionych i aktywność. Martwe serwery są jak martwe fora, tylko bardziej smutne.</p>
            </article>
            <article className="panel-card glass">
              <h3>Jak wypromować własny serwer?</h3>
              <p>Dodaj unikalny opis, trafne tagi i regularnie bumpuj serwer. Osobna podstrona serwera pomaga także w indeksacji w Google.</p>
            </article>
            <article className="panel-card glass">
              <h3>Czy lista Discord jest po polsku?</h3>
              <p>Tak. Strona jest nastawiona na polskie serwery Discord i frazy, których ludzie naprawdę szukają, zamiast pisać tekst tylko dla robotów.</p>
            </article>
          </div>
        </section>

        <section id="listing" className="servers-section container">
          <div className="section-head">
            <div>
              <span className="badge">Strona Główna</span>
              <h2>Najaktywniejsze serwery</h2>
            </div>
            <Link href="/allservers" className="btn btn-ghost">
              ​ZOBACZ WSZYSTKIE​
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
                            server.tags.slice(0, 5).map((tag) => (
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
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
