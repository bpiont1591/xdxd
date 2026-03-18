import Head from "next/head";
import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";

export default function ServersPage() {
  return (
    <>
      <Head>
        <title>Serwery • allserver</title>
      </Head>

      <main className="panel-page">
        <div className="panel-only glass">
          <BrandLogo />
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
