import Link from "next/link";

const usefulLinks = [
  { name: "Warunki korzystania", href: "/terms" },
  { name: "Polityka prywatności", href: "/privacy" },
  { name: "Wszystkie serwery", href: "/servers" },
  { name: "Dodaj nowy serwer", href: "/add-server" },
];

const otherLinks = [
  { name: "Facebook", href: "#" },
  { name: "Promuj serwer", href: "/promote" },
];

const helpLinks = [
  { name: "Kontakt", href: "/contact" },
  { name: "kontakt@disbumply.pl", href: "mailto:kontakt@disbumply.pl" },
  { name: "Serwer Discord", href: "#" },
  { name: "Baza wiedzy", href: "/help" },
];

function FooterLink({ href, children }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a href={href} className="footer-pill" target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-pill">
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-column">
            <div className="footer-brand">
              <img
                src="/allserver-logo.png"
                alt="disbumply.pl logo"
                className="footer-image-logo"
              />
              <h2>disbumply.pl</h2>
            </div>

            <p className="footer-description">
              disbumply.pl to katalog polskich serwerów Discord. Odkrywaj nowe
              społeczności, promuj własny serwer i trafiaj do ludzi, którzy
              faktycznie szukają aktywnej ekipy, a nie kolejnej martwej listy.
            </p>

            <p className="footer-madeby">
              Stworzone z <span>❤</span> dla społeczności Discord
            </p>
          </div>

          <div>
            <h3>Przydatne linki</h3>
            <div className="footer-links">
              {usefulLinks.map((link) => (
                <FooterLink key={link.name} href={link.href}>
                  {link.name}
                </FooterLink>
              ))}
            </div>
          </div>

          <div>
            <h3>Inne</h3>
            <div className="footer-links">
              {otherLinks.map((link) => (
                <FooterLink key={link.name} href={link.href}>
                  {link.name}
                </FooterLink>
              ))}
            </div>
          </div>

          <div>
            <h3>Pomoc</h3>
            <div className="footer-links">
              {helpLinks.map((link) => (
                <FooterLink key={link.name} href={link.href}>
                  {link.name}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 disbumply.pl. Wszelkie prawa zastrzeżone.</p>
          <p>Ta strona nie jest powiązana z Discord Inc.</p>
        </div>
      </div>
    </footer>
  );
}
