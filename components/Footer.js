import Link from "next/link";

const usefulLinks = [
  { name: "Wszystkie serwery", href: "/allservers" },
  { name: "Dodaj serwer", href: "/dashboard" },
  { name: "Regulamin", href: "/terms" },
];

const helpLinks = [
  { name: "Kontakt", href: "mailto:kontakt@disbumply.pl" },
  { name: "Discord", href: "#" },
];

function FooterLink({ href, children }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href === "#";

  if (isExternal) {
    return (
      <a href={href} className="footer-pill" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
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
              <img src="/allserver-logo.png" alt="disbumply.pl logo" className="footer-image-logo" />
              <h2>disbumply.pl</h2>
            </div>

            <p className="footer-description">
              Katalog polskich serwerów Discord. Odkrywaj społeczności, promuj własny serwer
              i trafiaj do ludzi, którzy faktycznie szukają aktywnej ekipy.
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
          <p>Ta strona wykorzystuje API Discord, ale nie jest przez Discord certyfikowana ani wspierana.</p>
        </div>
      </div>
    </footer>
  );
}
