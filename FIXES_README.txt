Poprawki w paczce:
1. Dashboard przestał na sztywno pokazywać botInstalled=false.
2. /api/servers teraz łączy dane z Discord OAuth i zapisane dane z bazy.
3. Dashboard auto-odświeża status serwera bez bota co 8 sekund i po powrocie do karty.
4. Dodany endpoint /api/bot/uninstall.
5. Bot ma synchronizację wszystkich guild przy starcie i obsługę guildDelete.
6. Ujednolicony slug serwera z guildId, żeby nie wywalać unique constraint dla podobnych nazw.


LIVE BOT STATUS UPDATE (dashboard)
- Dashboard nie bierze już statusu bota z bazy.
- /api/servers sprawdza status na żywo z Discord API przez endpoint guild member lookup.
- Wymagane env na stronie / backendzie:
  - DISCORD_BOT_TOKEN albo BOT_TOKEN
  - DISCORD_BOT_CLIENT_ID albo CLIENT_ID
- Pole botInstalled w bazie może dalej istnieć dla kompatybilności, ale dashboard go nie używa do wyświetlania statusu.
- /api/bot/bump nie blokuje już bumpa na podstawie botInstalled z bazy, bo sam fakt wywołania komendy przez bota oznacza, że bot siedzi na serwerze.
