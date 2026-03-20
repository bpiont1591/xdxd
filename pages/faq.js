import SeoHead from "../components/SeoHead";
import { SITE_URL, buildOrganizationSchema, buildWebsiteSchema } from "../lib/seo";

export default function FaqPage() {
  const faqItems = [
    {
      id: "dodac-serwer",
      question: "Jak dodać serwer Discord do katalogu?",
      answer: "Zaloguj się przez Discord, przejdź do dashboardu, wybierz serwer, uzupełnij opis, tagi i invite, a potem zapisz zmiany. Jeśli bot nie jest jeszcze dodany, panel od razu pokaże dalszy krok zamiast bezsensownie wisieć na ładowaniu.",
    },
    {
      id: "bumpowanie",
      question: "Jak bumpować serwer Discord?",
      answer: "Bump zwiększa widoczność serwera w katalogu. Im regularniej bumpujesz, tym częściej lądujesz wysoko na liście aktywnych serwerów. To nie jest magia, tylko prosty sygnał aktywności, choć internet lubi udawać, że to alchemia.",
    },
    {
      id: "ranking",
      question: "Jak działa ranking serwerów Discord?",
      answer: "Na pozycję wpływają przede wszystkim bumpy i świeżość aktywności. Dodatkowo profil serwera może pokazywać odznaki zaufania i aktywności, takie jak Pierwszy bump, 100 bumpów, Top 10 tygodnia, Zweryfikowany czy Aktywna społeczność.",
    },
    {
      id: "polskie-serwery",
      question: "Jak znaleźć polskie serwery Discord?",
      answer: "Najłatwiej użyć wyszukiwarki i filtrów kategorii, a potem sprawdzić opis, tagi, liczbę użytkowników online i status invite. Dzięki temu nie klikasz w martwe zaproszenia jak ofiara własnego optymizmu.",
    },
    {
      id: "zgloszenia",
      question: "Jak działa zgłoszenie serwera?",
      answer: "Na profilu serwera można wybrać konkretny powód zgłoszenia, dodać szczegóły i wysłać formularz. Zgłoszenie trafia do kolejki moderacji, a użytkownik dostaje jasny komunikat, co dalej i w jakim czasie zwykle jest odpowiedź.",
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
        title="FAQ - serwery Discord Polska i lista serwerów Discord"
        description="FAQ o DISBUMPLY.PL. Sprawdź jak dodać serwer Discord, jak bumpować, jak działa ranking i jak działa zgłaszanie serwerów w katalogu."
        path="/faq"
        keywords={[
          "faq serwery discord polska",
          "jak dodać serwer discord",
          "jak bumpować serwer discord",
          "jak działa ranking discord",
        ]}
        jsonLd={[
          buildWebsiteSchema(),
          buildOrganizationSchema(),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FAQ - serwery Discord Polska",
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
          <span className="badge">faq serwerów discord</span>
          <h1>FAQ: lista serwerów Discord i serwery Discord Polska</h1>
          <p className="muted large">
            Tutaj siedzą odpowiedzi pod longtail: jak dodać serwer, jak bumpować, jak działa ranking i co dzieje się po zgłoszeniu. Zadziwiające, ale ludzie faktycznie wolą jasne instrukcje niż zgadywanie.
          </p>
        </section>

        <section className="container seo-copy-grid top-gap" style={{ marginBottom: "2rem" }}>
          <article className="panel-card glass" id="dodac-serwer">
            <h2>Jak dodać serwer Discord</h2>
            <p>
              Zaloguj się przez Discord, przejdź do dashboardu, wybierz serwer, uzupełnij opis, tagi i invite. Jeśli nie masz sesji, panel pokaże od razu ekran logowania zamiast udawać, że coś robi.
            </p>
          </article>

          <article className="panel-card glass" id="bumpowanie">
            <h2>Jak bumpować serwer Discord</h2>
            <p>
              Bump to sygnał aktywności. Regularne bumpowanie pomaga wskoczyć wyżej na listach i zgarnąć odznaki widoczności. Proste, brutalne i skuteczne.
            </p>
          </article>
        </section>

        <section className="container seo-copy-grid top-gap" style={{ marginBottom: "4rem" }}>
          <article className="panel-card glass" id="ranking">
            <h2>Jak działa ranking serwerów Discord</h2>
            <p>
              Ranking bierze pod uwagę aktywność i bumpy. Profil serwera może też pokazywać odznaki, które zwiększają zaufanie: Pierwszy bump, 100 bumpów, Top 10 tygodnia, Zweryfikowany i Aktywna społeczność.
            </p>
          </article>

          <article className="panel-card glass" id="zgloszenia">
            <h2>Jak działają zgłoszenia serwerów</h2>
            <p>
              Formularz zgłoszeń ma konkretne powody, walidację i komunikat po wysłaniu. Dzięki temu katalog trochę mniej przypomina śmietnik z zaproszeniami i scamem.
            </p>
          </article>
        </section>

        <section className="container seo-copy-block glass" style={{ marginBottom: "4rem" }}>
          <span className="badge">najczęstsze pytania</span>
          <h2>Pytania i odpowiedzi</h2>
          <div className="seo-copy-grid top-gap">
            {faqItems.map((item) => (
              <article key={item.id} id={item.id} className="panel-card glass">
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
