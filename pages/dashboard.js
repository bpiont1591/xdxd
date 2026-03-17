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

  const loadServers = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const res = await fetch("/api/servers");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Nie udało się pobrać serwerów");

      setServers(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        const stillExists = selectedId && data.find((x) => x.id === selectedId);
        setSelectedId(stillExists ? selectedId : "");
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
  }, [status, loadServers]);

  const selectedServer = useMemo(
    () => servers.find((server) => server.id === selectedId),
    [servers, selectedId]
  );

  if (status === "loading") {
    return <main className="panel-page"><div className="panel-only glass">Ładowanie...</div></main>;
  }

  if (status === "unauthenticated") {
    return (
      <main className="panel-page">
        <div className="panel-only glass">
          <h1>Zaloguj się</h1>
          <button className="btn btn-primary" onClick={() => signIn("discord")}>
            Login Discord
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head><title>Dashboard</title></Head>

      <main className="dashboard-shell dashboard-v10">
        <aside className="sidebar visible-sidebar">
          <button className="btn btn-primary" onClick={loadServers}>
            Dodaj serwer
          </button>

          <div className="server-list">
            {servers.length === 0 ? (
              <div className="empty-box">Brak dostępnych serwerów</div>
            ) : (
              servers.map((s) => (
                <button key={s.id} onClick={() => setSelectedId(s.id)} className="server-item">
                  {s.name}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="content-panel">
          {selectedServer ? (
            <div className="panel-card glass">
              <h1>{selectedServer.name}</h1>
              <p>Panel serwera</p>
            </div>
          ) : (
            <div className="panel-card glass dashboard-empty-main">
              <div className="dashboard-empty-icon">+</div>
              <h1>Nie wybrano serwera</h1>
              <p className="muted">Kliknij Dodaj serwer</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
