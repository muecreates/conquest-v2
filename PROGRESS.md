## Status: FERTIG — v2.0.0

## Zuletzt abgeschlossen: Schritt 11 — Alle Schritte complete
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
├── server.js                        # Express + Socket.io, Rooms, KI-Scheduling
├── railway.json                     # Railway deploy config
├── Procfile                         # web: node server.js
├── .gitignore
├── .env.example
├── PROGRESS.md
│
├── engine/
│   ├── combatEngine.js              # Würfellogik, lookup table, Blitz-Modus
│   ├── cardEngine.js                # Risk-Kartendeck, Set-Erkennung, Einlösewerte
│   ├── specialCards.js              # ☢️ Atombombe | 🛡 Festung | ⚡ Blitzkrieg
│   ├── gameEngine.js                # Phasen, Letzte-Chance, Siegbedingung
│   ├── aiEngine.js                  # KI Easy / Medium / Hard
│   └── maps/
│       ├── mapLoader.js             # Lädt alle 6 Maps, BFS-Verbindungsprüfung
│       ├── world.js                 # 42 Territorien, 6 Kontinente (Risk-klassisch)
│       ├── europe.js                # 28 Territorien, 5 Kontinente
│       ├── africa.js                # 22 Territorien, 5 Kontinente
│       ├── germany.js               # 16 Bundesländer, 5 Regionen
│       ├── koeln.js                 # 9 Stadtteile, 5 Bezirke
│       └── marbella.js              # 11 Viertel, 2 Zonen
│
└── public/
    ├── index.html                   # SPA: Lobby + Multiplayer-Screen
    ├── game.html                    # Spielfeld + Combat-Modal + Last-Chance
    ├── css/
    │   ├── base.css                 # Design-Tokens, Buttons
    │   ├── lobby.css                # Lobby-Layout, Presets, Karussell
    │   ├── game.css                 # SVG-Map, Panel, Würfel, Karten
    │   └── overlays.css             # Modal, Toast, GameOver, LastChance
    └── js/
        ├── lobby.js                 # Presets, Map-Auswahl, SP/MP-Routing
        ├── game.js                  # Socket-Events, Territory-Klick, SP-Karten
        ├── render.js                # SVG-Map rendern, Highlights, Truppenblasen
        ├── ui.js                    # Panel-Updates, Toast, Karten-UI, Special Cards
        └── dice.js                  # Würfel-Animation, Combat-Modal, WinChance
```

---

## Features (vollständig implementiert)

### Lobby
- 3 Presets: Blitz (20min) / Standard (45min) / Klassisch (90min)
- 6 Maps im horizontalen Karussell mit Emoji, Territorienanzahl, Spielzeit
- Spielerzahl-Toggle [2][3][4][5][6], KI-Level, Gefecht-Modus
- Karten (Eskalation/Fix/Keine), Setup (Auto/Zufällig/Draft)
- 💥 Special Cards Toggle, Sieg-Schwelle (40%/50%/100%)
- 💀 Letzte Chance mit Trigger-Territorienanzahl
- Singleplayer → direkt zu game.html
- Multiplayer → SPA-Screen mit Raum-Code + QR

### 6 Maps
| Map | Territorien | Kontinente |
|-----|-------------|------------|
| Köln | 9 | 5 |
| Marbella | 11 | 2 |
| Deutschland | 16 | 5 |
| Europa | 28 | 5 |
| Afrika | 22 | 5 |
| Weltmap | 42 | 6 |

### Spiellogik (server-seitig)
- Setup → Draft → Angriff → Verstärken
- Balanced / Auto / Draft Territoriumverteilung
- Siege-Bedingung via victoryThreshold (40/50/100%)
- Karten-System (44 Karten, Eskalation/Fix/Keine)
- Kontinent-Boni
- KI Easy / Medium / Hard

### Special Cards (Schritt 6)
- ☢️ Atombombe: Feindgebiet → troops=0, owner=null (1x pro Spiel)
- 🛡 Festung: Eigenes Gebiet → +3 Verteidigungswürfel (einmalig)
- ⚡ Blitzkrieg: Nächster Angriff → min(troops-1, 6) Würfel
- Vergabe: alle 5 Runden an Spieler ohne Karte

### Letzte Chance (Schritt 7)
- Trigger: ≤ N Territorien (einstellbar 2/3/4/5)
- Gratis Spezialkarte + rotes Overlay + Log-Eintrag
- Einmalig pro Spieler

### Würfel-Modal (Schritt 8)
- Combat-Modal über Map bei jedem Angriff
- Würfel-Animation (rollDie) mit Gewinner/Verlierer-Highlight
- Auto-close bei Blitz-Modus
- Win-Chance-Anzeige (lookup table)

### Multiplayer-Backend
- 4-stelliger alphanumerischer Code (A-Z/0-9, ohne O/0/I/1)
- Host erstellt Raum ohne sofortigen Start
- Weitere Spieler joinen via Code
- + KI-Button für Host
- Start-Button (min. 2 Spieler)
- QR-Code via CDN

### Deployment
- GET /health → {status:'ok', version:'2.0.0'}
- railway.json konfiguriert
- Procfile: web: node server.js
- PORT aus process.env

---

## Bekannte Einschränkungen
- Afrika-Map: SVG-Paths aus älterer Version, visuell nicht geprüft
- Multiplayer: Nur 1 echter Human + KI bisher vollständig getestet (server-seitig fertig)
- QR-Code: Benötigt CDN-Verfügbarkeit (cdnjs qrcode.js)
- Special Cards: KI benutzt sie noch nicht (nur human player)

---

## Railway Deploy
1. `git push origin main`
2. Railway → New Project → Deploy from GitHub
3. Auto-deploy bei jedem Push
4. URL: https://[dein-projekt].railway.app
