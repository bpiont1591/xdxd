import Link from "next/link";

const quickLinks = [
  {
    name: "Przeglądaj serwery",
    href: "/allservers",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 5h16v4H4V5zm0 5.5h16V15H4v-4.5zM4 16.5h16V20H4v-3.5z" />
      </svg>
    ),
  },
  {
    name: "Dodaj serwer",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M11 4h2v16h-2V4zM4 11h16v2H4v-2z" />
      </svg>
    ),
  },
  {
    name: "Regulamin",
    href: "/terms",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M7 3h8l4 4v14H7V3zm7 1.5V8h3.5L14 4.5zM9 11h8v1.8H9V11zm0 4h8v1.8H9V15z" />
      </svg>
    ),
  },
  {
    name: "Prywatność",
    href: "/privacy",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2l8 3.6v5.8c0 5.1-3.1 9.5-8 10.9-4.9-1.4-8-5.8-8-10.9V5.6L12 2zm0 5.2a3 3 0 00-3 3v1.7h6V10.2a3 3 0 00-3-3z" />
      </svg>
    ),
  },
];

const contactLinks = [
  {
    name: "kontakt@disbumply.pl",
    href: "mailto:kontakt@disbumply.pl",
    label: "E-mail",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 5h18v14H3V5zm9 6.4L5 7v10h14V7l-7 4.4z" />
      </svg>
    ),
  },
  {
    name: "Społeczność Discord",
    href: "#",
    label: "Wsparcie",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M20 5a16.8 16.8 0 00-4.2-1.3l-.2.5a12.7 12.7 0 00-7.2 0l-.2-.5A16.8 16.8 0 004 5C1.7 8.4 1.3 11.7 1.3 11.7A16.7 16.7 0 006.5 15l.8-1.3c-.9-.3-1.8-.8-2.5-1.4.2.1.4.2.7.4 2.3 1 4.8 1 7 0 .3-.1.6-.3.7-.4-.7.6-1.6 1.1-2.5 1.4l.8 1.3a16.7 16.7 0 005.2-3.3S22.3 8.4 20 5z" />
      </svg>
    ),
  },
];

const footerStats = [
  "Polskie społeczności",
  "Szybka moderacja",
  "Lepsza widoczność",
];

function FooterLink({ href, icon, label, children }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  const content = (
    <>
      <span className="footer-link-icon">{icon}</span>
      <span className="footer-link-copy">
        {label ? <small>{label}</small> : null}
        <span>{children}</span>
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a href={href} className="footer-card-link" target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-card-link">
      {content}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-shell compact">
          <div className="footer-main-card compact">
            <div className="footer-brand-row compact">
              <div className="footer-brand compact">
                <img
                  src="/allserver-logo.png"
                  alt="disbumply.pl logo"
                  className="footer-image-logo"
                />
                <div>
                  <p className="footer-overline">BAZA POLSKICH SERWERÓW DISCORD</p>
                  <h2>DISBUMPLY.PL</h2>
                </div>
              </div>

              <span className="footer-status-badge compact">online 24/7</span>
            </div>

            <p className="footer-description compact">
              Odkrywaj aktywne społeczności i promuj własny serwer bez syfu z martwych list.
            </p>

            <div className="footer-highlights compact">
              {footerStats.map((item) => (
                <span key={item} className="footer-highlight-pill compact">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <section className="footer-section-card compact">
            <div className="footer-section-head compact">
              <p>Nawigacja</p>
              <h3>Najważniejsze linki</h3>
            </div>
            <div className="footer-links footer-links-grid compact">
              {quickLinks.map((link) => (
                <FooterLink
                  key={link.name}
                  href={link.href}
                  icon={link.icon}
                >
                  {link.name}
                </FooterLink>
              ))}
            </div>
          </section>

          <section className="footer-section-card compact">
            <div className="footer-section-head compact">
              <p>Kontakt</p>
              <h3>Pomoc i kontakt</h3>
            </div>
            <div className="footer-links compact">
              {contactLinks.map((link) => (
                <FooterLink
                  key={link.name}
                  href={link.href}
                  icon={link.icon}
                  label={link.label}
                >
                  {link.name}
                </FooterLink>
              ))}
            </div>
          </section>
        </div>

        <div className="footer-bottom compact">
          <p>© 2026 DISBUMPLY.PL</p>
          <p>Projekt niezależny, bez powiązania z Discord Inc.</p>
        </div>
      </div>
    </footer>
  );
}
