import Link from "next/link";

const usefulLinks = [
  {
    name: "Warunki korzystania",
    href: "/terms",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M6 2h9l5 5v15H6V2zm9 1.5V8h4.5L15 3.5zM8 10h8v2H8v-2zm0 4h8v2H8v-2z" />
      </svg>
    ),
  },
  {
    name: "Polityka prywatności",
    href: "/privacy",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 1l9 4v6c0 5-3.8 9.7-9 11-5.2-1.3-9-6-9-11V5l9-4zm0 6a3 3 0 00-3 3v2h6v-2a3 3 0 00-3-3z" />
      </svg>
    ),
  },
  {
    name: "Wszystkie serwery",
    href: "/allserver",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h18v4H3v-4z" />
      </svg>
    ),
  },
  {
    name: "Dodaj nowy serwer",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M11 5h2v14h-2V5zm-6 6h14v2H5v-2z" />
      </svg>
    ),
  },
];

const helpLinks = [
  {
    name: "kontakt@disbumply.pl",
    href: "mailto:kontakt@disbumply.pl",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M2 4h20v16H2V4zm10 7L4 6v12h16V6l-8 5z" />
      </svg>
    ),
  },
  {
    name: "Serwer Discord",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M20 4a16 16 0 00-4-1l-.2.4a14 14 0 00-7.6 0L8 3a16 16 0 00-4 1C1 9 1 14 1 14s2 3 6 4l.7-1a9 9 0 01-4-2s.3.2.8.4a11 11 0 0010 0c.5-.2.8-.4.8-.4a9 9 0 01-4 2l.7 1c4-1 6-4 6-4s0-5-3-10z" />
      </svg>
    ),
  },
];

function FooterLink({ href, icon, children }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");

  const content = (
    <>
      <span className="footer-link-icon">{icon}</span>
      <span>{children}</span>
    </>
  );

  if (isExternal) {
    return (
      <a href={href} className="footer-pill" target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-pill">
      {content}
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
              <h2>DISBUMPLY.PL</h2>
            </div>

            <p className="footer-description">
              DISBUMPLY.PL to katalog polskich serwerów Discord. Odkrywaj nowe
              społeczności i promuj własny serwer.
            </p>

            <p className="footer-madeby">
              Stworzone z <span>❤</span> dla społeczności Discord
            </p>
          </div>

          <div>
            <h3>Przydatne linki</h3>
            <div className="footer-links">
              {usefulLinks.map((link) => (
                <FooterLink key={link.name} href={link.href} icon={link.icon}>
                  {link.name}
                </FooterLink>
              ))}
            </div>
          </div>

          <div>
            <h3>Pomoc</h3>
            <div className="footer-links">
              {helpLinks.map((link) => (
                <FooterLink key={link.name} href={link.href} icon={link.icon}>
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