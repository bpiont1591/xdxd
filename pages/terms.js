import Head from "next/head";

const sections = [
  {
    id: "1",
    title: "Postanowienia ogólne",
    content: [
      "Niniejszy Regulamin określa zasady korzystania z serwisu disbumply.pl, w tym zasad publikowania, promowania i przeglądania serwerów Discord oraz powiązanych usług dostępnych na stronie.",
      "Operatorem serwisu jest właściciel disbumply.pl. Kontakt w sprawach związanych z działaniem serwisu, naruszeniami, płatnościami i prywatnością jest możliwy pod adresem: kontakt@disbumply.pl.",
      "Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu. Jeżeli nie akceptujesz jego treści, nie korzystaj z disbumply.pl.",
      "Serwis korzysta z API Discord, ale nie jest przez Discord certyfikowany, wspierany ani oficjalnie zatwierdzony."
    ]
  },
  {
    id: "2",
    title: "Definicje",
    content: [
      "Serwis / Platforma - strona internetowa dostępna pod adresem disbumply.pl.",
      "Użytkownik - każda osoba korzystająca z funkcji serwisu, niezależnie od tego, czy posiada konto.",
      "Konto - dostęp do funkcji użytkownika po zalogowaniu przez konto Discord.",
      "Serwer - serwer Discord dodany do katalogu disbumply.pl.",
      "Usługi premium - płatne funkcje zwiększające widoczność serwera, wyróżnienia, promowanie lub inne opcje opisane w ofercie serwisu.",
      "Discord - platforma komunikacyjna dostarczana przez Discord Inc."
    ]
  },
  {
    id: "3",
    title: "Warunki korzystania z serwisu",
    content: [
      "Do korzystania z części funkcji serwisu wymagane może być aktywne konto Discord i logowanie z użyciem API Discord.",
      "Użytkownik powinien korzystać z serwisu zgodnie z prawem, niniejszym Regulaminem oraz zasadami Discord.",
      "Użytkownik oświadcza, że ma prawo do publikowania treści, grafik, opisów i materiałów związanych z dodawanym serwerem.",
      "Operator może ograniczyć lub zablokować dostęp do serwisu w przypadku naruszenia Regulaminu, nadużyć, prób obejścia zabezpieczeń, spamu lub działań szkodliwych."
    ]
  },
  {
    id: "4",
    title: "Zakres usług",
    content: [
      "disbumply.pl umożliwia w szczególności przeglądanie katalogu serwerów Discord, dodawanie własnych serwerów, zarządzanie ich wizytówką oraz korzystanie z opcji zwiększających widoczność.",
      "Część usług może być dostępna bezpłatnie, a część odpłatnie. Aktualny zakres funkcji, cen i czas trwania usług premium jest prezentowany bezpośrednio w serwisie.",
      "Operator może rozwijać, zmieniać, ograniczać lub wycofywać wybrane funkcje, jeżeli jest to potrzebne z przyczyn technicznych, prawnych, bezpieczeństwa lub biznesowych."
    ]
  },
  {
    id: "5",
    title: "Zasady publikowania treści",
    content: [
      "Zabronione jest publikowanie treści sprzecznych z prawem, zasadami Discord, dobrymi obyczajami lub bezpieczeństwem użytkowników.",
      "Nie wolno publikować treści wprowadzających w błąd, podszywających się pod inne osoby, naruszających prawa autorskie, znaki towarowe albo prywatność osób trzecich.",
      "Zabronione jest umieszczanie treści zawierających spam, malware, phishing, treści seksualne nieodpowiednie dla odbiorców, nawoływanie do przemocy, nienawiści, oszustw lub działań nielegalnych.",
      "Operator może usunąć lub ukryć treść bez wcześniejszego ostrzeżenia, jeżeli uzna ją za niezgodną z Regulaminem, prawem albo zasadami bezpieczeństwa serwisu."
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
    title: "API Discord i usługi zewnętrzne",
    content: [
      "Serwis może korzystać z API Discord wyłącznie w zakresie niezbędnym do logowania, integracji kont i realizacji funkcji platformy.",
      "Użytkownik ponosi odpowiedzialność za zgodność swoich działań z zasadami Discord, w tym z warunkami korzystania i wytycznymi społeczności.",
      "disbumply.pl może także korzystać z usług podmiotów trzecich, takich jak operatorzy płatności, hosting, analityka, ochrona antyspamowa lub narzędzia techniczne.",
      "Operator nie odpowiada za czasową niedostępność lub błędy wynikające z awarii, ograniczeń albo decyzji dostawców zewnętrznych."
    ]
  },
  {
    id: "9",
    title: "Odpowiedzialność użytkownika",
    content: [
      "Użytkownik odpowiada za treści, które publikuje, oraz za zgodność swoich działań z prawem i Regulaminem.",
      "Zabronione są próby obchodzenia zabezpieczeń, automatyzacji wbrew zasadom serwisu, masowego dodawania treści, fałszowania statystyk lub zakłócania działania platformy.",
      "Użytkownik ponosi odpowiedzialność za działania podejmowane z wykorzystaniem jego konta, chyba że wykaże brak swojej winy."
    ]
  },
  {
    id: "10",
    title: "Prawa do treści i licencja",
    content: [
      "Dodając treści do serwisu, użytkownik oświadcza, że posiada odpowiednie prawa do ich publikacji.",
      "W zakresie niezbędnym do świadczenia usług użytkownik udziela Operatorowi niewyłącznej, nieodpłatnej licencji na prezentowanie, przechowywanie, techniczne przetwarzanie i wyświetlanie tych treści w ramach działania serwisu.",
      "Licencja obowiązuje przez czas publikacji treści w serwisie oraz przez okres niezbędny do obsługi kopii bezpieczeństwa, dochodzenia roszczeń lub wykonania obowiązków prawnych."
    ]
  },
  {
    id: "11",
    title: "Prywatność i bezpieczeństwo",
    content: [
      "Zasady przetwarzania danych osobowych zostały opisane w Polityce Prywatności dostępnej w serwisie.",
      "Operator może przetwarzać dane techniczne, w tym adres IP, informacje o przeglądarce, czasie logowania i aktywności, w zakresie niezbędnym do bezpieczeństwa, przeciwdziałania nadużyciom i prawidłowego działania platformy.",
      "Operator stosuje środki techniczne i organizacyjne odpowiednie do charakteru świadczonych usług, ale nie może zagwarantować całkowitego wyeliminowania każdego ryzyka po stronie Internetu."
    ]
  },
  {
    id: "12",
    title: "Wyłączenie odpowiedzialności",
    content: [
      "Serwis jest udostępniany w formule 'tak jak jest' oraz 'w miarę dostępności'.",
      "Operator nie gwarantuje nieprzerwanego działania, pełnej zgodności z oczekiwaniami użytkownika ani osiągnięcia określonego rezultatu marketingowego lub promocyjnego.",
      "W maksymalnym zakresie dozwolonym przez prawo Operator nie ponosi odpowiedzialności za szkody pośrednie, utracone korzyści, przerwy w działalności, utratę danych lub skutki działań osób trzecich."
    ]
  },
  {
    id: "13",
    title: "Zmiany w Regulaminie",
    content: [
      "Operator może zmienić Regulamin w przypadku zmian prawnych, technicznych, organizacyjnych lub związanych z rozwojem serwisu.",
      "Nowa wersja Regulaminu obowiązuje od chwili publikacji na stronie, chyba że wskazano inny termin wejścia w życie.",
      "Dalsze korzystanie z serwisu po publikacji zmian oznacza akceptację nowego brzmienia Regulaminu."
    ]
  },
  {
    id: "14",
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
        <meta
          name="description"
          content="Regulamin korzystania z serwisu disbumply.pl"
        />
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
