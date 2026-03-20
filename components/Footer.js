import Link from "next/link";

const links = [
  { name: "Wszystkie serwery", href: "/allservers" },
  { name: "Dodaj serwer", href: "/dashboard" },
  { name: "FAQ", href: "/faq" },
  { name: "Regulamin", href: "/terms" },
  { name: "Prywatność", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="footer-v3">
      <div className="container">
        <div className="footer-v3__panel glass">
          <div className="footer-v3__grid">
            <div className="footer-v3__brand">
              <div className="brand-mark image-mark footer-v3__brand-mark">
                <img src="/allserver-logo.png" alt="disbumply.pl logo" />
              </div>

              <div>
                <p className="footer-v3__eyebrow">DISBUMPLY.PL</p>
                <h2>Polskie serwery Discord w jednym miejscu</h2>
                <p className="footer-v3__text">
                  Przeglądaj aktywne społeczności, odkrywaj nowe miejsca i dodawaj własny serwer bez zbędnego bałaganu.
                </p>
              </div>
            </div>

            <nav className="footer-v3__nav" aria-label="Linki w stopce">
              <span className="footer-v3__label">Szybkie linki</span>
              {links.map((link) => (
                <Link key={link.name} href={link.href} className="footer-v3__link">
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="footer-v3__contact">
              <span className="footer-v3__label">Kontakt</span>
              <a href="mailto:kontakt@disbumply.pl" className="footer-v3__mail">
                kontakt@disbumply.pl
              </a>
              <p className="footer-v3__text footer-v3__text--small">
                Projekt społecznościowy dla polskich serwerów Discord.
              </p>
            </div>
          </div>

          <div className="footer-v3__bottom">
            <p>© 2026 DISBUMPLY.PL</p>
            <p>Katalog serwerów Discord zaprojektowany spójnie z resztą strony.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
