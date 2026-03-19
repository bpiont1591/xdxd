import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useMemo } from "react";
import DiscordServerIcon from "../components/DiscordServerIcon";
import BrandLogo from "../components/BrandLogo";
import DiscordGlyph from "../components/DiscordGlyph";
import ServerCommunityStats from "../components/ServerCommunityStats";
import SeoHead from "../components/SeoHead";
import { buildOrganizationSchema, buildWebsiteSchema, SITE_URL } from "../lib/seo";
import { getPublicServersPayload } from "../lib/public-servers";

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

export async function getServerSideProps() {
  try {
    const payload = await getPublicServersPayload({ sort: "top", limit: 12, page: 1, category: "all", query: "" });
    return {
      props: {
        initialServers: payload.servers || [],
        initialMeta: payload.meta || {
          totalServers: 0,
          totalBumps: 0,
          totalFavorites: 0,
          totalReports: 0,
          categories: [],
        },
      },
    };
  } catch (error) {
    console.error("home SSR error:", error);
    return {
      props: {
        initialServers: [],
        initialMeta: {
          totalServers: 0,
          totalBumps: 0,
          totalFavorites: 0,
          totalReports: 0,
          categories: [],
        },
      },
    };
  }
}

export default function Home({ initialServers, initialMeta }) {
  const { data: session, status } = useSession();
  const servers = Array.isArray(initialServers) ? initialServers : [];
  const meta = initialMeta || {
    totalServers: 0,
    totalBumps: 0,
    totalFavorites: 0,
    totalReports: 0,
    categories: [],
  };

  const featuredCategories = useMemo(() => (meta.categories || []).slice(0, 10), [meta.categories]);
  const isModerator = String(session?.user?.id || "") === "1418289596457812088";

  return (
    <>
      <SeoHead
        title="Serwery Discord Polska 2026 - lista serwerów Discord"
        description="DISBUMPLY.PL to polska lista serwerów Discord i katalog aktywnych społeczności. Odkrywaj kategorie, przeglądaj publiczne serwery Discord i promuj własny serwer."
        path="/"
        keywords={["lista discord polska", "serwery discord polska", "polskie serwery discord", "katalog serwerów discord"]}
        jsonLd={[
          buildWebsiteSchema(),
          buildOrganizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Lista Discord i serwery Discord Polska",
            url: SITE_URL,
            inLanguage: "pl-PL",
            description: "Publiczna lista serwerów Discord w Polsce.",
            about: ["Discord", "serwery Discord", "lista Discord", "społeczności online"],
          },
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
                <Link href="/dashboard" className="btn btn-ghost">DASHBOARD</Link>
                {isModerator ? <Link href="/admin" className="btn btn-ghost">MODERACJA</Link> : null}
                <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>WYLOGUJ SIĘ</button>
              </>
            ) : (
              <button className="btn btn-primary btn-discord" onClick={() => signIn("discord")}>
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
              <span>{(meta.categories || []).length} kategorii</span>
            </div>
          </div>

          <form className="directory-search home-v9-search searchbar-clean hero-search" method="get" action="/allservers">
            <input type="text" placeholder="Wpisz nazwę serwera, tag lub kategorię..." name="query" />
          </form>

          <div className="home-v9-actions">
            {status === "authenticated" ? (
              <Link href="/dashboard" className="btn btn-primary">DODAJ SERWER</Link>
            ) : (
              <button className="btn btn-primary" onClick={() => signIn("discord")}>DODAJ SERWER</button>
            )}
            <Link href="/allservers" className="btn btn-ghost">​ZOBACZ WSZYSTKIE​</Link>
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
            <Link className="category-chip large active" href="/allservers">
              <strong>Wszystkie</strong>
              <span>{meta.totalServers}</span>
            </Link>

            {featuredCategories.map((item) => (
              <Link key={item.name} className="category-chip large" href={`/allservers?category=${encodeURIComponent(item.name)}`}>
                <strong>#{item.name}</strong>
                <span>{item.count}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="container panel-card glass" style={{ marginBottom: 24 }}>
          <div className="section-head compact">
            <div>
              <span className="badge">o katalogu</span>
              <h2>Polska lista serwerów Discord</h2>
              <p className="muted">DISBUMPLY.PL pomaga znaleźć publiczne serwery Discord w Polsce. Przeglądaj najaktywniejsze społeczności, odkrywaj popularne kategorie i przechodź do pełnej listy serwerów albo szczegółowych profili.</p>
            </div>
          </div>

          <div className="tag-list">
            <Link className="tag" href="/allservers">Wszystkie serwery</Link>
            <Link className="tag" href="/allservers?sort=recent">Ostatnio aktywne</Link>
            <Link className="tag" href="/faq">FAQ</Link>
            <Link className="tag" href="/terms">Regulamin</Link>
            <Link className="tag" href="/privacy">Prywatność</Link>
          </div>
        </section>

        <section id="listing" className="servers-section container">
          <div className="section-head">
            <div>
              <span className="badge">Strona Główna</span>
              <h2>Najaktywniejsze serwery</h2>
            </div>
            <Link href="/allservers" className="btn btn-ghost">​ZOBACZ WSZYSTKIE​</Link>
          </div>

          {servers.length === 0 ? (
            <div className="state-card glass">
              <h3>Brak wyników</h3>
              <p>Lista serwerów jest chwilowo pusta albo baza akurat postanowiła utrudniać życie.</p>
            </div>
          ) : (
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
                            server.tags.slice(0, 5).map((tag) => <span className="tag" key={tag}>#{tag}</span>)
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
                        <a className="btn btn-primary" href={server.inviteUrl} target="_blank" rel="noreferrer">Dołącz</a>
                      ) : (
                        <button className="btn btn-disabled" disabled>Brak invite</button>
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
