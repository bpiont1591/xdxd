import Link from "next/link";

export default function BrandLogo({ href = "/", compact = false, subtitle }) {
  return (
    <Link href={href} className={`brand brand-link ${compact ? "compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">B</span>
      <span className="brand-copy">
        <strong>Bumply</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </span>
    </Link>
  );
}
