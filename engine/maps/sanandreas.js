// San Andreas — 12 Territorien, organische Polygone entsprechend der echten GTA-SA-Karte (800x600)
// Los Santos: unten rechts, San Fierro: links (Küste), Las Venturas: oben rechts (Wüste)
// Countryside füllt die Mitte
const SANANDREAS_MAP = {
  id: 'sanandreas',
  name: 'San Andreas',
  description: '12 Territorien · ~30 Min',
  estimatedTime: 30,
  viewBox: '0 0 800 600',
  territories: [

    // ── LOS SANTOS — unten rechts, groß, L-Form ──────────────────────────────
    { id: 'los_santos', name: 'Los Santos', continent: 'los_santos',
      labelX: 640, labelY: 510,
      adjacencies: ['flint_county', 'red_county', 'dillimore'],
      d: 'M 548,400 C 575,385 620,378 668,382 C 710,386 748,398 770,418 C 792,438 800,468 798,498 C 796,528 778,556 750,570 C 718,584 678,588 640,585 C 600,582 558,570 535,550 C 510,528 500,498 505,468 C 510,442 528,412 548,400 Z' },

    // ── FLINT COUNTY — unter Los Santos, SW ──────────────────────────────────
    { id: 'flint_county', name: 'Flint County', continent: 'los_santos',
      labelX: 490, labelY: 528,
      adjacencies: ['los_santos', 'whetstone', 'dillimore'],
      d: 'M 348,468 C 378,455 430,448 480,452 C 510,456 530,470 532,495 C 534,520 515,545 490,558 C 460,572 420,576 385,568 C 350,560 320,542 310,518 C 300,494 312,472 335,462 L 348,468 Z' },

    // ── WHETSTONE — ganz unten links ─────────────────────────────────────────
    { id: 'whetstone', name: 'Whetstone', continent: 'los_santos',
      labelX: 205, labelY: 528,
      adjacencies: ['flint_county', 'angel_pine', 'dillimore'],
      d: 'M 85,478 C 118,462 168,455 218,460 C 255,464 282,480 288,505 C 295,530 278,556 250,568 C 218,582 175,584 140,575 C 105,566 78,545 70,520 C 62,498 72,480 85,478 Z' },

    // ── DILLIMORE — mitte rechts ──────────────────────────────────────────────
    { id: 'dillimore', name: 'Dillimore', continent: 'los_santos',
      labelX: 465, labelY: 415,
      adjacencies: ['los_santos', 'flint_county', 'whetstone', 'angel_pine', 'red_county', 'bone_county'],
      d: 'M 295,365 C 345,348 430,342 510,352 C 558,358 590,378 592,410 C 594,440 572,468 540,480 C 505,492 455,495 408,485 C 360,475 318,455 295,430 C 272,406 268,378 285,362 L 295,365 Z' },

    // ── RED COUNTY — oben mitte-rechts ────────────────────────────────────────
    { id: 'red_county', name: 'Red County', continent: 'las_venturas',
      labelX: 610, labelY: 328,
      adjacencies: ['los_santos', 'dillimore', 'bone_county', 'las_venturas'],
      d: 'M 525,248 C 575,232 648,228 710,242 C 755,252 785,278 790,315 C 795,352 775,388 740,405 C 700,422 645,428 595,418 C 548,408 512,385 505,355 C 498,325 506,280 525,260 L 525,248 Z' },

    // ── LAS VENTURAS — oben rechts, flache Wüste ──────────────────────────────
    { id: 'las_venturas', name: 'Las Venturas', continent: 'las_venturas',
      labelX: 660, labelY: 162,
      adjacencies: ['red_county', 'bone_county', 'el_quebrados'],
      d: 'M 510,85 C 572,72 658,68 735,78 C 778,84 800,100 800,128 L 800,215 C 785,235 750,248 705,252 C 655,256 598,250 555,235 C 510,220 485,195 488,165 C 490,138 502,102 510,85 Z' },

    // ── BONE COUNTY — oben mitte, Wüste ──────────────────────────────────────
    { id: 'bone_county', name: 'Bone County', continent: 'las_venturas',
      labelX: 425, labelY: 195,
      adjacencies: ['dillimore', 'red_county', 'las_venturas', 'el_quebrados', 'angel_pine', 'tierra_robada'],
      d: 'M 308,125 C 358,108 440,102 508,115 C 550,124 572,148 572,185 C 572,222 548,255 510,272 C 468,290 410,298 358,288 C 308,278 268,252 255,220 C 242,188 252,152 275,135 L 308,125 Z' },

    // ── TIERRA ROBADA — oben links, Halbinsel ────────────────────────────────
    { id: 'tierra_robada', name: 'Tierra Robada', continent: 'san_fierro',
      labelX: 178, labelY: 128,
      adjacencies: ['bayside', 'sf_city', 'el_quebrados', 'bone_county'],
      d: 'M 42,55 C 95,38 175,32 245,45 C 290,54 318,80 318,118 C 318,158 292,188 250,202 C 205,216 148,218 105,202 C 60,185 30,152 28,118 C 26,88 38,62 42,55 Z' },

    // ── BAYSIDE — ganz oben links ─────────────────────────────────────────────
    { id: 'bayside', name: 'Bayside', continent: 'san_fierro',
      labelX: 48, labelY: 85,
      adjacencies: ['tierra_robada', 'sf_city'],
      d: 'M 8,18 C 35,8 85,5 118,18 C 148,30 162,58 155,88 C 148,118 125,138 95,142 C 62,146 28,130 12,105 C -2,82 0,48 8,18 Z' },

    // ── SAN FIERRO CITY — links mitte, Halbinsel ─────────────────────────────
    { id: 'sf_city', name: 'San Fierro', continent: 'san_fierro',
      labelX: 105, labelY: 288,
      adjacencies: ['bayside', 'tierra_robada', 'el_quebrados', 'angel_pine'],
      d: 'M 12,148 C 45,132 98,128 142,145 C 178,158 198,188 195,225 C 192,262 168,292 132,308 C 95,324 48,322 20,302 C -5,282 -2,248 4,215 C 9,188 12,158 12,148 Z' },

    // ── EL QUEBRADOS — oben links mitte ──────────────────────────────────────
    { id: 'el_quebrados', name: 'El Quebrados', continent: 'san_fierro',
      labelX: 278, labelY: 242,
      adjacencies: ['tierra_robada', 'sf_city', 'bone_county', 'las_venturas', 'angel_pine'],
      d: 'M 148,205 C 188,190 248,185 305,200 C 348,212 368,240 362,275 C 356,308 326,332 285,340 C 242,348 192,338 162,315 C 130,292 118,258 128,230 C 135,215 145,208 148,205 Z' },

    // ── ANGEL PINE — links mitte ──────────────────────────────────────────────
    { id: 'angel_pine', name: 'Angel Pine', continent: 'san_fierro',
      labelX: 220, labelY: 402,
      adjacencies: ['sf_city', 'el_quebrados', 'bone_county', 'dillimore', 'whetstone'],
      d: 'M 148,318 C 188,302 252,298 302,315 C 338,328 355,358 348,392 C 340,428 310,452 268,460 C 225,468 178,458 148,435 C 118,412 108,378 118,352 C 125,335 142,322 148,318 Z' },

  ],

  continents: {
    los_santos: {
      name: 'Los Santos',
      bonus: 3,
      color: '#ef4444',
      territories: ['los_santos', 'flint_county', 'whetstone', 'dillimore']
    },
    san_fierro: {
      name: 'San Fierro',
      bonus: 2,
      color: '#3b82f6',
      territories: ['sf_city', 'tierra_robada', 'bayside', 'el_quebrados', 'angel_pine']
    },
    las_venturas: {
      name: 'Las Venturas',
      bonus: 2,
      color: '#f59e0b',
      territories: ['las_venturas', 'bone_county', 'red_county']
    }
  },

  crossConnections: []
};

module.exports = { SANANDREAS_MAP };
