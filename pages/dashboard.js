import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const defaultForm = { description: "", tags: "", inviteUrl: "" };

function formatLastBump(value) {
  if (!value) return "Brak bumpa";
  return new Date(value).toLocaleString();
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [showServerPicker, setShowServerPicker] = useState(false);

  const loadServers = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const res = await fetch("/api/servers");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Nie udało się pobrać serwerów");

      setServers(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        const nextId = selectedId && data.find((x) => x.id === selectedId) ? selectedId : data[0].id;
        setSelectedId(nextId);
      } else {
        setSelectedId("");
      }
    } catch (err) {
      setNotice(err.message || "Błąd pobierania");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (status === "authenticated") loadServers();
    if (status === "unauthenticated") {
      setServers([]);
      setSelectedId("");
      setLoading(false);
    }
  }, [status, loadServers]);

  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedId),
    [servers, selectedId]
  );

  const availableServers = useMemo(() => {
    return servers.filter((server) => !!server?.id);
  }, [servers]);

  useEffect(() => {
    if (selectedServer) {
      setForm({
        description: selectedServer.description || "",
        tags: Array.isArray(selectedServer.tags) ? selectedServer.tags.join(", ") : "",
        inviteUrl: selectedServer.inviteUrl || ""
      });
    } else {
      setForm(defaultForm);
    }
  }, [selectedServer]);

  useEffect(() => {
    if (status !== "authenticated" || !selectedServer || selectedServer.botInstalled) {
      return;
    }

    const interval = setInterval(() => {
      loadServers();
    }, 5000);

    const onFocus = () => loadServers();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadServers();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, selectedServer?.id, selectedServer?.botInstalled, loadServers]);

  async function saveServer(e) {
    e.preventDefault();
    if (!selectedServer) return;

    setSaving(true);
    setNotice("");

    try {
      const res = await fetch(`/api/servers/${selectedServer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          tags: form.tags,
          inviteUrl: form.inviteUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się zapisać");

      setServers((prev) => prev.map((server) => (server.id === data.id ? { ...server, ...data } : server)));
      setNotice("Zapisano zmiany.");
    } catch (err) {
      setNotice(err.message || "Błąd zapisu");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="panel-page">
        <div className="panel-only glass">Ładowanie sesji...</div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="panel-page">
        <div className="panel-only glass">
          <h1>Najpierw zaloguj się przez Discord</h1>
          <p className="muted">
            Zalogowanie pobiera twoje serwery z Discorda, a przycisk dodania bota tylko dodaje bota.
          </p>

          <div className="button-row">
            <button
              className="btn btn-primary"
              onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            >
              Zaloguj przez Discord
            </button>
            <Link className="btn btn-ghost" href="/">
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const botAddUrl = selectedServer
    ? `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || ""}&scope=bot%20applications.commands&permissions=32&guild_id=${selectedServer.id}&disable_guild_select=true`
    : "#";

  const moderationLabel =
    selectedServer?.moderationStatus === "approved"
      ? "Zatwierdzony"
      : selectedServer?.moderationStatus === "rejected"
      ? "Odrzucony"
      : "Oczekuje";

  return (
    <>
      <Head>
        <title>Dashboard • DiscordBoard Premium</title>
      </Head>

      <main className="dashboard-shell premium dashboard-v10">
        <aside className="sidebar glass dashboard-sidebar slim-sidebar visible-sidebar">
          <div className="sidebar-header deluxe">
            <Link href="/" className="brand brand-link">
              <div className="brand-badge">DB</div>
              <div>
                <strong>DiscordBoard</strong>
                <span>Strona główna</span>
              </div>
            </Link>

            <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Wyloguj
            </button>
          </div>

          <div className="profile-card glass-lite compact-profile">
            <div className="profile-card-top">
              <div className="profile-avatar-wrap">
                {session?.user?.image ? (
                  <img
                    className="profile-avatar-img"
                    src={session.user.image}
                    alt={session?.user?.name || "Avatar użytkownika"}
                  />
                ) : (
                  <div className="user-avatar deluxe-avatar">
                    {session?.user?.name?.slice(0, 1) || "U"}
                  </div>
                )}
              </div>

              <div className="profile-copy">
                <strong>{session?.user?.name}</strong>
                <p className="muted small">{session?.user?.email || "Discord OAuth"}</p>
              </div>
            </div>
          </div>

          <div className="sidebar-block">
            <div className="section-label">Twoje serwery</div>

            <div className="button-row" style={{ marginBottom: 12 }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setShowServerPicker((prev) => !prev)}
                disabled={loading || availableServers.length === 0}
              >
                {availableServers.length === 0
                  ? "Brak serwerów"
                  : showServerPicker
                  ? "Ukryj listę"
                  : "Dodaj serwer"}
              </button>
            </div>

            {loading ? (
              <div className="server-list">
                <div className="server-item active">Ładowanie serwerów z Discorda...</div>
              </div>
            ) : availableServers.length === 0 ? (
              <div className="empty-server-state glass-lite">
                <div className="empty-server-icon">+</div>
                <div className="empty-server-copy">
                  <strong>Brak dostępnych serwerów</strong>
                  <p>
                    Nie znaleziono serwerów, którymi możesz zarządzać. Dodaj bota na serwer albo upewnij się,
                    że masz uprawnienie <b>Manage Server</b>.
                  </p>
                </div>
              </div>
            ) : showServerPicker ? (
              <div className="server-list deluxe-list visible-list">
                {availableServers.map((server) => (
                  <button
                    key={server.id}
                    className={`server-item rich-server-item ${server.id === selectedId ? "active" : ""}`}
                    onClick={() => {
                      setSelectedId(server.id);
                      setShowServerPicker(false);
                    }}
                  >
                    <div className="server-icon">
                      {server.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=128`}
                          alt={server.name}
                        />
                      ) : (
                        <span>{server.name.slice(0, 1)}</span>
                      )}
                    </div>

                    <div className="server-meta">
                      <strong>{server.name}</strong>
                      <span>{server.permissionLabel}</span>
                    </div>

                    <div className="server-item-badges">
                      <span className={`tiny-badge ${server.botInstalled ? "ok" : "warn"}`}>
                        {server.botInstalled ? "Bot" : "Brak bota"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-server-state glass-lite">
                <div className="empty-server-icon">+</div>
                <div className="empty-server-copy">
                  <strong>Dodaj serwer</strong>
                  <p>Kliknij przycisk powyżej, aby wybrać serwer z listy dostępnych.</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="content-panel">
          {selectedServer ? (
            <>
              <div className="dashboard-banner glass compact-banner">
                <div className="banner-main">
                  <div className="server-avatar xl">
                    {selectedServer.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${selectedServer.id}/${selectedServer.icon}.png?size=256`}
                        alt={selectedServer.name}
                      />
                    ) : (
                      <span>{selectedServer.name.slice(0, 1)}</span>
                    )}
                  </div>

                  <div className="banner-copy">
                    <span className="badge">wybrany serwer</span>
                    <h1>{selectedServer.name}</h1>
                    <div className="tag-list top-gap">
                      <span className={`status-pill ${selectedServer.botInstalled ? "ok" : "warn"}`}>
                        {selectedServer.botInstalled ? "Bot aktywny" : "Bot nie dodany"}
                      </span>
                      <span
                        className={`status-pill ${
                          selectedServer.moderationStatus === "approved"
                            ? "ok"
                            : selectedServer.moderationStatus === "rejected"
                            ? "danger"
                            : "warn"
                        }`}
                      >
                        {moderationLabel}
                      </span>
                      <span className="metric">{selectedServer.permissionLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="button-row compact-actions">
                  {!selectedServer.botInstalled ? (
                    <a className="btn btn-primary" href={botAddUrl} target="_blank" rel="noreferrer">
                      Dodaj bota
                    </a>
                  ) : (
                    <button className="btn btn-primary" type="button" disabled>
                      Bot już dodany
                    </button>
                  )}
                  <Link className="btn btn-ghost" href={`/servers/${selectedServer.id}`}>
                    Podgląd strony
                  </Link>
                  <button className="btn btn-ghost" type="button" onClick={loadServers}>
                    Odśwież
                  </button>
                </div>
              </div>

              {!selectedServer.botInstalled ? (
                <div className="panel-card glass" style={{ marginBottom: 20 }}>
                  <div className="panel-head simple">
                    <div>
                      <span className="badge">krok wymagany</span>
                      <h1>Najpierw dodaj bota na ten serwer</h1>
                    </div>
                  </div>
                  <p className="muted">
                    Lista serwerów jest pobierana z twojego Discorda po logowaniu. Ten status bota jest sprawdzany live z
                    Discorda co kilka sekund, więc po dodaniu bota wróć tutaj albo kliknij odśwież.
                  </p>
                </div>
              ) : null}

              <div className="server-overview-grid">
                <article className="overview-card glass">
                  <span className="overview-label">Bumpy</span>
                  <strong>{selectedServer.bumpCount || 0}</strong>
                </article>
                <article className="overview-card glass">
                  <span className="overview-label">Ostatni bump</span>
                  <strong>{formatLastBump(selectedServer.lastBumpAt)}</strong>
                </article>
                <article className="overview-card glass">
                  <span className="overview-label">Invite</span>
                  <strong>{selectedServer.inviteUrl ? "Ustawiony" : "Brak"}</strong>
                </article>
              </div>

              <div className="dashboard-content-split">
                <section className="panel-card glass editor-card-deluxe">
                  <div className="panel-head simple">
                    <div>
                      <span className="badge">edycja</span>
                      <h1>Konfiguracja serwera</h1>
                    </div>
                  </div>

                  <form className="form-grid" onSubmit={saveServer}>
                    <label className="field">
                      <span>Opis serwera</span>
                      <textarea
                        rows={6}
                        maxLength={230}
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value.slice(0, 230)
                          }))
                        }
                        placeholder="Opisz serwer krótko i konkretnie."
                      />
                      <small className="muted">{form.description.length}/230 znaków</small>
                    </label>

                    <div className="split-grid">
                      <label className="field">
                        <span>Tagi</span>
                        <input
                          type="text"
                          value={form.tags}
                          onChange={(e) => {
                            const limited = e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean)
                              .slice(0, 5)
                              .join(", ");

                            setForm((prev) => ({ ...prev, tags: limited }));
                          }}
                          placeholder="gaming, community, social"
                        />
                        <small className="muted">Maksymalnie 5 tagów, oddzielonych przecinkami.</small>
                      </label>

                      <label className="field">
                        <span>Invite URL</span>
                        <input
                          type="url"
                          value={form.inviteUrl}
                          onChange={(e) => setForm((prev) => ({ ...prev, inviteUrl: e.target.value }))}
                          placeholder="https://discord.gg/twoj-link"
                        />
                      </label>
                    </div>

                    <div className="button-row">
                      <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                      </button>
                    </div>
                  </form>

                  {notice ? <div className="notice">{notice}</div> : null}
                </section>

                <section className="panel-card glass server-preview-panel">
                  <div className="panel-head simple">
                    <div>
                      <span className="badge">podgląd</span>
                      <h1>Karta serwera</h1>
                    </div>
                  </div>

                  <article className="dashboard-server-preview">
                    <div className="directory-card-head">
                      <div className="server-avatar">
                        {selectedServer.icon ? (
                          <img
                            src={`https://cdn.discordapp.com/icons/${selectedServer.id}/${selectedServer.icon}.png?size=128`}
                            alt={selectedServer.name}
                          />
                        ) : (
                          <span>{selectedServer.name.slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="directory-card-meta">
                        <h3>{selectedServer.name}</h3>
                        <span>{selectedServer.lastBumpAt ? "Aktywny listing" : "Jeszcze bez bumpa"}</span>
                      </div>
                    </div>

                    <div className="tag-list">
                      {(form.tags || "")
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                        .slice(0, 5)
                        .map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      {!form.tags.trim() && <span className="muted">Brak tagów</span>}
                    </div>

                    <p className="server-description clamp-5">
                      {form.description || "Tutaj zobaczysz podgląd opisu serwera po zapisaniu zmian."}
                    </p>

                    <div className="server-footer">
                      <div className="server-metrics">
                        <span className="metric">Bumpy: {selectedServer.bumpCount || 0}</span>
                        <span className="metric">{selectedServer.botInstalled ? "Bot online" : "Bot brak"}</span>
                      </div>
                    </div>
                  </article>
                </section>
              </div>
            </>
          ) : (
            <div className="panel-card glass">
              <h1>Brak wybranego serwera</h1>
              <p className="muted">Zaloguj się przez Discord i wybierz serwer z listy po lewej.</p>
              <div className="button-row">
                <button
                  className="btn btn-primary"
                  onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
                >
                  Zaloguj przez Discord
                </button>
                <button className="btn btn-ghost" onClick={loadServers}>
                  Spróbuj odświeżyć
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
