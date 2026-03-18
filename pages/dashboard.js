import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import DiscordServerIcon from "../components/DiscordServerIcon";

const defaultForm = {
  description: "",
  tags: [],
  tagInput: "",
  inviteUrl: "",
  serverType: "public",
};

const MAX_TAGS = 5;
const MAX_DESCRIPTION = 250;

function normalizeTag(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .slice(0, 24);
}

function buildTags(input = "", existing = []) {
  const next = [...existing];
  for (const raw of String(input || "").split(",")) {
    const tag = normalizeTag(raw);
    if (!tag || next.includes(tag)) continue;
    next.push(tag);
    if (next.length >= MAX_TAGS) break;
  }
  return next.slice(0, MAX_TAGS);
}

function formatCommunityStats(server) {
  const online = Number(server?.onlineCount || 0);
  const total = Number(server?.memberCount || 0);

  if (online > 0 && total > 0) return `${online} online • ${total} razem`;
  if (total > 0) return `${total} członków`;
  return "Brak danych o społeczności";
}

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

  async function loadServers() {
    setLoading(true);
    setNotice("");

    try {
      const res = await fetch("/api/servers");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Nie udało się pobrać serwerów");

      setServers(data);

      if (data.length > 0) {
        const nextId =
          selectedId && data.find((x) => x.id === selectedId)
            ? selectedId
            : data[0].id;
        setSelectedId(nextId);
      } else {
        setSelectedId("");
      }
    } catch (err) {
      setNotice(err.message || "Błąd pobierania");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadServers();
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedId),
    [servers, selectedId]
  );

  useEffect(() => {
    if (selectedServer) {
      setForm({
        description: selectedServer.description || "",
        tags: Array.isArray(selectedServer.tags)
          ? selectedServer.tags.slice(0, MAX_TAGS)
          : [],
        tagInput: "",
        inviteUrl: selectedServer.inviteUrl || "",
        serverType: selectedServer.serverType === "nsfw" ? "nsfw" : "public",
      });
    } else {
      setForm(defaultForm);
    }
  }, [selectedServer]);

  async function saveServer(e) {
    e.preventDefault();
    if (!selectedServer) return;

    setSaving(true);
    setNotice("");

    const finalTags = buildTags(form.tagInput, form.tags);

    try {
      const res = await fetch(`/api/servers/${selectedServer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description.slice(0, MAX_DESCRIPTION),
          tags: finalTags,
          inviteUrl: form.inviteUrl,
          serverType: form.serverType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się zapisać");

      setServers((prev) =>
        prev.map((server) =>
          server.id === data.id ? { ...server, ...data } : server
        )
      );
      setForm((prev) => ({ ...prev, tags: finalTags, tagInput: "" }));
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
          <h1>Musisz się zalogować</h1>
          <p className="muted">
            Bez Discord OAuth nie wiemy jakimi serwerami zarządzasz.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => signIn("discord")}
          >
            Zaloguj przez Discord
          </button>
        </div>
      </main>
    );
  }

  const botAddUrl = selectedServer
    ? `https://discord.com/oauth2/authorize?client_id=${
        process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || ""
      }&scope=bot%20applications.commands&permissions=32&guild_id=${
        selectedServer.id
      }&disable_guild_select=true`
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
        <title>Dashboard • Bumply</title>
      </Head>

      <main className="dashboard-shell premium dashboard-v10">
        <aside className="sidebar glass dashboard-sidebar slim-sidebar visible-sidebar">
          <div className="sidebar-header deluxe">
            <Link href="/" className="brand brand-link">
              <img
                src="/bumply-logo.png"
                alt="Bumply"
                className="site-logo site-logo--sidebar"
              />
            </Link>

            <button
              className="btn btn-ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
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
                <p className="muted small">
                  {session?.user?.email || "Discord OAuth"}
                </p>
              </div>
            </div>
          </div>

          <div className="sidebar-block">
            <div className="section-label">Twoje serwery</div>

            {loading ? (
              <div className="server-list">
                <div className="server-item active">Ładowanie serwerów...</div>
              </div>
            ) : servers.length === 0 ? (
              <div className="empty-box">
                Nie znaleziono serwerów, gdzie jesteś ownerem albo masz Manage
                Server.
              </div>
            ) : (
              <div className="server-list deluxe-list visible-list">
                {servers.map((server) => (
                  <button
                    key={server.id}
                    className={`server-item rich-server-item ${
                      server.id === selectedId ? "active" : ""
                    }`}
                    onClick={() => setSelectedId(server.id)}
                  >
                    <div className="server-icon">
                      {server.icon ? (
                        <DiscordServerIcon server={server} size={128} />
                      ) : (
                        <span>{server.name.slice(0, 1)}</span>
                      )}
                    </div>

                    <div className="server-meta">
                      <strong>{server.name}</strong>
                      <span>{server.permissionLabel}</span>
                    </div>

                    <div className="server-item-badges">
                      <span
                        className={`tiny-badge ${
                          server.botInstalled ? "ok" : "warn"
                        }`}
                      >
                        {server.botInstalled ? "Bot" : "Brak bota"}
                      </span>
                    </div>
                  </button>
                ))}
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
                      <DiscordServerIcon server={selectedServer} size={256} />
                    ) : (
                      <span>{selectedServer.name.slice(0, 1)}</span>
                    )}
                  </div>

                  <div className="banner-copy">
                    <span className="badge">wybrany serwer</span>
                    <h1>{selectedServer.name}</h1>
                    <div className="tag-list top-gap">
                      <span className="presence-pill presence-pill--wide">
                        <span className="presence-dot" />
                        {formatCommunityStats(selectedServer)}
                      </span>
                      <span
                        className={`status-pill ${
                          selectedServer.botInstalled ? "ok" : "warn"
                        }`}
                      >
                        {selectedServer.botInstalled
                          ? "Bot aktywny"
                          : "Bot nie dodany"}
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
                      <span
                        className={`status-pill ${
                          selectedServer.serverType === "nsfw"
                            ? "danger"
                            : "ok"
                        }`}
                      >
                        {selectedServer.serverType === "nsfw"
                          ? "NSFW"
                          : "Publiczny"}
                      </span>
                      <span className="metric">
                        {selectedServer.permissionLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="button-row compact-actions">
                  <a
                    className="btn btn-primary"
                    href={botAddUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Dodaj bota
                  </a>
                  <Link
                    className="btn btn-ghost"
                    href={`/servers/${selectedServer.id}`}
                  >
                    Podgląd strony
                  </Link>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={loadServers}
                  >
                    Odśwież
                  </button>
                </div>
              </div>

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
                  <span className="overview-label">Społeczność</span>
                  <strong>{formatCommunityStats(selectedServer)}</strong>
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
                        rows={8}
                        maxLength={MAX_DESCRIPTION}
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value.slice(
                              0,
                              MAX_DESCRIPTION
                            ),
                          }))
                        }
                        placeholder="Opisz serwer krótko i konkretnie."
                      />
                      <small className="muted">
                        {form.description.length}/{MAX_DESCRIPTION} znaków
                      </small>
                    </label>

                    <div className="split-grid">
                      <label className="field">
                        <span>Tagi</span>
                        <input
                          type="text"
                          value={form.tagInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.includes(",")) {
                              setForm((prev) => ({
                                ...prev,
                                tags: buildTags(value, prev.tags),
                                tagInput: "",
                              }));
                              return;
                            }

                            setForm((prev) => ({ ...prev, tagInput: value }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "," || e.key === "Enter") {
                              e.preventDefault();
                              setForm((prev) => ({
                                ...prev,
                                tags: buildTags(prev.tagInput, prev.tags),
                                tagInput: "",
                              }));
                            }

                            if (
                              e.key === "Backspace" &&
                              !form.tagInput &&
                              form.tags.length
                            ) {
                              e.preventDefault();
                              setForm((prev) => ({
                                ...prev,
                                tags: prev.tags.slice(0, -1),
                              }));
                            }
                          }}
                          onBlur={() => {
                            if (!form.tagInput.trim()) return;
                            setForm((prev) => ({
                              ...prev,
                              tags: buildTags(prev.tagInput, prev.tags),
                              tagInput: "",
                            }));
                          }}
                          placeholder="gaming, community, social"
                          disabled={form.tags.length >= MAX_TAGS}
                        />
                        <small className="muted">
                          Wpisz tag i naciśnij przecinek albo Enter.
                          Maksymalnie {MAX_TAGS} tagów.
                        </small>

                        <div className="tag-list top-gap">
                      <span className="presence-pill presence-pill--wide">
                        <span className="presence-dot" />
                        {formatCommunityStats(selectedServer)}
                      </span>
                          {form.tags.length ? (
                            form.tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                className="tag"
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    tags: prev.tags.filter(
                                      (item) => item !== tag
                                    ),
                                  }))
                                }
                                title="Usuń tag"
                              >
                                #{tag} ×
                              </button>
                            ))
                          ) : (
                            <span className="muted">Brak tagów</span>
                          )}
                        </div>
                      </label>

                      <label className="field">
                        <span>Invite URL</span>
                        <input
                          type="url"
                          value={form.inviteUrl}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              inviteUrl: e.target.value,
                            }))
                          }
                          placeholder="https://discord.gg/twoj-link"
                        />
                      </label>

                      <label className="field">
                        <span>Rodzaj serwera</span>
                        <div className="select-wrap dashboard-select-wrap">
                        <select
                          className="select select-dark"
                          value={form.serverType}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              serverType:
                                e.target.value === "nsfw" ? "nsfw" : "public",
                            }))
                          }
                        >
                          <option value="public">Publiczny</option>
                          <option value="nsfw">NSFW</option>
                        </select>
                        </div>
                        <small className="muted">
                          Ustaw czy listing ma być zwykły publiczny czy
                          oznaczony jako NSFW.
                        </small>
                      </label>
                    </div>

                    <div className="button-row">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={saving}
                      >
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
                          <DiscordServerIcon
                            server={selectedServer}
                            size={128}
                          />
                        ) : (
                          <span>{selectedServer.name.slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="directory-card-meta">
                        <h3>{selectedServer.name}</h3>
                        <span className="presence-pill presence-pill--compact top-gap-small">
                          <span className="presence-dot" />
                          {formatCommunityStats(selectedServer)}
                        </span>
                        <span>
                          {selectedServer.lastBumpAt
                            ? "Aktywny listing"
                            : "Jeszcze bez bumpa"}
                        </span>
                      </div>
                    </div>

                    <div className="tag-list">
                      {form.tags.length ? (
                        form.tags.map((tag) => (
                          <span key={tag} className="tag">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="muted">Brak tagów</span>
                      )}
                    </div>

                    <p className="server-description clamp-5">
                      {form.description ||
                        "Tutaj zobaczysz podgląd opisu serwera po zapisaniu zmian."}
                    </p>

                    <div className="server-footer">
                      <div className="server-metrics">
                        <span className="metric">
                          Bumpy: {selectedServer.bumpCount || 0}
                        </span>
                        <span className="metric">
                          {selectedServer.botInstalled
                            ? "Bot online"
                            : "Bot brak"}
                        </span>
                        <span className={`server-type-pill ${form.serverType === "nsfw" ? "nsfw" : "public"}`}>
                          {form.serverType === "nsfw" ? "NSFW 🔞" : "Publiczny"}
                        </span>
                      </div>
                    </div>
                  </article>
                </section>
              </div>
            </>
          ) : (
            <div className="panel-card glass">
              <h1>Brak wybranego serwera</h1>
              <p className="muted">Wybierz serwer z listy po lewej.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}