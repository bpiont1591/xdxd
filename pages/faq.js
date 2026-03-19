import SeoHead from "../components/SeoHead";
import { SITE_URL, buildOrganizationSchema, buildWebsiteSchema } from "../lib/seo";

export default function FaqPage() {
  const faqItems = [
    {
      question: "Czym jest lista Discord?",
      answer: "To publiczny katalog serwerów Discord, w którym można wyszukiwać społeczności według kategorii, tagów i aktywności.",
    },
    {
      question: "Jak działa katalog serwerów Discord?",
      answer: "DISBUMPLY.PL porządkuje serwery Discord według tagów, kategorii i aktualnej aktywności. Dzięki temu użytkownik może łatwo znaleźć serwery gamingowe, społeczności tematyczne, serwery anime, roleplay, muzyczne, edukacyjne albo zwykłe miejsca do pogadania bez szukania igły w stogu cyfrowego siana.",
    },
    {
      question: "Po co komu lista Discord?",
      answer: "Taka lista Discord pomaga zarówno właścicielom serwerów, jak i ludziom szukającym nowej społeczności. Jeden chce widoczności w Google, drugi chce znaleźć aktywny serwer Discord po polsku.",
    },
    {
      question: "Jak dodać serwer Discord do katalogu?",
      answer: "Wystarczy zalogować się przez Discord, dodać swój serwer, uzupełnić opis, tagi i zaproszenie, a potem regularnie go bumpować.",
    },
    {
      question: "Jak znaleźć polskie serwery Discord?",
      answer: "Najłatwiej użyć wyszukiwarki i filtrów kategorii, aby przeglądać aktywne polskie serwery Discord według zainteresowań.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SeoHead
        title="FAQ - lista Discord i serwery Discord"
        description="FAQ o DISBUMPLY.PL. Sprawdź jak działa lista Discord, jak znaleźć polskie serwery Discord i jak dodać własny serwer do katalogu."
        path="/faq"
        keywords={["faq lista discord", "lista discord", "serwery discord", "polskie serwery discord"]}
        jsonLd={[
          buildWebsiteSchema(),
          buildOrganizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FAQ - Lista Discord",
            url: `${SITE_URL}/faq`,
            inLanguage: "pl-PL",
            description: "Najważniejsze informacje o katalogu serwerów Discord DISBUMPLY.PL.",
          },
          faqSchema,
        ]}
      />

      <main className="site-shell home-v9">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <section className="container seo-copy-block glass" style={{ marginTop: "7rem" }}>
          <span className="badge">lista discord</span>
          <h1>Lista Discord dla polskich społeczności</h1>
          <p className="muted large">
            Szukasz miejsca, gdzie da się szybko znaleźć sensowny serwer Discord zamiast błądzić po przypadkowych zaproszeniach z internetu? Tutaj masz publiczny katalog, czyli normalną listę Discord z wyszukiwarką, kategoriami i aktywnością serwerów.
          </p>
        </section>

        <section className="container seo-copy-grid top-gap" style={{ marginBottom: "4rem" }}>
          <article className="panel-card glass">
            <h2>Jak działa katalog serwerów Discord</h2>
            <p>
              DISBUMPLY.PL porządkuje serwery Discord według tagów, kategorii i aktualnej aktywności. Dzięki temu użytkownik może łatwo znaleźć serwery gamingowe, społeczności tematyczne, serwery anime, roleplay, muzyczne, edukacyjne albo zwykłe miejsca do pogadania bez szukania igły w stogu cyfrowego siana.
            </p>
          </article>

          <article className="panel-card glass">
            <h2>Po co komu lista Discord</h2>
            <p>
              Taka lista Discord pomaga zarówno właścicielom serwerów, jak i ludziom szukającym nowej społeczności. Jeden chce widoczności w Google, drugi chce znaleźć aktywny serwer Discord po polsku. Niesłychane, obie strony mogą zyskać naraz.
            </p>
          </article>
        </section>

        <section className="container seo-copy-block glass" style={{ marginBottom: "4rem" }}>
          <span className="badge">faq</span>
          <h2>Najczęstsze pytania</h2>
          <div className="seo-copy-grid top-gap">
            {faqItems.map((item) => (
              <article key={item.question} className="panel-card glass">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
