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
import { getServerAchievements } from "../lib/server-achievements";

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

function AchievementStrip({ server, isTopTen = false }) {
  const badges = getServerAchievements(server, { isTopTen });
  if (!badges.length) return null;

  return (
    <div className="tag-list top-gap">
      {badges.map((badge) => (
        <span key={badge.key} className={`tiny-badge ${badge.tone || "ok"}`}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function HomeServerCard({ server, isTopTen = false, compact = false }) {
  const detailHref = `/servers/${encodeURIComponent(server.slug || server.id)}`;

  return (
    <article className="home-list-card glass">
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

          <AchievementStrip server={server} isTopTen={isTopTen} />

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
              server.tags.slice(0, compact ? 4 : 5).map((tag) => <span className="tag" key={tag}>#{tag}</span>)
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
}

export async function getServerSideProps() {
  const emptyMeta = {
    totalServers: 0,
    totalBumps: 0,
    totalFavorites: 0,
    totalReports: 0,
    categories: [],
  };

  try {
    const [{ prisma }, { normalizeServer }, { enrichServersWithInviteStats }] = await Promise.all([
      import("../lib/prisma"),
      import("../lib/storage"),
      import("../lib/discord-invite-stats"),
    ]);

    const [topPayload, recentRows] = await Promise.all([
      getPublicServersPayload({ sort: "top", limit: 12, page: 1, category: "all", query: "" }),
      prisma.server.findMany({
        where: {
          botInstalled: true,
          moderationStatus: "approved",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          tags: true,
          inviteUrl: true,
          lastBumpAt: true,
          bumpCount: true,
          botInstalled: true,
          moderationStatus: true,
          moderationNote: true,
          ownerDiscordId: true,
          permissionLabel: true,
          serverType: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              favorites: true,
              reports: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 8,
      }),
    ]);

    const recentServers = await enrichServersWithInviteStats(
      recentRows.map((row) => ({
        ...normalizeServer(row),
        favoriteCount: row._count?.favorites || 0,
        reportCount: row._count?.reports || 0,
      }))
    );

    return {
      props: {
        initialServers: topPayload.servers || [],
        initialMeta: topPayload.meta || emptyMeta,
        recentServers: recentServers || [],
      },
    };
  } catch (error) {
    console.error("home SSR error:", error);
    return {
      props: {
        initialServers: [],
        initialMeta: emptyMeta,
        recentServers: [],
      },
    };
  }
}

export default function Home({ initialServers, initialMeta, recentServers }) {
  const { data: session, status } = useSession();
  const servers = Array.isArray(initialServers) ? initialServers : [];
  const newest = Array.isArray(recentServers) ? recentServers : [];
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
        title="Lista serwerów Discord Polska 2026 - serwery Discord"
        description="DISBUMPLY.PL to polska lista serwerów Discord i katalog aktywnych społeczności. Odkrywaj publiczne serwery Discord, nowe społeczności i promuj własny serwer."
        path="/"
        keywords={["lista serwerów discord", "serwery discord polska", "polskie serwery discord", "katalog serwerów discord"]}
        jsonLd={[
          buildWebsiteSchema(),
          buildOrganizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Lista serwerów Discord / Serwery Discord Polska",
            url: SITE_URL,
            inLanguage: "pl-PL",
            description: "Publiczna lista serwerów Discord w Polsce.",
            about: ["Discord", "serwery Discord", "lista serwerów Discord", "społeczności online"],
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
                <span>ZALOGUJ SIĘ PRZEZ DISCORD</span>
              </button>
            )}
          </div>
        </header>

        <section className="home-v9-hero container glass">
          <div className="home-v9-hero-copy compact">
            <span className="badge">lista serwerów discord</span>
            <div className="hero-mini-stats">
              <span>{meta.totalServers} serwerów</span>
              <span>{meta.totalBumps} bumpów</span>
              <span>{meta.totalFavorites} ulubionych</span>
              <span>{(meta.categories || []).length} kategorii</span>
            </div>
          </div>

          <div>
            <h1>SERWERY DISCORD POLSKA</h1>
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
            <Link href="/allservers" className="btn btn-ghost">ZOBACZ WSZYSTKIE</Link>
          </div>
        </section>

        <section className="category-strip container">
          <div className="section-head compact">
            <div>
              <span className="badge">kategorie</span>
              <h2>Popularne kategorie serwerów Discord</h2>
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
              <p className="muted">Na stronie głównej znajdziesz listę serwerów Discord. W FAQ wyjaśniamy, jak dodać swój serwer, czym są bumpy i jak działa ranking.</p>
            </div>
          </div>

          <div className="tag-list">
            <Link className="tag" href="/allservers">Lista serwerów Discord</Link>
            <Link className="tag" href="/allservers?sort=recent">Serwery Discord Polska</Link>
            <Link className="tag" href="/faq">FAQ: jak dodać serwer</Link>
            <Link className="tag" href="/faq#bumpowanie">FAQ: jak bumpować</Link>
            <Link className="tag" href="/faq#ranking">FAQ: jak działa ranking</Link>
          </div>
        </section>

        <section id="listing" className="servers-section container">
          <div className="section-head">
            <div>
              <span className="badge">ranking</span>
              <h2>Najaktywniejsze serwery Discord</h2>
            </div>
            <Link href="/allservers" className="btn btn-ghost">ZOBACZ WSZYSTKIE</Link>
          </div>

          {servers.length === 0 ? (
            <div className="state-card glass">
              <h3>Brak wyników</h3>
              <p>Lista serwerów jest chwilowo pusta albo baza akurat postanowiła utrudniać życie.</p>
            </div>
          ) : (
            <div className="home-list">
              {servers.map((server, index) => (
                <HomeServerCard key={server.id} server={server} isTopTen={index < 10} />
              ))}
            </div>
          )}
        </section>

        <section className="servers-section container" style={{ paddingTop: 0, marginBottom: 40 }}>
          <div className="section-head">
            <div>
              <span className="badge">nowe serwery</span>
              <h2>Ostatnio dodane</h2>
            </div>
            <Link href="/allservers?sort=recent" className="btn btn-ghost">ZOBACZ NOWE</Link>
          </div>

          {newest.length === 0 ? (
            <div className="state-card glass">
              <p>Brak świeżo dodanych serwerów do pokazania.</p>
            </div>
          ) : (
            <div className="home-list">
              {newest.map((server) => (
                <HomeServerCard key={`recent-${server.id}`} server={server} compact />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
