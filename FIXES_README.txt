Zmiany w tej paczce:
- Dashboard: maksymalnie 5 tagów
- Dashboard: opis serwera maksymalnie 250 znaków
- Dashboard: wybór typu serwera Publiczny / NSFW (18+)
- Strona listingu i szczegółów pokazuje badge Publiczny albo 18+ NSFW
- Dla serwerów NSFW przy wejściu na szczegóły i przed linkiem invite pojawia się potwierdzenie 18+

Uwaga techniczna:
- Typ serwera (public/nsfw) jest zapisywany w polu tags jako JSON meta, więc nie trzeba robić migracji bazy.
- Stare wpisy dalej działają.
