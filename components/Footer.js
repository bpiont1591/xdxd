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
    <footer className="footer-v2">
      <div className="footer-v2__container">
        <div className="footer-v2__top">
          <div className="footer-v2__brand">
            <img
              src="/allserver-logo.png"
              alt="disbumply.pl logo"
              className="footer-v2__logo"
            />
            <div>
              <p className="footer-v2__eyebrow">DISBUMPLY.PL</p>
              <h2>Polskie serwery Discord w jednym miejscu</h2>
              <p className="footer-v2__text">
                Znajdziesz tu aktywne społeczności, a swój serwer dodasz bez zbędnego kombinowania.
              </p>
            </div>
          </div>

          <nav className="footer-v2__nav" aria-label="Stopka">
            {links.map((link) => (
              <Link key={link.name} href={link.href} className="footer-v2__link">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="footer-v2__contact">
            <span className="footer-v2__label">Kontakt</span>
            <a href="mailto:kontakt@disbumply.pl" className="footer-v2__mail">
              kontakt@disbumply.pl
            </a>
            <p className="footer-v2__text footer-v2__text--small">
              Projekt niezależny, bez powiązania z Discord Inc.
            </p>
          </div>
        </div>

        <div className="footer-v2__bottom">
          <p>© 2026 DISBUMPLY.PL</p>
          <p>Prosty katalog serwerów, bez śmieci i martwych list.</p>
        </div>
      </div>
    </footer>
  );
}
