Poprawki w paczce:
1. Dashboard przestał na sztywno pokazywać botInstalled=false.
2. /api/servers teraz łączy dane z Discord OAuth i zapisane dane z bazy.
3. Dashboard auto-odświeża status serwera bez bota co 8 sekund i po powrocie do karty.
4. Dodany endpoint /api/bot/uninstall.
5. Bot ma synchronizację wszystkich guild przy starcie i obsługę guildDelete.
6. Ujednolicony slug serwera z guildId, żeby nie wywalać unique constraint dla podobnych nazw.
