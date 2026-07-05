// Bikini Bottom — 9 organische Unterwasser-Territorien (800x600)
// Oben: Mrs Puff's School (links), Jellyfish Fields (rechts, groß)
// Mitte: Goo Lagoon (links), Patrick's Rock (mitte-links), Bikini Bottom Zentrum (mitte, groß), Sandy's Dome (rechts)
// Unten: Rock Bottom (links), Krusty Krab (mitte-rechts), The Trench (unten)
const BIKINI_BOTTOM_MAP = {
  id: 'bikiniBottom',
  name: 'Bikini Bottom',
  description: '9 Territorien · ~15 Min',
  estimatedTime: 15,
  viewBox: '0 0 800 600',
  territories: [

    // ── MRS PUFF'S SCHOOL — oben links ───────────────────────────────────────
    { id: 'mrs_puffs', name: "Mrs. Puff's", continent: 'outskirts',
      labelX: 125, labelY: 130,
      adjacencies: ['jellyfish_fields', 'goo_lagoon', 'patricks_rock'],
      d: 'M 15,20 C 70,10 175,15 225,35 C 260,50 268,85 258,125 C 247,165 218,195 180,205 C 140,215 88,205 55,185 C 22,165 8,130 10,90 C 12,60 15,28 15,20 Z' },

    // ── JELLYFISH FIELDS — oben rechts, groß ──────────────────────────────────
    { id: 'jellyfish_fields', name: 'Jellyfish Fields', continent: 'outskirts',
      labelX: 530, labelY: 115,
      adjacencies: ['mrs_puffs', 'patricks_rock', 'bikini_bottom', 'sandys_dome'],
      d: 'M 238,18 C 340,8 520,5 660,15 C 730,20 778,35 790,60 C 800,80 800,130 795,165 C 788,200 765,222 728,232 C 685,244 620,248 550,245 C 480,242 410,232 358,215 C 305,198 265,172 255,140 C 244,108 238,50 238,18 Z' },

    // ── GOO LAGOON — links mitte ──────────────────────────────────────────────
    { id: 'goo_lagoon', name: 'Goo Lagoon', continent: 'outskirts',
      labelX: 80, labelY: 310,
      adjacencies: ['mrs_puffs', 'patricks_rock', 'rock_bottom'],
      d: 'M 10,208 C 42,192 100,188 145,205 C 178,218 195,248 192,285 C 188,322 165,352 130,365 C 92,378 48,368 25,345 C 2,322 0,288 5,258 C 8,235 10,215 10,208 Z' },

    // ── PATRICK'S ROCK — mitte links ─────────────────────────────────────────
    { id: 'patricks_rock', name: "Patrick's Rock", continent: 'downtown',
      labelX: 265, labelY: 275,
      adjacencies: ['mrs_puffs', 'jellyfish_fields', 'goo_lagoon', 'bikini_bottom', 'rock_bottom'],
      d: 'M 150,205 C 198,192 270,188 320,205 C 355,218 372,250 368,290 C 364,330 335,360 295,372 C 254,384 205,375 172,352 C 138,328 128,290 132,258 C 136,232 148,210 150,205 Z' },

    // ── BIKINI BOTTOM — mitte zentrum, groß ───────────────────────────────────
    { id: 'bikini_bottom', name: 'Bikini Bottom', continent: 'downtown',
      labelX: 470, labelY: 310,
      adjacencies: ['jellyfish_fields', 'patricks_rock', 'sandys_dome', 'krusty_krab', 'rock_bottom'],
      d: 'M 330,200 C 400,185 510,180 590,195 C 638,205 668,232 672,272 C 676,310 658,350 622,375 C 580,402 520,415 452,415 C 384,415 322,400 288,372 C 260,348 258,310 270,278 C 280,252 308,212 330,200 Z' },

    // ── SANDY'S DOME — rechts mitte ───────────────────────────────────────────
    { id: 'sandys_dome', name: "Sandy's Dome", continent: 'outskirts',
      labelX: 700, labelY: 305,
      adjacencies: ['jellyfish_fields', 'bikini_bottom', 'krusty_krab'],
      d: 'M 678,235 C 715,220 762,220 788,242 C 800,255 800,305 800,345 L 800,400 C 782,415 748,422 715,415 C 678,408 652,382 646,350 C 640,318 648,280 662,258 L 678,235 Z' },

    // ── ROCK BOTTOM — unten links ─────────────────────────────────────────────
    { id: 'rock_bottom', name: 'Rock Bottom', continent: 'deep',
      labelX: 135, labelY: 488,
      adjacencies: ['goo_lagoon', 'patricks_rock', 'bikini_bottom', 'krusty_krab', 'the_trench'],
      d: 'M 12,368 C 50,352 112,348 158,365 C 195,378 215,410 212,450 C 208,490 182,520 145,532 C 105,544 58,535 30,510 C 5,488 0,455 4,425 C 8,400 12,375 12,368 Z' },

    // ── KRUSTY KRAB — unten rechts von mitte ──────────────────────────────────
    { id: 'krusty_krab', name: 'Krusty Krab', continent: 'deep',
      labelX: 460, labelY: 488,
      adjacencies: ['bikini_bottom', 'sandys_dome', 'rock_bottom', 'the_trench'],
      d: 'M 270,418 C 350,402 480,398 590,408 C 648,414 685,435 688,468 C 692,502 660,530 615,542 C 562,556 488,558 418,552 C 348,546 295,525 270,498 C 248,474 248,438 270,418 Z' },

    // ── THE TRENCH — unten, durchgehend ───────────────────────────────────────
    { id: 'the_trench', name: 'The Trench', continent: 'deep',
      labelX: 400, labelY: 575,
      adjacencies: ['rock_bottom', 'krusty_krab'],
      d: 'M 155,538 C 240,522 360,518 490,522 C 580,526 650,540 700,555 C 740,566 765,580 760,595 L 760,600 L 15,600 L 15,575 C 30,558 70,548 115,542 L 155,538 Z' },

  ],

  continents: {
    downtown: {
      name: 'Stadtzentrum',
      bonus: 3,
      color: '#f59e0b',
      territories: ['patricks_rock', 'bikini_bottom']
    },
    outskirts: {
      name: 'Außenbezirk',
      bonus: 2,
      color: '#22c55e',
      territories: ['mrs_puffs', 'jellyfish_fields', 'goo_lagoon', 'sandys_dome']
    },
    deep: {
      name: 'Tiefsee',
      bonus: 2,
      color: '#3b82f6',
      territories: ['rock_bottom', 'krusty_krab', 'the_trench']
    }
  },

  crossConnections: []
};

module.exports = { BIKINI_BOTTOM_MAP };
