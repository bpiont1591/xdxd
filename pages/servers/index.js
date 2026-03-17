import Head from "next/head";
import Link from "next/link";

export default function ServersPage() {
  return (
    <>
      <Head>
        <title>Serwery • Bumply</title>
      </Head>

      <main className="panel-page">
        <img
          src="/bumply-logo.svg"
          alt="Bumply"
          style={{ height: "60px", margin: "20px auto", display: "block" }}
        />

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