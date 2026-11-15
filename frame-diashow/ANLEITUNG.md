# Frame-Diashow – Fotos vom Handy auf dem Samsung The Frame

## So funktioniert das Ganze

```
 📱 Handy  ──(WLAN, Browser)──▶  🍓 Raspberry Pi 400  ──(WLAN)──▶  🖼️ The Frame
 bedienen                        Programm + Ordner "bilder"         zeigt die Bilder
```

- Auf dem **Raspberry Pi** läuft das Programm dauerhaft. Dort liegt der Ordner `bilder`.
- Mit dem **Handy** öffnest du eine Webseite des Pi. Dort kannst du Fotos hochladen,
  die Diashow starten/stoppen und Einstellungen ändern.
- Der Pi schickt die Bilder in den **Kunst-Modus** des Fernsehers und wechselt sie
  im eingestellten Takt.

## Einrichtung (einmalig)

**Du:** Fernseher vorbereiten
1. Fernseher und Raspberry Pi müssen im **selben WLAN/Heimnetz** sein.
2. Am Fernseher die IP-Adresse nachsehen: *Einstellungen → Allgemein → Netzwerk →
   Netzwerkstatus → IP-Einstellungen*. Notieren (z.B. `192.168.178.45`).
3. Tipp: Im Router (z.B. FritzBox) einstellen „diesem Gerät immer die gleiche IP geben“.

**Du:** Programm auf den Raspberry Pi holen – im Terminal des Pi eingeben:
```bash
git clone -b ccr-035f3211-bydthi https://github.com/marchens1977/Angel-Adventure.git
cd Angel-Adventure/frame-diashow
./installieren.sh
```
Am Ende zeigt das Fenster eine Adresse wie `http://192.168.178.20:8080`.

**Du:** Mit dem Handy verbinden
1. Diese Adresse im Handy-Browser öffnen (gern als Lesezeichen / „Zum Startbildschirm“).
2. Unter **Einstellungen** die IP des Fernsehers eintragen → **Speichern**.
3. **Verbindung testen** drücken. Beim ersten Mal erscheint **am Fernseher** eine Frage –
   mit der Fernbedienung **„Zulassen“** wählen. Danach merkt sich das Programm das.
4. Fotos hochladen → **Diashow starten**. Fertig! 🎉

## Gut zu wissen
- Beim ersten Start dauert es etwas: jedes Bild wird einmal zum Fernseher geschickt
  (✅ = schon dort). Danach geht der Wechsel schnell.
- Der Fernseher sollte im **Kunst-Modus** sein (oder per Knopf auf der Seite einschalten).
- Wenn der Pi neu startet, startet die Webseite automatisch mit. Die Diashow startest
  du dann wieder per Knopf.
- Bilder kannst du auch direkt (z.B. per USB-Stick) in den Ordner
  `frame-diashow/bilder` auf dem Pi kopieren.

## Wenn etwas nicht klappt
| Problem | Lösung |
|---|---|
| „Connection refused/reset“ | IP richtig? Fernseher an (nicht komplett aus)? Gleiches WLAN? |
| Keine Frage am Fernseher | *Einstellungen → Allgemein → Externe Geräteverwaltung → Gerätverbindungs-Manager*: Zugriff erlauben, ggf. Pi aus der Liste löschen und neu testen |
| Webseite geht nicht auf | Am Pi: `sudo systemctl status frame-diashow` und Adresse prüfen |
