import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <img src="/allserver-logo.png" alt="disbumply" />
          <span>DISBUMPLY.PL</span>
        </Link>

        <nav className="navbar-links">
          <Link href="/allservers">Lista serwerów Discord</Link>
          <Link href="/dashboard">Dodaj serwer</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <div className="navbar-actions">
          {status === "authenticated" ? (
            <button className="navbar-btn" onClick={() => signOut({ callbackUrl: "/" })}>
              Wyloguj się
            </button>
          ) : (
            <button className="navbar-btn" onClick={() => signIn("discord")}>
              Zaloguj się
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
