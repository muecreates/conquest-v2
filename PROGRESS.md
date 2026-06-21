## Status: FERTIG — v2.1.0

## Zuletzt abgeschlossen: Alle 13 Schritte implementiert
## Nächster Schritt: git push origin main → Railway auto-deploy

## Starten
```bash
npm install && node server.js
# → http://localhost:3000
```

---

## Dateibaum

```
conquest-v2/
├── package.json
├── server.js                        # Express + Socket.io, Rooms, Turn-Timer, KI-Scheduling
├── railway.json                     # Railway deploy config
├── Procfile                         # web: node server.js
├── reference/
│   ├── conquest.jsx                 # Referenz für Spiellogik + Design
│   ├── europe.svg                   # Europa SVG Quelle
│   ├── koeln.svg                    # Köln SVG Quelle (Koelngliederung)
│   ├── marbella.svg                 # Marbella SVG Quelle
│   └── world.svg                    # Weltmap SVG Quelle
├── PROGRESS.md
│
├── engine/
│   ├── combatEngine.js              # Würfellogik, lookup table, Blitz-Modus
│   ├── cardEngine.js                # Risk-Kartendeck, Set-Erkennung, Einlösewerte
│   ├── specialCards.js              # ☢️ Atombombe | 🛡 Festung | ⚡ Blitzkrieg
│   ├── gameEngine.js                # Phasen, Letzte-Chance, Siegbedingung
│   ├── aiEngine.js                  # KI Easy / Medium / Hard
│   └── maps/
│       ├── mapLoader.js             # Lädt alle 8 Maps, BFS-Verbindungsprüfung
│       ├── world.js                 # 42 Territorien, 6 Kontinente (echte SVG-Paths)
│       ├── europe.js                # 29 Territorien, 5 Kontinente (echte SVG-Paths)
│       ├── africa.js                # 22 Territorien, 5 Kontinente
│       ├── germany.js               # 16 Bundesländer, 5 Regionen
│       ├── koeln.js                 # 9 Stadtteile — echte Paths aus Koelngliederung.svg
│       ├── marbella.js              # 11 Viertel, 2 Zonen
│       ├── sanandreas.js            # 12 Territorien, 3 Kontinente (GTA SA)
│       └── bikiniBottom.js          # 9 Territorien, 3 Kontinente
│
└── public/
    ├── index.html                   # SPA: Lobby (vollständiger Einstellungsscreen)
    ├── game.html                    # Spielfeld + Combat-Modal + Turn-Timer
    ├── css/
    │   ├── base.css                 # Design-Tokens, Buttons (inkl. btn-success/warn)
    │   ├── lobby.css                # Settings-Rows, Zeitschätzung, MP-Slots
    │   ├── game.css                 # SVG-Map (echte Borders), Turn-Timer-Bar, Kontinent-Badges
    │   └── overlays.css             # Modal, Toast, GameOver, LastChance
    └── js/
        ├── lobby.js                 # Presets, Zeitschätzung, AI-Slots per Slot, Map-Auswahl
        ├── game.js                  # Socket-Events, Territory-Klick, Turn-Timer
        ├── render.js                # SVG-Map rendern, Highlights, Truppenblasen
        ├── ui.js                    # Panel-Updates, Kontinent-Badges, Karten-UI
        └── dice.js                  # Würfel-Animation, Combat-Modal, WinChance
```

---

## Features (vollständig implementiert)

### Schritt 1+2: Maps — echte SVG-Paths
- world.js: 42 Territorien mit echten SVG d-Paths aus BlankMap-World.svg
- europe.js: 29 Territorien mit echten SVG d-Paths
- koeln.js: 9 Stadtbezirke mit echten Paths aus Koelngliederung.svg (Python-geparst)

### Schritt 3: Territory-Borders
- stroke: #0a1628, stroke-width: 1.5px, stroke-linejoin: round
- Grenzen sind klar sichtbar, keine verschmolzenen Gebiete

### Schritt 4: GTA San Andreas Map
- 12 Territorien, 3 Kontinente: Los Santos (+3), San Fierro (+2), Las Venturas (+2)
- Whetstone + Red County als Bonusterritorien

### Schritt 5: Bikini Bottom Map
- 9 Territorien: Downtown, Krusty Krab, Chum Bucket, Jellyfish Fields, Goo Lagoon,
  Rock Bottom, Kelp Forest, Industrial Zone, Sandy's Dome
- 3 Kontinente: Downtown (+3), Außenbezirk (+2), Tiefsee (+2)

### Schritt 6: Lobby — kompletter Einstellungsscreen
- Alle Settings sichtbar auf einem Screen (kein Toggle mehr)
- Map-Auswahl: 8 Maps im Karussell
- Preset: Blitz / Standard / Klassisch → setzt alle Settings automatisch
- Truppenverteilung: Auto / Klassisch-Draft
- Karten: An / Aus
- Gefecht, Spieler, KI-Level, Sieg, Special Cards, Letzte Chance, Timer
- Großer "SINGLEPLAYER STARTEN" Button

### Schritt 7: Truppenverteilung Auto vs. Klassisch-Draft
- Auto: Territorien gleichmäßig verteilt, Spiel startet sofort
- Klassisch-Draft: klassische Setup→Draft→Angriff Phasen wie in conquest.jsx

### Schritt 8: Spielzeit-Schätzung (live)
- Formel: MAP_BASE_TIMES × Spieler-Faktor × Karten-Faktor × Draft-Faktor × Preset-Faktor
- Bikini Bottom Blitz ≈ "ca. 8–14 Min"
- Weltmap Klassisch ≈ "ca. 56–105 Min"
- Multiplayer: Zusatz "(abhängig von Spielergeschwindigkeit)"

### Schritt 9: Karten-System
- Standard Risk-Karten (Infantry/Cavalry/Artillery/Wild) + Set-Einlöse-System
- Toggle in Lobby: An (Standard Eskalation) / Aus (keine Karten)
- KI löst Karten automatisch ein

### Schritt 10: Zuglimit bei Multiplayer
- Konfigurierbarer Timer: 30s / 60s (default) / 120s / Aus
- Timer-Balken oben im Panel (rot, läuft ab)
- Bei Ablauf: Auto-Zug — stärkste Grenze verstärken, Angriff/Verstärken skippen

### Schritt 11: KI-Bots im Multiplayer
- Player-Slots mit Mensch/Bot-Toggle
- Host setzt jeden Slot auf Mensch oder Bot
- `sync_bots_and_start`: Server synct Bots und startet sofort

### Schritt 12: Platzieren-Button
- In Setup-Phase: Territory klicken → "Platzieren"-Button erscheint
- In Draft-Phase: Territory klicken → Slider + "Platzieren"-Button
- Sichtbarer deployBtn in beiden Phasen

### Schritt 13: UI/UX
- Farbkodierte Buttons: ⚔ orange=Angriff-Start, rot=Angreifen, blau=Verstärken, grün=Zug beenden
- Kontinent-Badges in Spieler-Übersicht (zeigt welche Kontinente ein Spieler kontrolliert)
- Territory-Stroke für klare Grenzen
- Turn-Timer-Bar sichtbar im Panel

---

## 8 Maps
| Map | Territorien | Kontinente | Zeit |
|-----|-------------|------------|------|
| Bikini Bottom | 9 | 3 | ~15 Min |
| Köln | 9 | 5 | ~20 Min |
| Marbella | 11 | 2 | ~20 Min |
| GTA San Andreas | 12 | 3 | ~30 Min |
| Deutschland | 16 | 5 | ~25 Min |
| Afrika | 22 | 5 | ~35 Min |
| Europa | 29 | 5 | ~40 Min |
| Weltmap | 42 | 6 | ~75 Min |

---

## Railway Deploy
1. `git push origin main`
2. Railway → New Project → Deploy from GitHub
3. Auto-deploy bei jedem Push
