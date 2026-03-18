import Link from "next/link";
import {
  FaFacebookF,
  FaDiscord,
  FaEnvelope,
  FaShieldAlt,
  FaFileContract,
  FaFolderOpen,
  FaPlusCircle,
  FaBullhorn,
  FaBookOpen,
} from "react-icons/fa";

const usefulLinks = [
  { name: "Warunki korzystania", href: "/terms", icon: <FaFileContract /> },
  { name: "Polityka prywatności", href: "/privacy", icon: <FaShieldAlt /> },
  { name: "Wszystkie serwery", href: "/servers", icon: <FaFolderOpen /> },
  { name: "Dodaj nowy serwer", href: "/add-server", icon: <FaPlusCircle /> },
];

const helpLinks = [
  { name: "kontakt@disbumply.pl", href: "mailto:kontakt@disbumply.pl", icon: <FaEnvelope /> },
  { name: "Serwer Discord", href: "#", icon: <FaDiscord /> },
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
              <h2>disbumply.pl</h2>
            </div>

            <p className="footer-description">
              disbumply.pl to katalog polskich serwerów Discord. Odkrywaj nowe
              społeczności, promuj własny serwer i trafiaj do ludzi, którzy
              faktycznie szukają aktywnej ekipy.
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
            <h3>Inne</h3>
            <div className="footer-links">
              {otherLinks.map((link) => (
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