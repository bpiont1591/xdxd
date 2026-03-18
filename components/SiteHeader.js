import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import BrandLogo from "./BrandLogo";
import DiscordGlyph from "./DiscordGlyph";

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export default function SiteHeader({ backHref = null, backLabel = "POWRÓT" }) {
  const { data: session, status } = useSession();
  const isModerator = String(session?.user?.id || "") === "1418289596457812088";
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const menuRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY || 0;
      const goingDown = currentY > lastScrollY.current;
      const shouldHide = currentY > 120 && goingDown;
      setHidden(shouldHide);
      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const moreLinks = useMemo(() => {
    const links = [
      { href: "/terms", label: "Regulamin" },
      { href: "/allservers", label: "Wszystkie serwery" },
    ];

    if (backHref) {
      links.unshift({ href: backHref, label: backLabel });
    }

    return links;
  }, [backHref, backLabel]);

  return (
    <header className={`topbar container site-header-muted ${hidden ? "is-hidden" : ""}`}>
      <BrandLogo subtitle="LISTA SERWERÓW DISCORD" />

      <div className="topbar-actions site-header-actions">
        <Link href="/allservers" className="btn btn-ghost btn-soft">
          Serwery
        </Link>

        <div className={`header-more ${menuOpen ? "is-open" : ""}`} ref={menuRef}>
          <button
            type="button"
            className="btn btn-ghost btn-soft header-more-trigger"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <MoreIcon />
            <span>Więcej</span>
          </button>

          <div className="header-more-menu" role="menu">
            {moreLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="header-more-link"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {status === "authenticated" ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost btn-soft">
              Dashboard
            </Link>

            {isModerator ? (
              <Link href="/admin" className="btn btn-ghost btn-soft">
                Moderacja
              </Link>
            ) : null}

            <button
              type="button"
              className="btn btn-ghost btn-soft"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Wyloguj
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-discord btn-soft-primary"
            onClick={() => signIn("discord")}
          >
            <DiscordGlyph />
            <span>Zaloguj się</span>
          </button>
        )}
      </div>
    </header>
  );
}
