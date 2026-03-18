import Head from "next/head";

const sections = [
  {
    id: "1",
    title: "Postanowienia ogólne",
    content: [
      "Niniejszy Regulamin określa zasady korzystania z serwisu disbumply.pl, w tym publikowania, promowania i przeglądania serwerów Discord oraz usług powiązanych dostępnych na stronie.",
      "Operatorem serwisu jest właściciel disbumply.pl. W sprawach związanych z działaniem serwisu, naruszeniami, prywatnością i płatnościami możesz skontaktować się pod adresem kontakt@disbumply.pl.",
      "Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu. Jeżeli nie zgadzasz się z jego treścią, nie korzystaj z disbumply.pl.",
      "Serwis korzysta z API Discord, ale nie jest przez Discord certyfikowany, wspierany ani oficjalnie zatwierdzony."
    ]
  },
  {
    id: "2",
    title: "Definicje",
    content: [
      "Serwis lub Platforma oznacza stronę internetową dostępną pod adresem disbumply.pl.",
      "Użytkownik oznacza każdą osobę korzystającą z funkcji serwisu, niezależnie od tego, czy posiada konto.",
      "Konto oznacza dostęp do funkcji użytkownika po zalogowaniu z wykorzystaniem konta Discord.",
      "Serwer oznacza serwer Discord dodany do katalogu disbumply.pl.",
      "Usługi premium oznaczają płatne funkcje zwiększające widoczność serwera lub dające dodatkowe wyróżnienia opisane w ofercie serwisu."
    ]
  },
  {
    id: "3",
    title: "Warunki korzystania z serwisu",
    content: [
      "Do korzystania z części funkcji serwisu wymagane może być aktywne konto Discord i logowanie z użyciem API Discord.",
      "Użytkownik powinien korzystać z serwisu zgodnie z prawem, niniejszym Regulaminem oraz zasadami Discord.",
      "Użytkownik oświadcza, że ma prawo do publikowania treści, grafik, opisów i materiałów związanych z dodawanym serwerem.",
      "Operator może ograniczyć lub zablokować dostęp do serwisu w przypadku naruszenia Regulaminu, prób obejścia zabezpieczeń, spamu lub działań szkodliwych."
    ]
  },
  {
    id: "4",
    title: "Zakres usług",
    content: [
      "disbumply.pl umożliwia w szczególności przeglądanie katalogu serwerów Discord, dodawanie własnych serwerów, zarządzanie ich wizytówką oraz korzystanie z opcji zwiększających widoczność.",
      "Część usług może być dostępna bezpłatnie, a część odpłatnie. Aktualny zakres funkcji, cen i czasu trwania usług premium jest prezentowany bezpośrednio w serwisie.",
      "Operator może rozwijać, zmieniać, ograniczać lub wycofywać wybrane funkcje, jeśli jest to potrzebne z przyczyn technicznych, prawnych, bezpieczeństwa albo biznesowych."
    ]
  },
  {
    id: "5",
    title: "Zasady publikowania treści",
    content: [
      "Zabronione jest publikowanie treści sprzecznych z prawem, zasadami Discord, dobrymi obyczajami lub bezpieczeństwem użytkowników.",
      "Nie wolno publikować treści wprowadzających w błąd, podszywających się pod inne osoby, naruszających prawa autorskie, znaki towarowe albo prywatność osób trzecich.",
      "Zabronione jest umieszczanie treści zawierających spam, malware, phishing, treści nawołujące do przemocy, nienawiści, oszustw lub innych działań nielegalnych.",
      "Operator może usunąć albo ukryć treść bez wcześniejszego ostrzeżenia, jeżeli uzna ją za niezgodną z Regulaminem, prawem albo zasadami bezpieczeństwa serwisu."
    ]
  },
  {
    id: "6",
    title: "Płatności i usługi premium",
    content: [
      "Usługi premium mogą być oferowane odpłatnie za pośrednictwem zewnętrznych operatorów płatności.",
      "Zakup usługi premium oznacza zawarcie umowy o świadczenie usługi cyfrowej na warunkach opisanych w serwisie w chwili zakupu.",
      "Operator nie gwarantuje określonego efektu marketingowego, liczby wejść, kliknięć, członków serwera ani określonego wzrostu aktywności po wykupieniu promocji.",
      "W przypadku skutecznego cofnięcia płatności, chargebacku lub nadużycia Operator może wstrzymać usługę premium, usunąć przyznane korzyści lub ograniczyć konto użytkownika."
    ]
  },
  {
    id: "7",
    title: "Zwroty i reklamacje",
    content: [
      "Jeżeli usługa cyfrowa została aktywowana od razu po zakupie, prawo do odstąpienia od umowy może być ograniczone w zakresie dopuszczalnym przez obowiązujące przepisy.",
      "Reklamacje dotyczące działania serwisu lub usług premium można zgłaszać mailowo na adres kontakt@disbumply.pl.",
      "W zgłoszeniu warto podać identyfikator konta Discord, opis problemu, datę zdarzenia i informacje pozwalające odtworzyć błąd.",
      "Operator rozpatruje zgłoszenia w rozsądnym terminie, zwykle nie dłuższym niż 14 dni, chyba że charakter sprawy wymaga dłuższej analizy."
    ]
  },
  {
    id: "8",
    title: "Prywatność i bezpieczeństwo",
    content: [
      "Zasady przetwarzania danych osobowych zostały opisane w Polityce Prywatności dostępnej w serwisie.",
      "Operator może przetwarzać dane techniczne, w tym adres IP, informacje o przeglądarce, czasie logowania i aktywności, w zakresie niezbędnym do bezpieczeństwa, przeciwdziałania nadużyciom i prawidłowego działania platformy.",
      "Operator stosuje środki techniczne i organizacyjne odpowiednie do charakteru świadczonych usług, ale nie może zagwarantować całkowitego wyeliminowania każdego ryzyka po stronie Internetu."
    ]
  },
  {
    id: "9",
    title: "Postanowienia końcowe",
    content: [
      "Do spraw nieuregulowanych w Regulaminie stosuje się przepisy prawa właściwego dla Operatora oraz bezwzględnie obowiązujące przepisy chroniące konsumentów, jeśli mają zastosowanie.",
      "Jeżeli którekolwiek postanowienie Regulaminu okaże się nieważne, nie wpływa to na ważność pozostałych postanowień.",
      "Regulamin wchodzi w życie z dniem publikacji na stronie.",
      "Ostatnia aktualizacja: 17.02.2026"
    ]
  }
];

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Regulamin | disbumply.pl</title>
        <meta name="description" content="Regulamin korzystania z serwisu disbumply.pl" />
      </Head>

      <main className="terms-page">
        <section className="terms-hero">
          <div className="terms-shell">
            <div className="terms-badge">Regulamin</div>
            <h1>Regulamin świadczenia usług disbumply.pl</h1>
            <p className="terms-lead">
              Poniżej znajdziesz zasady korzystania z serwisu, publikowania serwerów,
              usług premium oraz podstawowe informacje dotyczące odpowiedzialności,
              prywatności i płatności.
            </p>

            <div className="terms-alert">
              Uwaga: ta strona wykorzystuje API Discord, ale nie jest przez Discord
              certyfikowana, zatwierdzona ani wspierana.
            </div>
          </div>
        </section>

        <section className="terms-content">
          <div className="terms-shell terms-layout">
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

            <div className="terms-main">
              {sections.map((section) => (
                <article key={section.id} id={`section-${section.id}`} className="terms-card">
                  <h2>{section.id}. {section.title}</h2>
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
