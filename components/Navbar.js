import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        
        {/* LOGO */}
        <Link href="/" className="navbar-logo">
          <img src="/allserver-logo.png" alt="disbumply" />
          <span>disbumply.pl</span>
        </Link>

        {/* MENU */}
        <nav className="navbar-links">
          <Link href="/servers">Serwery</Link>
          <Link href="/add-server">Dodaj</Link>
          <Link href="/terms">Regulamin</Link>
        </nav>

        {/* AKCJA */}
        <div className="navbar-actions">
          <Link href="/login" className="navbar-btn">
            Zaloguj się
          </Link>
        </div>

      </div>
    </header>
  );
}