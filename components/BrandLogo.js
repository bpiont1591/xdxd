import Link from "next/link";

export default function BrandLogo({ href = "/", compact = false, subtitle = "​🇱​​🇮​​🇸​​🇹​​🇦​ ​🇸​​🇪​​🇷​​🇼​​🇪​​🇷​ó​🇼​ ​🇩​​🇮​​🇸​​🇨​​🇴​​🇷​​🇩​" }) {
  return (
    <Link href={href} className={`brand brand-link ${compact ? "compact" : ""}`}>
      <span className="brand-mark image-mark" aria-hidden="true">
        <img src="/allserver-logo.png" alt="" />
      </span>
      <span className="brand-copy">
        <strong>​🇧​​🇺​​🇲​​🇵​​🇱​​🇾​.​🇵​​🇱​</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </span>
    </Link>
  );
}
