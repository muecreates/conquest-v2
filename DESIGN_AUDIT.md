# Design Audit — Conquest v2

_Erstellt 2026-07-05_

## Maps — Geodaten-Status

| Map | Territorien | Quelle | Qualität |
|-----|------------|--------|----------|
| Weltmap | 42 | Risk-Board SVG + Natural Earth (d: paths, long M/L/Z sequences) | ✓ Echte Geodaten |
| Europa | 29 | Echte Ländergrenzen (d: paths) | ✓ Echte Geodaten |
| Deutschland | 16 | GeoJSON Bundesländer (d: paths) | ✓ Echte Geodaten |
| Afrika | 24 | Natural Earth admin0, Ländergrenzen (d: paths) | ✓ Echte Geodaten |
| Köln | 9 | codeforgermany Stadtteile → Bezirke (d: paths) | ✓ Echte Geodaten |
| Marbella | 11 | OSM-Koordinaten + Voronoi-Tessellation (d: paths) | ✓ Geografisch korrekt |
| San Andreas | 12 | Proportionale GTA-SA Polygone (d: paths) | ✓ Erkennbar, kein fake |
| Bikini Bottom | 9 | Cubic-Bezier organische Shapes (d: paths) | ✓ Stilistisch passend |

**Fazit: Alle Maps haben echte Paths — keine Fake-Rechtecke vorhanden.**

---

## Bestehende Animationen

| Animation | Existiert | Qualität |
|-----------|-----------|---------|
| `fadeIn` (base.css) | ✓ | Einfach, funktional |
| `pulse` (base.css) | ✓ | Nur Opacity |
| `shake` (base.css) | ✓ | Einfach |
| `popIn` (base.css) | ✓ | Gut |
| `rollDie` (base.css) | ✓ | Nur 2D rotate |
| `pulse-border` (game.css) | ✓ | Attackable/fortifiable territories |
| `slideUp` (game.css) | ✓ | Deploy-Panel |
| `lcPulse` (overlays.css) | ✓ | Last-Chance Overlay |
| **animations.css** | ✗ | **FEHLT KOMPLETT** |

**Fehlende Animationen:**
- Territory-Conquest Flash (weißes Flash → Spielerfarbe)
- Würfel 3D-Roll (echte CSS 3D rotation)
- Truppen-Bewegungs-Animation (SVG animateMotion)
- Turn-Wechsel-Banner (slide-in/out "SPIELER X IST DRAN")
- Karten-Einlösen (Karten fliegen zusammen + Bonus-Bounce)
- Sieg-Konfetti (Canvas particle system)
- Kampf-Indicator (crossed swords pulsieren)

---

## UI-Schwachstellen (Priorisiert)

### P0 — Kritisch (funktional fehlt)
1. **animations.css fehlt komplett** — Phase 3 aller Animationen nicht implementiert
2. **Cinzel-Font fehlt** — base.css nutzt system-ui, kein Google Font `Cinzel` eingebunden
3. **Panel-Borders nicht #f0c040** — aktuell `var(--border)` (#30363d), Risk-Brettspiel-Ästhetik fehlt
4. **Buttons nicht #f0c040** — accent ist blau (#388bfd), nicht gold

### P1 — Hoch (Design fehlt)
5. **Territory-Conquest-Feedback fehlt** — kein visuelles Flash wenn Territorium eingenommen
6. **Turn-Wechsel-Banner fehlt** — kein animierter Slide-in
7. **Sieg-Screen kein Konfetti** — game-over-card hat keine Konfetti-Animation

### P2 — Mittel (UX)
8. **Lobby Map-Thumbnails** — Emojis statt SVG-Previews (Server-API /api/map-thumbs vorhanden aber evtl. nicht genutzt)
9. **Phasen-Indicator** — badge im Panel, kein Tab-Row mittig oben
10. **Spieler-Panel** — aktiver Spieler hat nur border-color: var(--accent) (blau), nicht Spielerfarbe
11. **Touch-Events** — kein explizites touch event handling auf SVG-Paths

### P3 — Nice-to-have
12. Würfel-3D-Rotation fehlt echter 3D-Effekt
13. Kein crossed-swords Kampf-Indicator
14. Territory-Label-Overlap möglich (y-16 offset)
