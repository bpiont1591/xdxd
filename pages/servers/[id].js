import Head from "next/head";
import DiscordServerIcon, { getDiscordServerIconCandidates } from "../../components/DiscordServerIcon";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";


export async function getServerSideProps({ params, req }) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/server/${params.id}`);
  const data = await res.json();

  if (!res.ok) {
    return { notFound: true };
  }

  return {
    props: {
      server: data.server
    }
  };
}

export default function ServerDetail({ server }) {
  const { data: session } = useSession();
  const [favoriteCount, setFavoriteCount] = useState(server.favoriteCount || 0);
  const [reportCount, setReportCount] = useState(server.reportCount || 0);
  const [notice, setNotice] = useState("");
  const [reportReason, setReportReason] = useState("");
  const isNsfw = server.listingType === "nsfw";
  const ageStorageKey = useMemo(() => `discordboard-age-ok:${server.id}`, [server.id]);
  const [ageConfirmed, setAgeConfirmed] = useState(!isNsfw);

  useEffect(() => {
    if (!isNsfw) return;
    try {
      setAgeConfirmed(window.localStorage.getItem(ageStorageKey) === "yes");
    } catch {
      setAgeConfirmed(false);
    }
  }, [ageStorageKey, isNsfw]);

  function confirmAdult() {
    try {
      window.localStorage.setItem(ageStorageKey, "yes");
    } catch {}
    setAgeConfirmed(true);
  }

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

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId: server.id, reason: reportReason })
    });

    const data = await res.json();
    if (res.ok) {
      setReportCount(data.count || 0);
      setNotice("Zgłoszenie zostało zapisane.");
      setReportReason("");
    } else {
      setNotice(data.error || "Nie udało się wysłać zgłoszenia.");
    }
  }

  const iconUrl = getDiscordServerIconCandidates(server, 256)[0] || null;

  return (
    <>
      <Head>
        <title>{server.name} • DiscordBoard Premium</title>
        <meta name="description" content={server.description || `Strona serwera ${server.name}`} />
        <meta property="og:title" content={`${server.name} • DiscordBoard Premium`} />
        <meta property="og:description" content={server.description || `Dołącz do serwera ${server.name}`} />
        {iconUrl ? <meta property="og:image" content={iconUrl} /> : null}
      </Head>

      <main className="site-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <Link href="/" className="brand brand-link">
            <div className="brand-badge">DB</div>
            <div>
              <strong>DiscordBoard Premium</strong>
              <span>Wróć do strony głównej</span>
            </div>
          </Link>
        </header>

        <section className="server-detail container">
          <div className="detail-hero glass">
            <div className="detail-left">
              <div className="server-avatar xl">
                {iconUrl ? (
                  <DiscordServerIcon server={server} size={256} />
                ) : (
                  <span>{server.name.slice(0, 1)}</span>
                )}
              </div>

              <div>
                <span className="badge">profil serwera</span>
                <h1>{server.name}</h1>
                <div className="tag-list top-gap">
                  <span className={`tag ${isNsfw ? "tag-danger" : ""}`}>{isNsfw ? "18+ NSFW" : "Publiczny"}</span>
                </div>
                <p className="muted large">
                  {server.description || "Brak opisu serwera."}
                </p>
              </div>
            </div>

            <div className="detail-actions">
              {server.inviteUrl ? (
                isNsfw && !ageConfirmed ? (
                  <button className="btn btn-primary" type="button" onClick={confirmAdult}>
                    Mam 18 lat
                  </button>
                ) : (
                  <a className="btn btn-primary" href={server.inviteUrl} target="_blank" rel="noreferrer">
                    Dołącz do serwera
                  </a>
                )
              ) : (
                <button className="btn btn-disabled" disabled>Brak invite</button>
              )}
              <button className="btn btn-ghost" onClick={toggleFavorite}>⭐ Dodaj do ulubionych</button>
            </div>
          </div>

          <div className="detail-grid">
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
                <div className="metric-box">
                  <strong>{server.lastBumpAt ? new Date(server.lastBumpAt).toLocaleString() : "brak"}</strong>
                  <span>ostatni bump</span>
                </div>
              </div>
            </div>
          </div>

          {isNsfw && !ageConfirmed ? (
            <div className="panel-card glass top-gap">
              <span className="badge">bezpieczeństwo 18+</span>
              <h2>Ten serwer jest oznaczony jako NSFW</h2>
              <p className="muted top-gap">Przed pokazaniem linku zapraszającego potwierdź, że masz ukończone 18 lat. Taki mały bezpiecznik, bo internet bez zabezpieczeń to szambo z neonami.</p>
              <div className="button-row top-gap">
                <button className="btn btn-primary" type="button" onClick={confirmAdult}>Mam ukończone 18 lat</button>
                <Link className="btn btn-ghost" href="/">Wróć na stronę główną</Link>
              </div>
            </div>
          ) : null}

          <div className="panel-card glass top-gap">
            <span className="badge">zgłoś serwer</span>
            <form className="form-grid top-gap" onSubmit={sendReport}>
              <label className="field">
                <span>Powód zgłoszenia</span>
                <textarea
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Np. spam, oszustwo, niezgodna treść..."
                />
              </label>
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
