import Link from "next/link";

export default function BrandLogo({ href = "/", compact = false, subtitle = "katalog społeczności Discord" }) {
  return (
    <Link href={href} className={`brand brand-link ${compact ? "compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <img src="/allserver-logo.png" alt="" />
      </span>
      <span className="brand-copy">
        <strong>allserver</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </span>
    </Link>
  );
}
