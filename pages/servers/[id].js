import DiscordServerIcon, { getDiscordServerIconCandidates } from "../../components/DiscordServerIcon";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import ServerCommunityStats from "../../components/ServerCommunityStats";
import { useState } from "react";
import { prisma } from "../../lib/prisma";
import { normalizeServer } from "../../lib/storage";
import { fetchInviteStats } from "../../lib/discord-invite-stats";
import SeoHead from "../../components/SeoHead";
import { absoluteUrl, cleanText, SITE_URL } from "../../lib/seo";
import { getServerAchievements } from "../../lib/server-achievements";

export async function getServerSideProps({ params }) {
  try {
    const row = await prisma.server.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }]
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
            reports: true
          }
        }
      }
    });

    if (!row) {
      return { notFound: true };
    }

    const server = normalizeServer(row);
    if (server.moderationStatus !== "approved" || !server.botInstalled || !server.lastBumpAt) {
      return { notFound: true };
    }

    const inviteStats = await fetchInviteStats(server.inviteUrl);

    return {
      props: {
        server: {
          ...server,
          favoriteCount: row._count.favorites,
          reportCount: row._count.reports,
          ...inviteStats
        }
      }
    };
  } catch {
    return { notFound: true };
  }
}

const REPORT_REASON_OPTIONS = [
  { value: "", label: "Wybierz powód zgłoszenia" },
  { value: "Scam / phishing", label: "Scam / phishing" },
  { value: "NSFW bez oznaczenia", label: "NSFW bez oznaczenia" },
  { value: "Martwy invite", label: "Martwy invite" },
  { value: "Podszywanie się", label: "Podszywanie się" },
  { value: "Spam", label: "Spam" },
];

export default function ServerDetail({ server }) {
  const { data: session } = useSession();
  const [favoriteCount, setFavoriteCount] = useState(server.favoriteCount || 0);
  const [reportCount, setReportCount] = useState(server.reportCount || 0);
  const [notice, setNotice] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  async function toggleFavorite() {
    if (!session) {
      signIn("discord");
      return;
    }

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId: server.id })
    });

    const data = await res.json();
    if (res.ok) {
      setFavoriteCount(data.count || 0);
      setNotice(data.favorite ? "Dodano do ulubionych." : "Usunięto z ulubionych.");
    } else {
      setNotice(data.error || "Nie udało się zapisać ulubionych.");
    }
  }

  async function sendReport(e) {
    e.preventDefault();

    if (!session) {
      signIn("discord");
      return;
    }

    if (!reportReason) {
      setNotice("Wybierz powód zgłoszenia.");
      return;
    }

    const finalReason = [reportReason, reportDetails.trim()].filter(Boolean).join(" — ").slice(0, 300);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId: server.id, reason: finalReason })
    });

    const data = await res.json();
    if (res.ok) {
      setReportCount(data.count || 0);
      setNotice(data.deduplicated ? "To zgłoszenie już zostało zapisane w ostatnich 24h." : "Dziękujemy — zwykle odpowiadamy w ciągu 24 h.");
      setReportReason("");
      setReportDetails("");
    } else {
      setNotice(data.error || "Nie udało się wysłać zgłoszenia.");
    }
  }

  const iconUrl = getDiscordServerIconCandidates(server, 256)[0] || null;
  const achievements = getServerAchievements(server);
  const canonicalPath = `/servers/${encodeURIComponent(server.slug || server.id)}`;
  const description = cleanText(server.description || `Dołącz do serwera Discord ${server.name}. Zobacz opis, tagi i statystyki społeczności.`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: `${server.name} - serwer Discord`,
    description,
    url: absoluteUrl(canonicalPath),
    image: iconUrl || absoluteUrl("/allserver-logo.png"),
    inLanguage: "pl-PL",
    keywords: ["serwer discord", server.name, ...(server.tags || [])].filter(Boolean).join(", "),
    author: {
      "@type": "Organization",
      name: "DISBUMPLY.PL",
      url: SITE_URL
    },
    mainEntityOfPage: absoluteUrl(canonicalPath)
  };

  return (
    <>
      <SeoHead
        title={`${server.name} - serwer Discord`}
        description={description}
        path={canonicalPath}
        image={iconUrl || "/allserver-logo.png"}
        keywords={[server.name, ...(server.tags || []).slice(0, 8)]}
        type="article"
        jsonLd={jsonLd}
      />

      <main className="site-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <div className="detail-page-spacer container" />

        <section className="server-detail server-detail-pretty container">
          <div className="detail-hero glass">
            <div className="detail-left detail-left-stacked">
              <div className="server-avatar xl">
                {iconUrl ? (
                  <DiscordServerIcon server={server} size={256} />
                ) : (
                  <span>{server.name.slice(0, 1)}</span>
                )}
              </div>

              <div className="detail-copy">
                <span className="badge">profil serwera</span>
                <h1>{server.name}</h1>
                <p className="muted large">
                  {server.description || "Brak opisu serwera."}
                </p>

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
                  className="detail-community-stats top-gap"
                />

                {achievements.length ? (
                  <div className="tag-list top-gap">
                    {achievements.map((badge) => (
                      <span key={badge.key} className={`tiny-badge ${badge.tone || "ok"}`}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="detail-actions">
              {server.inviteUrl ? (
                <a className="btn btn-primary" href={server.inviteUrl} target="_blank" rel="noreferrer">
                  Dołącz do serwera
                </a>
              ) : (
                <button className="btn btn-disabled" disabled>Brak invite</button>
              )}
              <button className="btn btn-ghost" onClick={toggleFavorite}>⭐ Dodaj do ulubionych</button>
              <Link className="btn btn-ghost" href="/allservers">Powrót do listy</Link>
            </div>
          </div>

          <div className="detail-grid detail-grid-pretty">
            <div className="panel-card glass">
              <span className="badge">tagi</span>
              <div className="tag-list top-gap">
                {server.tags?.length ? server.tags.map((tag) => (
                  <span className="tag" key={tag}>#{tag}</span>
                )) : <span className="muted">Brak tagów</span>}
              </div>
            </div>

            <div className="panel-card glass">
              <span className="badge">statystyki</span>
              <div className="metric-grid top-gap">
                <div className="metric-box">
                  <strong>{server.bumpCount || 0}</strong>
                  <span>łącznych bumpów</span>
                </div>
                <div className="metric-box">
                  <strong>{favoriteCount}</strong>
                  <span>ulubionych</span>
                </div>
                <div className="metric-box">
                  <strong>{reportCount}</strong>
                  <span>zgłoszeń</span>
                </div>
                <div className="metric-box community-metric-box">
                  <strong>{Number.isFinite(Number(server.onlineCount)) ? Number(server.onlineCount).toLocaleString("pl-PL") : "--"}</strong>
                  <span>osób online</span>
                </div>
                <div className="metric-box community-metric-box">
                  <strong>{Number.isFinite(Number(server.memberCount)) ? Number(server.memberCount).toLocaleString("pl-PL") : "--"}</strong>
                  <span>wszystkich członków</span>
                </div>
                <div className="metric-box">
                  <strong>{server.lastBumpAt ? new Date(server.lastBumpAt).toLocaleString() : "brak"}</strong>
                  <span>ostatni bump</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card glass top-gap detail-report-card">
            <span className="badge">zgłoś serwer</span>
            <form className="form-grid top-gap" onSubmit={sendReport}>
              <label className="field">
                <span>Powód zgłoszenia</span>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="select">
                  {REPORT_REASON_OPTIONS.map((option) => (
                    <option key={option.value || 'empty'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Dodatkowe informacje</span>
                <textarea
                  rows={4}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value.slice(0, 220))}
                  placeholder="Opcjonalnie: opisz sytuację, podaj szczegóły, screeny, datę albo co dokładnie jest nie tak."
                />
              </label>

              <p className="muted small">
                Dostępne powody: scam/phishing, NSFW bez oznaczenia, martwy invite, podszywanie się, spam. Po wysłaniu zgłoszenie trafia do kolejki moderatora.
              </p>

              <div className="button-row">
                <button className="btn btn-danger" type="submit">🚩 Zgłoś</button>
              </div>
            </form>
            {notice ? <div className="notice">{notice}</div> : null}
          </div>
        </section>
      </main>
    </>
  );
}
