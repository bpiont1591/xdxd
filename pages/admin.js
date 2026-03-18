import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import BrandLogo from "../components/BrandLogo";
import DiscordGlyph from "../components/DiscordGlyph";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function checkSession() {
    const res = await fetch("/api/admin/session");
    const data = await res.json();
    setAuthenticated(Boolean(data.authenticated));
    return Boolean(data.authenticated);
  }

  async function loadServers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers");
      const data = await res.json();
      if (res.ok) setServers(data.servers || []);
      else setNotice(data.error || "Nie udało się pobrać listy");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      checkSession().then((ok) => {
        if (ok) loadServers();
        else setLoading(false);
      });
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  async function login(e) {
    e.preventDefault();
    setNotice("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || "Nie udało się zalogować");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    loadServers();
  }

  async function logoutAdmin() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setServers([]);
  }

  async function updateServer(id, payload) {
    setNotice("");
    const current = servers.find((server) => server.id === id);
    const res = await fetch("/api/admin/servers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        moderationStatus: payload.moderationStatus || current?.moderationStatus || "pending",
        moderationNote: "",
        serverType: payload.serverType || current?.serverType || "public"
      })
    });

    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error || "Nie udało się zapisać moderacji");
      return;
    }

    setServers((prev) => prev.map((server) => (server.id === id ? data.server : server)));
  }

  if (status === "loading") {
    return (
      <main className="panel-page">
        <div className="panel-only glass">Ładowanie sesji...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="panel-page">
        <div className="panel-only glass">
          <span className="badge">moderacja</span>
          <h1>Zaloguj się przez Discord</h1>
          <p className="muted">Panel moderacji jest dostępny tylko dla wskazanego konta Discord.</p>
          <button className="btn btn-primary btn-discord" onClick={() => signIn("discord")}>
            <DiscordGlyph />
            <span>Zaloguj przez Discord</span>
          </button>
        </div>
      </main>
    );
  }

  if (String(session?.user?.id || "") !== "1418289596457812088") {
    return (
      <main className="panel-page">
        <div className="panel-only glass">
          <span className="badge">brak dostępu</span>
          <h1>Ten panel nie jest dla tego konta</h1>
          <p className="muted">Moderacja jest widoczna tylko dla jednego konkretnego ID Discord.</p>
          <div className="button-row top-gap">
            <Link href="/" className="btn btn-ghost">Strona główna</Link>
            <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Wyloguj
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Panel Moderów DISCBUMPLY.PL</title>
      </Head>

      <main className="site-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <BrandLogo />

          <div className="topbar-actions">
            {authenticated && (
              <button className="btn btn-ghost" onClick={logoutAdmin}>Wyloguj admina</button>
            )}
            <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              WYLOGUJ DISCORD
            </button>
          </div>
        </header>

        <section className="admin-section container">
          {!authenticated ? (
            <div className="panel-only glass">
              <span className="badge">admin login</span>
              <h1>Moderacja listingów</h1>
              <p className="muted">Konto Discord jest poprawne. Teraz wpisz hasło admina.</p>

              <form className="form-grid top-gap" onSubmit={login}>
                <label className="field">
                  <span>Hasło admina</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wpisz ADMIN_PASSWORD z web/.env"
                  />
                </label>

                <div className="button-row">
                  <button className="btn btn-primary" type="submit">Zaloguj</button>
                </div>
              </form>

              {notice ? <div className="notice">{notice}</div> : null}
            </div>
          ) : (
            <div className="panel-card glass">
              <div className="section-head">
                <div>
                  <span className="badge">moderacja</span>
                  <h2>Wybrane serwery do decyzji</h2>
                  <p>Widzisz tylko serwery wybrane i zapisane przez użytkowników. Zatwierdzone serwery pokażą się publicznie po bumpie i aktywnym bocie.</p>
                </div>
                <button className="btn btn-ghost" onClick={loadServers}>Odśwież</button>
              </div>

              {loading ? (
                <div className="state-card glass">Ładowanie serwerów...</div>
              ) : (
                <div className="moderation-list">
                  {servers.map((server) => (
                    <div key={server.id} className="moderation-card">
                      <div className="moderation-head">
                        <div>
                          <h3>{server.name}</h3>
                          <p className="muted">{server.description || "Brak opisu"}</p>
                        </div>
                        <div className={`status-pill ${server.moderationStatus === "approved" ? "ok" : server.moderationStatus === "rejected" ? "danger" : "warn"}`}>
                          {server.moderationStatus}
                        </div>
                      </div>

                      <div className="tag-list">
                        {server.tags?.length ? server.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>) : <span className="muted">Brak tagów</span>}
                      </div>

                      <div className="moderation-meta">
                        <span className="metric">Bot: {server.botInstalled ? "tak" : "nie"}</span>
                        <span className="metric">Bumpy: {server.bumpCount || 0}</span>
                        <span className="metric">Invite: {server.inviteUrl ? "ustawiony" : "brak"}</span>
                        <span className={`server-type-pill ${server.serverType === "nsfw" ? "nsfw" : "public"}`}>{server.serverType === "nsfw" ? "NSFW 🔞" : "Publiczny"}</span>
                      </div>

                      <div className="button-row">
                        <button className="btn btn-primary" onClick={() => updateServer(server.id, { moderationStatus: "approved" })}>Zatwierdź</button>
                        <button className="btn btn-ghost" onClick={() => updateServer(server.id, { moderationStatus: "pending" })}>Pending</button>
                        <button className="btn btn-danger" onClick={() => updateServer(server.id, { moderationStatus: "rejected" })}>Odrzuć</button>
                        <Link className="btn btn-ghost" href={`/servers/${server.id}`}>Podgląd</Link>
                      </div>

                      <div className="button-row top-gap">
                        <button className={`btn ${server.serverType === "public" ? "btn-primary" : "btn-ghost"}`} onClick={() => updateServer(server.id, { serverType: "public" })}>Ustaw publiczny</button>
                        <button className={`btn ${server.serverType === "nsfw" ? "btn-danger" : "btn-ghost"}`} onClick={() => updateServer(server.id, { serverType: "nsfw" })}>Ustaw NSFW</button>
                      </div>
                    </div>
                  ))}
                  {!servers.length && <div className="state-card glass">Brak serwerów do moderacji.</div>}
                </div>
              )}

              {notice ? <div className="notice top-gap">{notice}</div> : null}
            </div>
          )}
        </section>
      </main>
    </>
  );
}