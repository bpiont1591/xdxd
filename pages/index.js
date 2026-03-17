import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import DiscordServerIcon from "../components/DiscordServerIcon";

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
        setMeta(data.meta || {});
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServers();
  }, []);

  const featuredCategories = useMemo(
    () => meta.categories?.slice(0, 10) || [],
    [meta.categories]
  );

  const isModerator =
    String(session?.user?.id || "") === "1418289596457812088";

  return (
    <>
      <Head>
        <title>Bumply</title>
      </Head>

      <main className="site-shell directory-home home-v11">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        {/* HEADER */}
        <header className="topbar container">
          <Link href="/" className="brand brand-link">
            <img
              src="/bumply-logo.svg"
              alt="Bumply"
              style={{ height: "56px" }}
            />
          </Link>

          <div className="topbar-actions">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost">
                  Dashboard
                </Link>
                {isModerator && (
                  <Link href="/admin" className="btn btn-ghost">
                    Moderacja
                  </Link>
                )}
                <button
                  className="btn btn-ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => signIn("discord")}
              >
                Zaloguj przez Discord
              </button>
            )}
          </div>
        </header>

        {/* HERO */}
        <section className="home-v9-hero container glass">
          <div className="home-v9-hero-copy">
            <h1>Znajdź aktywne serwery Discord</h1>
            <p>Przeglądaj kategorie i znajdź coś dla siebie.</p>
          </div>

          <form
            className="directory-search"
            onSubmit={(e) => {
              e.preventDefault();
              loadServers();
            }}
          >
            <input
              type="text"
              placeholder="Szukaj..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary">Szukaj</button>
          </form>
        </section>
      </main>
    </>
  );
}