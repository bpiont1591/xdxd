import Link from "next/link";

const quickLinks = [
  { name: "Serwery", href: "/allservers" },
  { name: "Dodaj serwer", href: "/dashboard" },
  { name: "FAQ", href: "/faq" },
  { name: "Regulamin", href: "/terms" },
  { name: "Prywatność", href: "/privacy" },
];

const contactLinks = [
  { name: "kontakt@disbumply.pl", href: "mailto:kontakt@disbumply.pl" },
  { name: "Discord społeczności", href: "#" },
];

function FooterTextLink({ href, children }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  if (isExternal) {
    return (
      <a href={href} className="footer-inline-link" target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-inline-link">
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer footer-minimal">
      <div className="footer-container footer-container-minimal">
        <div className="footer-top-line" />

        <div className="footer-minimal-row">
          <div className="footer-minimal-brand">
            <img src="/allserver-logo.png" alt="disbumply.pl logo" className="footer-image-logo minimal" />
            <div className="footer-brand-copy-minimal">
              <p className="footer-overline minimal">Polskie serwery Discord w jednym miejscu</p>
              <h2>DISBUMPLY.PL</h2>
              <p className="footer-description minimal">
                Znajduj aktywne społeczności i wrzucaj własny serwer bez zbędnego bałaganu.
              </p>
            </div>
          </div>

          <div className="footer-minimal-meta">
            <span className="footer-status-dot">
              <span /> online 24/7
            </span>
          </div>
        </div>

        <div className="footer-minimal-links">
          <div className="footer-link-group">
            <span className="footer-group-label">Nawigacja</span>
            <div className="footer-inline-links">
              {quickLinks.map((link) => (
                <FooterTextLink key={link.name} href={link.href}>
                  {link.name}
                </FooterTextLink>
              ))}
            </div>
          </div>

          <div className="footer-link-group">
            <span className="footer-group-label">Kontakt</span>
            <div className="footer-inline-links">
              {contactLinks.map((link) => (
                <FooterTextLink key={link.name} href={link.href}>
                  {link.name}
                </FooterTextLink>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom minimal">
          <p>© 2026 DISBUMPLY.PL</p>
          <p>Projekt niezależny, bez powiązania z Discord Inc.</p>
        </div>
      </div>
    </footer>
  );
}
