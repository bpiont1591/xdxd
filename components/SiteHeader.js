import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import BrandLogo from "./BrandLogo";
import DiscordGlyph from "./DiscordGlyph";

export default function SiteHeader({ backHref = null, backLabel = "POWRÓT" }) {
  const { data: session, status } = useSession();
  const isModerator = String(session?.user?.id || "") === "1418289596457812088";

  return (
    <header className="topbar container site-header-muted">
      <BrandLogo subtitle="LISTA SERWERÓW DISCORD" />

      <div className="topbar-actions">
        <Link href="/allservers" className="btn btn-ghost btn-soft">
          SERWERY
        </Link>

        <Link href="/terms" className="btn btn-ghost btn-soft">
          REGULAMIN
        </Link>

        {backHref ? (
          <Link href={backHref} className="btn btn-ghost btn-soft">
            {backLabel}
          </Link>
        ) : null}

        {status === "authenticated" ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost btn-soft">
              DASHBOARD
            </Link>

            {isModerator ? (
              <Link href="/admin" className="btn btn-ghost btn-soft">
                MODERACJA
              </Link>
            ) : null}

            <button
              className="btn btn-ghost btn-soft"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              WYLOGUJ
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary btn-discord btn-soft-primary"
            onClick={() => signIn("discord")}
          >
            <DiscordGlyph />
            <span>ZALOGUJ SIĘ</span>
          </button>
        )}
      </div>
    </header>
  );
}
