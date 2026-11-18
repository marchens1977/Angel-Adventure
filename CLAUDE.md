# Projekt-Tagebuch: Megabarsch (Angel-Adventure)

## 1. Worum geht es?

„Megabarsch“ ist ein kleines Point-&-Click-Adventure im Retro-Pixel-Stil, das im Browser läuft (auch am Handy).
Der Spieler steht in einem Angelladen („Fishing Shop“). Der Ladenbesitzer gibt ihm die Aufgabe, den
Megabarsch im See zu fangen. Dafür nimmt sich der Spieler eine Angelrute aus dem Regal.

- **Online:** über GitHub Pages (Adresse im Stil `https://marchens1977.github.io/Angel-Adventure/`).
  Die Seite zeigt immer den Stand der Hauptversion `main`. Nach einer Änderung dauert es 1–2 Minuten,
  bis sie online ist.
- **Repository:** `marchens1977/Angel-Adventure`

### Technischer Aufbau (wichtige Dateien)

- `index.html` – das ganze Spiel in einer Datei: Aussehen, Knöpfe und Spiellogik (JavaScript).
  - Oben im Skript stehen die **Einstellungen** (Bodenhöhe, Größe der Figur `PLAYER_SCALE`,
    Laufgeschwindigkeit, Positionen von Besitzer, Theke und Regal, Klickbereiche).
  - Gezeichnet wird auf einer Zeichenfläche (Canvas) mit 800 × 450 Pixeln. Am Handy wird sie verkleinert.
  - Aktionen (Verben): „Gehe zu“, „Nimm“, „Rede mit“.
- `assets/` – Grafiken:
  - `shop.jpg` – Hintergrund des Ladens (800 × 450)
  - `owner.png` – Ladenbesitzer
  - `player_1.png` … `player_6.png` – Laufanimation der Spielfigur (Bild 1 ist auch das Standbild)
- `werkzeuge/` – Hilfsprogramme (siehe Abschnitt 8)

## 2. Wichtige Regeln und Entscheidungen

- Die Theke wird nach dem Besitzer noch einmal darübergezeichnet, damit er **hinter** dem Tresen steht.
- Die Spielfigur wird 1,75-fach vergrößert (`PLAYER_SCALE`), damit sie zu Raum und Besitzer passt.
  Ihr Kopf soll etwa so groß sein wie der des Besitzers.
- Der Laden heißt im Spiel „Fishing Shop“ (Schild oben rechts).
- Änderungen werden nach Absprache **direkt in `main`** übernommen (oder per Pull Request, den Claude selbst
  anlegt und übernimmt), damit der Nutzer nichts selbst anklicken muss.

## 3. Verlauf

| Datum | Was | PR |
|---|---|---|
| vor 2026-11-15 | Erste Version hochgeladen; Grafiken eingebaut; Laden in „Fishing Shop“ umbenannt | – |
| 2026-11-15 | Spielfigur passend zu Raum und Besitzer vergrößert, etwas weiter vorne platziert, schnelleres Laufen | #1 |
| 2026-11-16 | Dieses Projekt-Tagebuch angelegt | – |
| 2026-11-18 | Regel „Hilfsprogramme und Tests gehören ins Projekt“ ergänzt; Vorschaubild-Werkzeug gesichert | – |

## 4. Offene Ideen / nächste Schritte

- Neuer Raum „See“ (Ausgang aus dem Laden)
- Angel-Minispiel, um den Megabarsch zu fangen
- Weitere Gegenstände (Köder, Kescher, Würmer)
- Aktion „Schau an“ mit Beschreibungen
- Spielstand speichern
- Bedienung am Handy verbessern (größere Knöpfe, besser lesbare Texte)

## 5. Hinweise zur Zusammenarbeit

- Der Nutzer ist **Programmier-Laie**. Antworte in **einfachem Deutsch**, erkläre Fachbegriffe kurz.
- Gib **kleine, nummerierte Schritte** und sag klar, **was Claude übernimmt** und **was der Nutzer selbst tun muss**.
- Claude übernimmt alles, was möglich ist – auch Pull Request anlegen und übernehmen (mergen).
- Vor dem Hochladen Änderungen testen und dem Nutzer ein Vorschaubild zeigen.
- Hardware des Nutzers: nur **Samsung-Smartphone (Chrome)** und **Raspberry Pi 400**.

## 6. Modell-Hinweis

Wenn du nicht auf Opus läufst (z. B. Fable) und eine Aufgabe abgeschlossen ist, erinnere den Nutzer am Ende
der Antwort: „Tipp: Du kannst jetzt mit /model claude-opus-5-5 zurückstellen.“

## 7. Pflege dieses Tagebuchs

Nach jeder größeren Änderung dieses Tagebuch aktualisieren (Verlauf, Entscheidungen, offene Ideen).

## 8. Hilfsprogramme und Tests gehören ins Projekt

1. Automatische Prüfungen (Tests) und Hilfsprogramme, die über eine einzelne Aufgabe hinaus nützlich sind,
   werden im Projekt gespeichert (Ordner `werkzeuge/` oder `test/`) – nicht nur im Arbeitsbereich der Sitzung,
   der beim Archivieren verloren geht.
2. Hier im Tagebuch steht, wie man sie startet und was sie prüfen.
3. Nach jeder Code-Änderung die vorhandenen Prüfungen laufen lassen; bei neuen Funktionen passende Prüfpunkte ergänzen.
4. Gibt es noch keine automatische Prüfung, bei der nächsten Code-Änderung eine einfache anlegen.
5. Was Claude nicht selbst testen kann, hier als Test für den Nutzer vermerken.

### Vorhandene Hilfsprogramme

- `werkzeuge/screenshot.js` – macht ein Vorschaubild der Spielfläche (Startzustand), um Größen und
  Positionen zu prüfen. Start im Projektordner: `node werkzeuge/screenshot.js vorschau.png`
  (braucht Playwright mit Chromium, in Claude-Cloud-Sitzungen vorhanden). Das Bild nicht ins Projekt hochladen.

### Automatische Prüfungen

- Noch keine. Bei der nächsten Code-Änderung eine einfache anlegen (z. B. Spiel lädt ohne Fehler,
  Gespräch mit dem Besitzer und Rute nehmen funktionieren).

### Tests für den Nutzer (kann Claude nicht selbst prüfen)

- Spiel auf dem echten Samsung-Handy (Chrome) öffnen: Passt die Größe, lässt sich alles gut antippen?
