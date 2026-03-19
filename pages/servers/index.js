import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";
import SeoHead from "../../components/SeoHead";

export default function ServersPage() {
  return (
    <>
      <SeoHead
        title="Lista serwerów Discord"
        description="Przegląd listy serwerów Discord w katalogu DISBUMPLY.PL. Ta strona ma charakter pomocniczy i przekierowuje do pełnej listy serwerów."
        path="/servers"
        noindex
      />

      <main className="panel-page">
        <div className="panel-only glass">
          <BrandLogo />
          <h1>Lista serwerów Discord</h1>
          <p className="muted">Ta strona pomocnicza nie jest głównym katalogiem. Przejdź do pełnej listy albo wróć na stronę główną.</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/allservers" className="btn btn-primary">
              Zobacz pełną listę
            </Link>
            <Link href="/" className="btn btn-ghost">
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
