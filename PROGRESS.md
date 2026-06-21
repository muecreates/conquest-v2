## Status: FERTIG — v2.3.0

## Zuletzt abgeschlossen: Map-Qualität + Kontinent-Glow (Schritte 2-3)
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
├── server.js                        # Express + Socket.io + /api/map-thumbs
├── railway.json
├── Procfile
├── reference/
│   ├── conquest.jsx                 # Referenz für Spiellogik + Design
│   ├── europe.svg / koeln.svg / marbella.svg / world.svg
├── PROGRESS.md
│
├── engine/maps/
│   ├── mapLoader.js                 # 8 Maps
│   ├── world.js                     # 42T — echte SVG-Paths (Risk-Weltmap)
│   ├── europe.js                    # 29T — echte SVG-Paths
│   ├── africa.js                    # 24T — GeoJSON-Paths (countries.geojson)
│   ├── germany.js                   # 16T — GeoJSON-Paths (Bundesländer)
│   ├── koeln.js                     # 9T  — Paths aus Koelngliederung.svg
│   ├── marbella.js                  # 11T — proportionale Polygon-Shapes
│   ├── sanandreas.js                # 12T — "San Andreas" proportionale Shapes
│   └── bikiniBottom.js              # 9T  — organische Cubic-Bezier Shapes
│
└── public/
    ├── index.html                   # Lobby
    ├── game.html                    # Spielfeld + Bottom-Deploy-Panel
    ├── css/
    │   ├── base.css                 # Tokens + btn-success/warn
    │   ├── lobby.css                # Settings + Mobile-Breakpoints
    │   ├── game.css                 # Map-Styles + Bottom-Panel + Mobile
    │   └── overlays.css
    └── js/
        ├── lobby.js                 # Map-Thumbnails, Zeitschätzung
        ├── game.js                  # Bottom-Deploy-Panel, Turn-Timer
        ├── render.js                # Kontinent-farbige Borders + Labels
        ├── ui.js                    # Panel + Karten auto-expand
        └── dice.js
```

---

## Fix-Schritt 1: Map Shapes

| Map | Quelle | Qualität |
|-----|--------|----------|
| Weltmap (42T) | Risk SVG d-Paths | ✓ Echte Shapes |
| Europa (29T) | SVG d-Paths | ✓ Echte Shapes |
| Afrika (24T) | GeoJSON countries.geojson | ✓ Echte Ländergrenzen |
| Deutschland (16T) | GeoJSON Bundesländer | ✓ Echte Bundesland-Shapes |
| Köln (9T) | Koelngliederung.svg → skaliert auf 960×600 | ✓ Echte Bezirksgrenzen |
| Marbella (11T) | Proportionale Polygone | ✓ Erkennbare Viertel-Shapes |
| San Andreas (12T) | Proportionale SA-Karte Polygone | ✓ LS/SF/LV erkennbar |
| Bikini Bottom (9T) | Cubic-Bezier organische Shapes | ✓ Organische Formen |

## Fix-Schritt 2: Kontinent-Borders + Labels (aktualisiert v2.3.0)
- Jedes Territory: stroke in Kontinent-Farbe, 2px
- Kontinent-Grenzen: feGaussianBlur-Glow (6px, helle Farbe, 55% Opazität) hinter Territories die an anderen Kontinenten grenzen
- lightenHex + isContinentBorder Helpers in render.js
- Selected: weißer 3px stroke
- Attackable/Fortifiable: pulsierender roter/grüner stroke
- Kontinent-Labels: zentriertes Text über allen Territories (18% Opacity, uppercase)

## Fix-Schritt 3: Deploy-Panel unten
- Neues .deploy-bottom-panel erscheint unten über der Map
- [−] Slider [+] PLATZIEREN ✓ Button (groß, blau, prominent)
- Setup-Phase: 1 Truppe (kein Slider), nur Bestätigen
- Draft-Phase: Slider 1..max, dann PLATZIEREN
- Kein Auto-Deploy mehr bei Territory-Klick

## Fix-Schritt 4: Panel-Verbesserungen
- Territory-Info: Name 16px bold, Truppen prominent (20px)
- Karten-Bereich: auto-expand wenn Karten vorhanden
- Kontinent-Badges in Spieler-Übersicht

## Fix-Schritt 5: Lobby Map-Thumbnails
- /api/map-thumbs: miniaturisierte SVG-Previews für jede Map
- Kleine Maps (<16T): echte Path-Shapes, größere Maps: Dot-Visualisierung
- Wird async geladen, Fallback auf Emojis

## Fix-Schritt 6: Mobile-Optimierung
- Mobile (≤768px): Map oben 60vh, Panel unten 40vh
- Kein horizontales Scrollen
- Touch-Targets ≥44px
- Font-Sizes ≥12px
- Lobby: Single-column auf kleinen Screens

## Fix-Schritt 7: San Andreas Umbenennung
- Display-Name: "San Andreas" (nicht "GTA San Andreas")
- Dateiname bleibt: sanandreas.js / id: 'sanandreas'
- Lobby-Karte aktualisiert

---

## Railway Deploy
1. `git push origin main`
2. Railway → New Project → Deploy from GitHub
3. Auto-deploy bei jedem Push
