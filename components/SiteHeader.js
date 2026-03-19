import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const ADMIN_DISCORD_ID = "1418289596457812088";

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
    </svg>
  );
}

function IconServers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v4H4V5zm0 5h16v4H4v-4zm0 5h16v4H4v-4z" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5h2v14h-2V5zm-6 6h14v2H5v-2z" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4V4zm9 0h7v4h-7V4zM4 13h4v7H4v-7zm6 0h10v7H10v-7z" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 10a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h9l5 5v15H6V2zm8 1.5V8h4.5L14 3.5zM8 11h8v2H8v-2zm0 4h8v2H8v-2z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 5h20v14H2V5zm10 7L4 7v10h16V7l-8 5z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l8 4v5c0 5.5-3.8 9.8-8 11-4.2-1.2-8-5.5-8-11V6l8-4z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 4H4v16h6v-2H6V6h4V4zm7.59 7L14 7.41 15.41 6 21.83 12l-6.42 6L14 16.59 17.59 13H9v-2h8.59z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v2H4V7zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.3z" />
    </svg>
  );
}

export default function SiteHeader() {
  const { data: session, status } = useSession();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [openMore, setOpenMore] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const isModerator = String(session?.user?.id || "") === ADMIN_DISCORD_ID;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (!openMobile && y > lastY && y > 140) setHidden(true);
      else setHidden(false);
      setLastY(y);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY, openMobile]);

  useEffect(() => {
    const close = () => {
      setOpenMore(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 820) setOpenMobile(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openMobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openMobile]);

  const closeMenus = () => {
    setOpenMore(false);
    setOpenMobile(false);
  };

  return (
    <div className={`site-header-wrap ${hidden ? "is-hidden" : ""}`}>
      <header className="site-header container">
        <Link href="/" className="site-header-logo" aria-label="Przejdź na stronę główną" onClick={closeMenus}>
          <img src="/allserver-logo.png" alt="disbumply.pl" />
          <span>DISCBUMPLY.PL</span>
        </Link>

        <button
          type="button"
          className="site-mobile-toggle"
          aria-label={openMobile ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={openMobile}
          onClick={() => setOpenMobile((v) => !v)}
        >
          <span className="site-nav-icon">{openMobile ? <IconClose /> : <IconMenu />}</span>
        </button>

        <nav className={`site-header-nav ${openMobile ? "is-open" : ""}`} aria-label="Główna nawigacja">
          <Link href="/" className="site-nav-link" onClick={closeMenus}>
            <span className="site-nav-icon"><IconHome /></span>
            <span>Start</span>
          </Link>

          <Link href="/allservers" className="site-nav-link" onClick={closeMenus}>
            <span className="site-nav-icon"><IconServers /></span>
            <span>Serwery</span>
          </Link>

          {status === "authenticated" ? (
            <Link href="/dashboard" className="site-nav-link site-nav-link-primary" onClick={closeMenus}>
              <span className="site-nav-icon"><IconDashboard /></span>
              <span>Dashboard</span>
            </Link>
          ) : (
            <button
              type="button"
              className="site-nav-link site-nav-link-primary"
              onClick={() => {
                closeMenus();
                signIn("discord");
              }}
            >
              <span className="site-nav-icon"><IconPlus /></span>
              <span>Zaloguj</span>
            </button>
          )}

          <div className="site-nav-more" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="site-nav-link"
              onClick={() => setOpenMore((v) => !v)}
            >
              <span className="site-nav-icon"><IconMore /></span>
              <span>Więcej</span>
            </button>

            {openMore ? (
              <div className="site-nav-dropdown">
                <Link href="/terms" className="site-dropdown-link" onClick={closeMenus}>
                  <span className="site-nav-icon"><IconFile /></span>
                  <span>Regulamin</span>
                </Link>
                <Link href="/privacy" className="site-dropdown-link" onClick={closeMenus}>
                  <span className="site-nav-icon"><IconShield /></span>
                  <span>Prywatność</span>
                </Link>
                <a href="mailto:kontakt@disbumply.pl" className="site-dropdown-link" onClick={closeMenus}>
                  <span className="site-nav-icon"><IconMail /></span>
                  <span>Kontakt</span>
                </a>
                {isModerator ? (
                  <Link href="/admin" className="site-dropdown-link" onClick={closeMenus}>
                    <span className="site-nav-icon"><IconShield /></span>
                    <span>Moderacja</span>
                  </Link>
                ) : null}
                {status === "authenticated" ? (
                  <button
                    type="button"
                    className="site-dropdown-link site-dropdown-button"
                    onClick={() => {
                      closeMenus();
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <span className="site-nav-icon"><IconLogout /></span>
                    <span>Wyloguj</span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </nav>
      </header>
    </div>
  );
}
