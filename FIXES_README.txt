FLOW NAPRAWIONY

1. Użytkownik wchodzi na stronę
2. Klika "Zaloguj przez Discord"
3. Dashboard pobiera serwery użytkownika bezpośrednio z Discord OAuth
4. Użytkownik wybiera serwer z listy
5. Jeśli przy serwerze jest "Brak bota", klika "Dodaj bota"
6. Status bota odświeża się live z Discorda

WAŻNE:
- Lista serwerów NIE jest brana z bazy
- Status bota NIE jest brany z bazy
- Baza trzyma tylko opis, tagi, invite, bumpy i dane strony

WYMAGANE ENV DLA STRONY:
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_DISCORD_CLIENT_ID=
DISCORD_BOT_TOKEN=
DISCORD_BOT_CLIENT_ID=

Dodatkowo:
- /api/servers działa nawet jeśli odczyt z bazy padnie i nadal zwraca serwery z Discorda
- dashboard odświeża status bota co 5 sekund, kiedy bot nie jest jeszcze dodany


[2026-03-17] Dodano typ serwera (public / nsfw)
- Prisma schema: nowe pole Server.serverType z domyślną wartością public
- Dashboard: można ustawić rodzaj serwera
- Admin: widać typ serwera i można go zmieniać
- Po wrzuceniu zmian na hosting odpal migrację bazy, np. prisma migrate deploy albo prisma db push
