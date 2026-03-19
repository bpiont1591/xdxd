import Head from "next/head";

const sections = [
  {
    id: "1",
    title: "Postanowienia ogólne",
    content: [
      "Niniejsza Polityka Prywatności opisuje, w jaki sposób disbumply.pl zbiera, wykorzystuje, przechowuje i zabezpiecza dane użytkowników korzystających z serwisu.",
      "Administratorem danych jest operator disbumply.pl. W sprawach dotyczących prywatności możesz skontaktować się pod adresem: privacy@disbumply.pl.",
      "Korzystanie z serwisu oznacza zapoznanie się z niniejszą Polityką. Jeżeli nie akceptujesz jej zasad, nie korzystaj z funkcji wymagających przekazania danych.",
      "Serwis korzysta z API Discord, ale nie jest przez Discord certyfikowany, zatwierdzony ani wspierany."
    ]
  },
  {
    id: "2",
    title: "Jakie dane możemy przetwarzać",
    content: [
      "Podczas logowania przez Discord możemy przetwarzać dane konta widoczne w ramach autoryzacji, takie jak identyfikator użytkownika, nazwa profilu, avatar, język konta oraz informacje potrzebne do obsługi sesji.",
      "W przypadku korzystania z katalogu serwerów możemy przetwarzać dane związane z dodanymi serwerami, ich opisami, grafikami, tagami, statystykami oraz aktywnością powiązaną z bumpami, ulubionymi lub zgłoszeniami.",
      "W celach bezpieczeństwa możemy zapisywać dane techniczne, w tym adres IP, datę logowania, dane o przeglądarce, podstawowe logi systemowe oraz informacje niezbędne do wykrywania nadużyć.",
      "Jeżeli korzystasz z formularzy kontaktowych, zgłoszeń, reklamacji albo zapisujesz się na newsletter, możemy przetwarzać dane przekazane bezpośrednio przez Ciebie, w szczególności adres e-mail i treść wiadomości."
    ]
  },
  {
    id: "3",
    title: "Cele i podstawy przetwarzania",
    content: [
      "Dane przetwarzamy przede wszystkim w celu świadczenia usług dostępnych w serwisie, w tym logowania, zarządzania kontem, publikowania serwerów oraz obsługi funkcji społecznościowych.",
      "Dane mogą być również przetwarzane w celu wykonania umowy, realizacji usług premium, obsługi płatności, rozpatrywania reklamacji oraz prowadzenia rozliczeń księgowych i podatkowych.",
      "Część danych przetwarzamy na podstawie naszego prawnie uzasadnionego interesu, w szczególności dla zapewnienia bezpieczeństwa, zapobiegania oszustwom, dochodzenia roszczeń oraz poprawy działania serwisu.",
      "Jeżeli wymagają tego przepisy lub konkretna funkcja, dane mogą być przetwarzane także na podstawie Twojej zgody, którą możesz cofnąć w dowolnym momencie."
    ]
  },
  {
    id: "4",
    title: "Logowanie przez Discord i integracje",
    content: [
      "W przypadku logowania przez konto Discord serwis korzysta z danych udostępnionych w ramach autoryzacji OAuth, wyłącznie w zakresie potrzebnym do działania konta i przypisanych funkcji.",
      "Możemy przetwarzać informacje o serwerach Discord powiązanych z użytkownikiem tylko wtedy, gdy jest to konieczne do obsługi funkcji katalogu, panelu użytkownika, zarządzania wpisem lub integracji z botem.",
      "Dane pozyskane z API Discord nie są wykorzystywane poza zakresem potrzebnym do działania disbumply.pl i obsługi usług opisanych w serwisie."
    ]
  },
  {
    id: "5",
    title: "Publikowane treści i dane publiczne",
    content: [
      "Treści dodawane przez użytkownika do katalogu, takie jak opisy serwerów, nazwy, grafiki, tagi lub inne materiały prezentacyjne, mogą być publicznie widoczne dla innych odwiedzających.",
      "Dodając treści do serwisu, użytkownik powinien upewnić się, że ma prawo do ich publikacji oraz że nie naruszają one prywatności ani praw osób trzecich.",
      "Publiczne dane widoczne w katalogu mogą być indeksowane przez wyszukiwarki lub pobierane przez przeglądarki użytkowników w zwykłym toku korzystania z Internetu."
    ]
  },
  {
    id: "6",
    title: "Płatności i usługi premium",
    content: [
      "W przypadku usług premium możemy przetwarzać dane niezbędne do zawarcia i wykonania umowy, w tym identyfikator użytkownika, identyfikator serwera, dane kontaktowe oraz informacje o statusie transakcji.",
      "Obsługa płatności może być realizowana przez zewnętrznych operatorów płatniczych. Dane kart płatniczych lub innych metod płatności są co do zasady przetwarzane bezpośrednio przez tych dostawców, a nie przez disbumply.pl.",
      "Dane związane z rozliczeniami mogą być przechowywane przez okres wymagany przepisami prawa podatkowego i rachunkowego."
    ]
  },
  {
    id: "7",
    title: "Cookies i dane techniczne",
    content: [
      "Serwis może wykorzystywać pliki cookies, pamięć przeglądarki i podobne technologie w celu utrzymania sesji, zapamiętywania ustawień, analizy działania strony oraz ochrony przed nadużyciami.",
      "Niektóre cookies są niezbędne do działania serwisu, a część może być używana do celów analitycznych lub funkcjonalnych, zależnie od wdrożonych narzędzi.",
      "Ustawieniami cookies możesz zarządzać z poziomu swojej przeglądarki, przy czym wyłączenie części z nich może wpłynąć na działanie strony."
    ]
  },
  {
    id: "8",
    title: "Okres przechowywania danych",
    content: [
      "Dane przechowujemy przez okres niezbędny do realizacji celu, dla którego zostały zebrane, a następnie przez czas potrzebny do spełnienia obowiązków prawnych, rozliczeniowych lub obrony przed roszczeniami.",
      "Dane konta i aktywności mogą być przechowywane przez okres korzystania z serwisu, a po ustaniu aktywności przez rozsądny czas potrzebny do obsługi ewentualnych zgłoszeń, bezpieczeństwa i wewnętrznych logów.",
      "Dane związane z płatnościami, rozliczeniami lub reklamacjami mogą być przechowywane dłużej, jeżeli wymagają tego obowiązki prawne albo uzasadniony interes administratora."
    ]
  },
  {
    id: "9",
    title: "Udostępnianie danych",
    content: [
      "Dane mogą być przekazywane podmiotom wspierającym działanie serwisu, takim jak dostawcy hostingu, usług bezpieczeństwa, analityki, poczty elektronicznej, operatorzy płatności lub wsparcie techniczne.",
      "Dane mogą być również udostępnione, jeśli wymaga tego obowiązujące prawo, prawomocne żądanie organu albo potrzeba ochrony praw administratora lub innych użytkowników.",
      "Nie sprzedajemy danych osobowych użytkowników osobom trzecim."
    ]
  },
  {
    id: "10",
    title: "Bezpieczeństwo",
    content: [
      "Stosujemy odpowiednie środki techniczne i organizacyjne mające na celu ochronę danych przed utratą, nieuprawnionym dostępem, ujawnieniem, zmianą lub zniszczeniem.",
      "Mimo stosowanych zabezpieczeń żadna metoda transmisji danych w Internecie nie daje pełnej gwarancji bezpieczeństwa, dlatego użytkownik również powinien dbać o bezpieczeństwo własnego konta i urządzenia."
    ]
  },
  {
    id: "11",
    title: "Twoje prawa",
    content: [
      "Masz prawo żądać dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia danych oraz wniesienia sprzeciwu wobec przetwarzania, jeśli przepisy przyznają Ci takie uprawnienie.",
      "Jeżeli przetwarzanie odbywa się na podstawie zgody, możesz ją wycofać w dowolnym momencie, bez wpływu na zgodność z prawem wcześniejszego przetwarzania.",
      "Masz również prawo złożyć skargę do właściwego organu nadzorczego zajmującego się ochroną danych osobowych."
    ]
  },
  {
    id: "12",
    title: "Kontakt i zmiany Polityki",
    content: [
      "W sprawach związanych z prywatnością, żądaniami dotyczącymi danych lub pytaniami o sposób przetwarzania możesz napisać na adres: privacy@disbumply.pl.",
      "Polityka Prywatności może być aktualizowana w przypadku zmian prawnych, technicznych lub organizacyjnych. Aktualna wersja jest publikowana na stronie.",
      "Ostatnia aktualizacja: 07.01.2026"
    ]
  }
];

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Polityka Prywatności | disbumply.pl</title>
        <meta
          name="description"
          content="Polityka Prywatności serwisu disbumply.pl"
        />
      </Head>

      <main className="terms-page privacy-page">
        <section className="terms-hero privacy-hero">
          <div className="terms-shell">
            <div className="terms-badge">Prywatność</div>
            <h1>Polityka Prywatności disbumply.pl</h1>
            <p className="terms-lead">
              Tutaj znajdziesz informacje o tym, jakie dane mogą być przetwarzane,
              po co to robimy, jak długo je przechowujemy oraz jakie prawa Ci przysługują.
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
