import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";

export default function ServersPage() {
  return (
    <>
      <Head>
        <title>Serwery • Bumply</title>
      </Head>

      <main className="panel-page">
        <SiteHeader backHref="/" backLabel="STRONA GŁÓWNA" />
        <div className="panel-only glass">
          <h1>Serwery</h1>
          <p className="muted">Ta strona będzie rozwinięta później.</p>

          <Link href="/" className="btn btn-ghost">
            Wróć na stronę główną
          </Link>
        </div>
      </main>
    </>
  );
}
