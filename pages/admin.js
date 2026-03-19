import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import BrandLogo from "../components/BrandLogo";
import DiscordGlyph from "../components/DiscordGlyph";

const ADMIN_DISCORD_ID = "1418289596457812088";
const PAGE_SIZE = 8;

const STATUS_LABELS = {
  pending: "Oczekuje",
  approved: "Zatwierdzony",
  rejected: "Odrzucony"
};

const TYPE_LABELS = {
  public: "Publiczny",
  nsfw: "NSFW"
};


const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "pending", label: "Oczekuje" },
  { value: "approved", label: "Zatwierdzony" },
  { value: "rejected", label: "Odrzucony" }
];

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "public", label: "Publiczny" },
  { value: "nsfw", label: "NSFW" }
];

const BOT_FILTER_OPTIONS = [
  { value: "all", label: "Dowolnie" },
  { value: "withBot", label: "Z botem" },
  { value: "withoutBot", label: "Bez bota" }
];

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function getTypeLabel(type) {
  return TYPE_LABELS[type] || type;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function parsePossibleCount(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getReports(server) {
  const possibleReports = [
    server?.reports,
    server?.reportList,
    server?.reportItems,
    server?.latestReports,
    server?.data?.reports
  ];

  const reports = possibleReports.find(Array.isArray);
  return Array.isArray(reports) ? reports : [];
}

function getReportCount(server) {
  const reports = getReports(server);
  const rawCandidates = [
    server?.reportCount,
    server?.reportsCount,
    server?.totalReports,
    server?.report_count,
    server?._count?.reports,
    server?.counts?.reports,
    server?.stats?.reports,
    server?.data?.reportCount
  ];

  const numericCount = rawCandidates
    .map(parsePossibleCount)
    .find((value) => value !== null);

  return Math.max(reports.length, numericCount ?? 0);
}

function AdminSelect({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <label className="field compact-field">
      <span className="field-label">{label}</span>
      <div className={`custom-select ${open ? "is-open" : ""}`} ref={rootRef}>
        <button
          type="button"
          className="select select-button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>{selectedOption?.label}</span>
        </button>

        <div className="custom-select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${option.value === value ? "is-active" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </label>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [botFilter, setBotFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

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
      if (res.ok) {
        setServers(data.servers || []);
        setNotice("");
      } else {
        setNotice(data.error || "Nie udało się pobrać listy");
      }
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

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, typeFilter, botFilter]);

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
        moderationNote: payload.moderationNote ?? current?.moderationNote ?? "",
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

  const stats = useMemo(() => {
    const approved = servers.filter((server) => server.moderationStatus === "approved").length;
    const pending = servers.filter((server) => server.moderationStatus === "pending").length;
    const rejected = servers.filter((server) => server.moderationStatus === "rejected").length;
    const withBot = servers.filter((server) => server.botInstalled).length;

    return {
      total: servers.length,
      approved,
      pending,
      rejected,
      withBot
    };
  }, [servers]);

  const filteredServers = useMemo(() => {
    const phrase = query.trim().toLowerCase();

    return servers.filter((server) => {
      const matchesQuery =
        !phrase ||
        [server.name, server.description, server.inviteUrl, ...normalizeTags(server.tags)]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(phrase));

      const matchesStatus =
        statusFilter === "all" || server.moderationStatus === statusFilter;
      const matchesType =
        typeFilter === "all" || server.serverType === typeFilter;
      const matchesBot =
        botFilter === "all" ||
        (botFilter === "withBot" ? server.botInstalled : !server.botInstalled);

      return matchesQuery && matchesStatus && matchesType && matchesBot;
    });
  }, [servers, query, statusFilter, typeFilter, botFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredServers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedServers = filteredServers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
          <p className="muted">
            Panel moderacji jest dostępny tylko dla wskazanego konta Discord.
          </p>
          <button
            className="btn btn-primary btn-discord"
            onClick={() => signIn("discord")}
          >
            <DiscordGlyph />
            <span>Zaloguj przez Discord</span>
          </button>
        </div>
      </main>
    );
  }

  if (String(session?.user?.id || "") !== ADMIN_DISCORD_ID) {
    return (
      <main className="panel-page">
        <div className="panel-only glass">
          <span className="badge">brak dostępu</span>
          <h1>Ten panel nie jest dla tego konta</h1>
          <p className="muted">
            Moderacja jest widoczna tylko dla jednego konkretnego ID Discord.
          </p>
          <div className="button-row top-gap">
            <Link href="/" className="btn btn-ghost">
              Strona główna
            </Link>
            <button
              className="btn btn-ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
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
        <title>Panel Moderów DISBUMPLY.PL</title>
      </Head>

      <main className="site-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <header className="topbar container">
          <BrandLogo />

          <div className="topbar-actions">
            <button
              className="btn btn-ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Wyloguj Discord
            </button>
          </div>
        </header>

        <section className="admin-section container">
          {!authenticated ? (
            <div className="panel-only glass">
              <span className="badge">admin login</span>
              <h1>Moderacja listingów</h1>
              <p className="muted">
                Konto Discord jest poprawne. Teraz wpisz hasło admina.
              </p>

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
                  <button className="btn btn-primary" type="submit">
                    Zaloguj
                  </button>
                </div>
              </form>

              {notice ? <div className="notice">{notice}</div> : null}
            </div>
          ) : (
            <div className="panel-card glass admin-panel-pro">
              <div className="section-head section-head-pro">
                <div>
                  <span className="badge">moderacja</span>
                  <h2>Panel serwerów</h2>
                  <p>
                    Masz wyszukiwarkę, filtry i czytelny podgląd zgłoszeń.
                    Wreszcie da się to ogarnąć bez walki z interfejsem.
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={loadServers}>
                  Odśwież
                </button>
              </div>

              <div className="admin-stats-grid">
                <div className="metric-box soft-card">
                  <span>Wszystkie</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="metric-box soft-card">
                  <span>Oczekujące</span>
                  <strong>{stats.pending}</strong>
                </div>
                <div className="metric-box soft-card">
                  <span>Zatwierdzone</span>
                  <strong>{stats.approved}</strong>
                </div>
                <div className="metric-box soft-card">
                  <span>Odrzucone</span>
                  <strong>{stats.rejected}</strong>
                </div>
                <div className="metric-box soft-card">
                  <span>Z botem</span>
                  <strong>{stats.withBot}</strong>
                </div>
              </div>

              <div className="toolbar-panel soft-card">
                <div className="toolbar-row toolbar-grid-admin">
                  <label className="searchbar-clean searchbar-block">
                    <span className="field-label">Szukaj serwera</span>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Nazwa, opis, tag, invite URL..."
                    />
                  </label>

                  <AdminSelect
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={STATUS_FILTER_OPTIONS}
                  />

                  <AdminSelect
                    label="Typ serwera"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={TYPE_FILTER_OPTIONS}
                  />

                  <AdminSelect
                    label="Bot"
                    value={botFilter}
                    onChange={setBotFilter}
                    options={BOT_FILTER_OPTIONS}
                  />
                </div>

                <div className="toolbar-row toolbar-summary">
                  <span className="muted">
                    Wyniki: <strong>{filteredServers.length}</strong>
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setQuery("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setBotFilter("all");
                    }}
                  >
                    Reset filtrów
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="state-card glass">Ładowanie serwerów...</div>
              ) : !filteredServers.length ? (
                <div className="state-card glass">
                  Brak serwerów pasujących do filtrów.
                </div>
              ) : (
                <>
                  <div className="table-shell soft-card">
                    <div className="table-scroll">
                      <table className="server-table">
                        <thead>
                          <tr>
                            <th>Serwer</th>
                            <th>Status</th>
                            <th>Typ</th>
                            <th>Bot</th>
                            <th>Bumpy</th>
                            <th>Invite</th>
                            <th>Zgłoszenia</th>
                            <th>Akcje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedServers.map((server) => {
                            const expanded = expandedId === server.id;
                            const tags = normalizeTags(server.tags);
                            const reports = getReports(server);
                            const reportCount = getReportCount(server);
                            const hasReports = reportCount > 0 || reports.length > 0;

                            return (
                              <Fragment key={server.id}>
                                <tr>
                                  <td>
                                    <div className="server-cell-main">
                                      <strong>{server.name}</strong>
                                      <span>{server.description || "Brak opisu"}</span>
                                      <div className="tag-list compact-tags">
                                        {tags.length ? (
                                          tags
                                            .slice(0, 4)
                                            .map((tag) => (
                                              <span key={tag} className="tag">
                                                #{tag}
                                              </span>
                                            ))
                                        ) : (
                                          <span className="muted">Brak tagów</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={`status-pill ${
                                        server.moderationStatus === "approved"
                                          ? "ok"
                                          : server.moderationStatus === "rejected"
                                          ? "danger"
                                          : "warn"
                                      }`}
                                    >
                                      {getStatusLabel(server.moderationStatus)}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`server-type-pill ${
                                        server.serverType === "nsfw" ? "nsfw" : "public"
                                      }`}
                                    >
                                      {getTypeLabel(server.serverType)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="metric inline-metric">
                                      {server.botInstalled ? "Tak" : "Nie"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="metric inline-metric">
                                      {server.bumpCount || 0}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="metric inline-metric">
                                      {server.inviteUrl ? "Jest" : "Brak"}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="metric inline-metric">
                                      {reportCount}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="table-actions">
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() =>
                                          updateServer(server.id, {
                                            moderationStatus: "approved"
                                          })
                                        }
                                      >
                                        Zatwierdź
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() =>
                                          setExpandedId(expanded ? null : server.id)
                                        }
                                      >
                                        {expanded ? "Ukryj" : "Szczegóły"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {expanded && (
                                  <tr className="detail-row">
                                    <td colSpan={8}>
                                      <div className="detail-panel">
                                        <div className="detail-grid detail-grid-pro">
                                          <div className="detail-block">
                                            <span className="detail-label">
                                              Opis zgłoszenia
                                            </span>
                                            <p>{server.description || "Brak opisu."}</p>
                                          </div>

                                          <div className="detail-block">
                                            <span className="detail-label">
                                              Invite URL
                                            </span>
                                            <p className="break-anywhere">
                                              {server.inviteUrl ||
                                                "Nie ustawiono invite URL."}
                                            </p>
                                          </div>

                                          <div className="detail-block">
                                            <span className="detail-label">Tagi</span>
                                            <div className="tag-list">
                                              {tags.length ? (
                                                tags.map((tag) => (
                                                  <span key={tag} className="tag">
                                                    #{tag}
                                                  </span>
                                                ))
                                              ) : (
                                                <span className="muted">Brak tagów</span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="detail-block detail-block-wide">
                                            <span className="detail-label">
                                              Zgłoszenia serwera
                                            </span>
                                            {hasReports ? (
                                              <div className="reports-stack">
                                                <div className="reports-summary">
                                                  Łącznie zgłoszeń:{" "}
                                                  <strong>{reportCount}</strong>
                                                </div>

                                                {reports.length ? (
                                                  <div className="reports-list">
                                                    <div className="reports-table-wrap">
                                                      <table className="reports-table reports-table-detail">
                                                        <thead>
                                                          <tr>
                                                            <th>#</th>
                                                            <th>Powód</th>
                                                            <th>Autor</th>
                                                            <th>Data</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody>
                                                          {reports.map((report, index) => (
                                                            <tr key={report.id || index}>
                                                              <td>{index + 1}</td>
                                                              <td>{report.reason || "Brak podanego powodu."}</td>
                                                              <td>{report.userDiscordId || "Brak danych"}</td>
                                                              <td>
                                                                {report.createdAt
                                                                  ? new Date(report.createdAt).toLocaleString("pl-PL")
                                                                  : "Brak daty"}
                                                              </td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </div>

                                                    <div className="reports-cards">
                                                      {reports.map((report, index) => (
                                                        <div
                                                          key={`${report.id || index}-card`}
                                                          className="report-item"
                                                        >
                                                          <div className="report-item-top">
                                                            <strong>Zgłoszenie #{index + 1}</strong>
                                                            <span className="tiny-badge">
                                                              {report.createdAt
                                                                ? new Date(report.createdAt).toLocaleString("pl-PL")
                                                                : "Brak daty"}
                                                            </span>
                                                          </div>
                                                          <p>
                                                            {report.reason || "Brak podanego powodu."}
                                                          </p>
                                                          <span className="muted small">
                                                            Autor: {report.userDiscordId || "Brak danych"}
                                                          </span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <p className="muted">
                                                    Licznik zgłoszeń jest dostępny, ale API nie zwróciło pełnej listy
                                                    treści zgłoszeń.
                                                  </p>
                                                )}
                                              </div>
                                            ) : (
                                              <p>
                                                Brak zgłoszeń dla tego serwera.
                                              </p>
                                            )}
                                          </div>

                                          <div className="detail-block">
                                            <span className="detail-label">
                                              Moderacja
                                            </span>
                                            <div className="button-row card-actions">
                                              <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                  updateServer(server.id, {
                                                    moderationStatus: "approved"
                                                  })
                                                }
                                              >
                                                Zatwierdź
                                              </button>
                                              <button
                                                className="btn btn-ghost"
                                                onClick={() =>
                                                  updateServer(server.id, {
                                                    moderationStatus: "pending"
                                                  })
                                                }
                                              >
                                                Ustaw oczekuje
                                              </button>
                                              <button
                                                className="btn btn-danger"
                                                onClick={() =>
                                                  updateServer(server.id, {
                                                    moderationStatus: "rejected"
                                                  })
                                                }
                                              >
                                                Odrzuć
                                              </button>
                                              <Link
                                                className="btn btn-ghost"
                                                href={`/servers/${server.id}`}
                                              >
                                                Podgląd
                                              </Link>
                                            </div>
                                          </div>

                                          <div className="detail-block detail-block-wide">
                                            <span className="detail-label">
                                              Rodzaj serwera
                                            </span>
                                            <div className="button-row card-actions">
                                              <button
                                                className={`btn ${
                                                  server.serverType === "public"
                                                    ? "btn-primary"
                                                    : "btn-ghost"
                                                }`}
                                                onClick={() =>
                                                  updateServer(server.id, {
                                                    serverType: "public"
                                                  })
                                                }
                                              >
                                                Ustaw publiczny
                                              </button>
                                              <button
                                                className={`btn ${
                                                  server.serverType === "nsfw"
                                                    ? "btn-danger"
                                                    : "btn-ghost"
                                                }`}
                                                onClick={() =>
                                                  updateServer(server.id, {
                                                    serverType: "nsfw"
                                                  })
                                                }
                                              >
                                                Ustaw NSFW
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pagination-row">
                    <button
                      className="btn btn-ghost"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Poprzednia
                    </button>
                    <span className="metric">
                      Strona {currentPage} / {totalPages}
                    </span>
                    <button
                      className="btn btn-ghost"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                    >
                      Następna
                    </button>
                  </div>
                </>
              )}

              {notice ? <div className="notice top-gap">{notice}</div> : null}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
