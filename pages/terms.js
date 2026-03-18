import Head from "next/head";

const sections = [
  {
    id: "1",
    title: "Postanowienia ogólne",
    content: [
      "Niniejszy Regulamin określa zasady korzystania z serwisu disbumply.pl...",
      "Operatorem serwisu jest właściciel disbumply.pl...",
      "Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu...",
      "Serwis korzysta z API Discord, ale nie jest przez Discord certyfikowany..."
    ]
  },
];

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Regulamin | disbumply.pl</title>
        <meta
          name="description"
          content="Regulamin korzystania z serwisu disbumply.pl"
        />
      </Head>

      <main className="terms-page">
        {/* HERO */}
        <section className="terms-hero">
          <div className="terms-shell">
            <div className="terms-badge">Regulamin</div>

            <h1>Regulamin świadczenia usług disbumply.pl</h1>

            <p className="terms-lead">
              Poniżej znajdziesz zasady korzystania z serwisu, publikowania
              serwerów, usług premium oraz podstawowe informacje dotyczące
              odpowiedzialności i prywatności.
            </p>

            <div className="terms-alert">
              Ta strona wykorzystuje API Discord, ale nie jest przez Discord
              certyfikowana ani wspierana.
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="terms-content">
          <div className="terms-shell terms-layout">

            {/* SIDEBAR */}
            <aside className="terms-sidebar">
              <div className="terms-sidebar-card">
                <h2>Na tej stronie</h2>

                <nav>
                  {sections.map((section) => (
                    <a key={section.id} href={`#section-${section.id}`}>
                      {section.id}. {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* MAIN */}
            <div className="terms-main">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={`section-${section.id}`}
                  className="terms-card"
                >
                  <h2>
                    {section.id}. {section.title}
                  </h2>

                  {section.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>

          </div>
        </section>
      </main>
    </>
  );
}