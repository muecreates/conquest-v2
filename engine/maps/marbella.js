// Marbella — 11 Territorien, Costa del Sol (800x600)
// Küstenlinie unten (blau), Berge oben.
// Küstenstreifen (links→rechts): San Pedro, Puerto Banús, Marbella Centro, Marbella Este, Elviria
// Berge (oben links→rechts): La Zagaleta, Benahavís, Nueva Andalucía, Istán, Ojén, Sierra Blanca
const MARBELLA_MAP = {
  id: 'marbella',
  name: 'Marbella',
  description: '11 Viertel · ~20 Min',
  estimatedTime: 20,
  viewBox: '0 0 800 600',
  territories: [

    // ── SAN PEDRO — Küste links ───────────────────────────────────────────────
    { id: 'san_pedro', name: 'San Pedro', continent: 'costa',
      labelX: 88, labelY: 498,
      adjacencies: ['puerto_banus', 'benahavis', 'la_zagaleta'],
      d: 'M 10,430 C 42,415 88,408 132,418 C 165,426 185,448 182,475 C 179,502 158,525 128,535 C 95,545 52,540 25,522 C 0,505 0,472 5,450 L 10,430 Z M 10,430 L 10,600 L 185,600 L 185,490 C 180,510 162,528 132,538 C 95,550 50,544 22,526 C 5,514 3,488 5,465 Z' },

    // ── PUERTO BANÚS — Küste mitte-links, Hafen ───────────────────────────────
    { id: 'puerto_banus', name: 'Puerto Banús', continent: 'costa',
      labelX: 252, labelY: 490,
      adjacencies: ['san_pedro', 'marbella_centro', 'nueva_andalucia', 'benahavis'],
      d: 'M 138,412 C 175,398 232,392 285,402 C 322,410 345,432 342,462 C 339,492 315,515 278,525 C 238,536 190,532 158,515 C 125,498 115,470 122,448 C 128,432 135,415 138,412 Z M 138,412 L 138,600 L 345,600 L 345,468 C 340,496 318,518 280,528 C 240,540 192,535 160,518 C 132,504 120,478 125,455 Z' },

    // ── MARBELLA CENTRO — Küste mitte, groß ──────────────────────────────────
    { id: 'marbella_centro', name: 'Marbella Centro', continent: 'costa',
      labelX: 435, labelY: 475,
      adjacencies: ['puerto_banus', 'marbella_este', 'nueva_andalucia', 'istan', 'sierra_blanca'],
      d: 'M 348,395 C 390,380 452,375 510,385 C 548,392 572,415 568,448 C 564,480 538,505 500,516 C 458,528 405,528 365,515 C 325,502 305,478 308,452 C 312,428 330,405 348,395 Z M 348,395 L 348,600 L 572,600 L 572,452 C 568,485 542,510 502,522 C 460,535 405,534 365,520 C 328,508 308,482 310,455 Z' },

    // ── MARBELLA ESTE — Küste mitte-rechts ───────────────────────────────────
    { id: 'marbella_este', name: 'Marbella Este', continent: 'costa',
      labelX: 625, labelY: 462,
      adjacencies: ['marbella_centro', 'elviria', 'sierra_blanca', 'ojen'],
      d: 'M 575,382 C 612,368 662,362 710,372 C 745,380 768,402 765,432 C 762,462 738,488 700,500 C 658,512 605,512 565,498 C 525,484 505,458 508,430 C 512,405 535,385 555,378 L 575,382 Z M 575,382 L 575,600 L 770,600 L 770,436 C 766,468 742,492 702,504 C 660,518 607,518 565,504 C 528,492 508,466 510,438 Z' },

    // ── ELVIRIA — Küste ganz rechts ───────────────────────────────────────────
    { id: 'elviria', name: 'Elviria', continent: 'costa',
      labelX: 730, labelY: 455,
      adjacencies: ['marbella_este', 'ojen'],
      d: 'M 772,368 C 790,358 800,365 800,385 L 800,600 L 772,600 L 772,488 C 752,505 730,512 710,505 C 688,498 672,478 670,455 C 668,430 680,408 700,398 C 718,390 748,380 772,368 Z' },

    // ── LA ZAGALETA — Berge oben links, groß ──────────────────────────────────
    { id: 'la_zagaleta', name: 'La Zagaleta', continent: 'sierra',
      labelX: 92, labelY: 298,
      adjacencies: ['san_pedro', 'benahavis', 'nueva_andalucia'],
      d: 'M 10,148 C 45,128 105,120 158,135 C 200,148 225,178 222,218 C 218,258 190,288 150,302 C 108,316 58,310 28,285 C 0,262 -2,225 5,192 C 10,170 10,158 10,148 Z M 10,148 L 10,428 C 3,450 2,472 5,492 C 2,480 0,462 0,440 L 0,148 Z' },

    // ── BENAHAVÍS — Berge oben mitte-links ────────────────────────────────────
    { id: 'benahavis', name: 'Benahavís', continent: 'sierra',
      labelX: 232, labelY: 308,
      adjacencies: ['san_pedro', 'puerto_banus', 'la_zagaleta', 'nueva_andalucia'],
      d: 'M 162,132 C 205,115 268,108 322,122 C 360,132 382,158 378,195 C 374,232 345,262 305,275 C 262,290 210,288 172,268 C 132,248 115,215 122,182 C 128,158 148,140 162,132 Z' },

    // ── NUEVA ANDALUCÍA — Berge mitte ─────────────────────────────────────────
    { id: 'nueva_andalucia', name: 'Nueva Andalucía', continent: 'sierra',
      labelX: 390, labelY: 298,
      adjacencies: ['puerto_banus', 'marbella_centro', 'benahavis', 'la_zagaleta', 'istan'],
      d: 'M 328,118 C 372,102 435,97 492,112 C 528,122 550,148 546,185 C 542,222 512,252 472,265 C 428,278 378,278 340,260 C 300,242 280,212 285,180 C 290,152 308,128 328,118 Z' },

    // ── ISTÁN — Berge oben mitte ──────────────────────────────────────────────
    { id: 'istan', name: 'Istán', continent: 'sierra',
      labelX: 498, labelY: 268,
      adjacencies: ['nueva_andalucia', 'marbella_centro', 'sierra_blanca', 'ojen'],
      d: 'M 498,102 C 540,88 598,85 642,100 C 675,112 695,138 688,172 C 682,206 655,232 615,242 C 572,252 522,248 490,228 C 458,208 448,178 455,150 C 462,125 480,108 498,102 Z' },

    // ── OJÉN — Berge oben rechts mitte ───────────────────────────────────────
    { id: 'ojen', name: 'Ojén', continent: 'sierra',
      labelX: 638, labelY: 268,
      adjacencies: ['istan', 'sierra_blanca', 'marbella_este', 'elviria'],
      d: 'M 648,95 C 688,80 742,78 778,95 C 800,108 800,145 800,175 L 800,258 C 782,272 750,278 715,272 C 678,266 648,245 632,218 C 616,192 614,158 625,130 C 632,112 642,100 648,95 Z' },

    // ── SIERRA BLANCA — Berge mitte, prominent ────────────────────────────────
    { id: 'sierra_blanca', name: 'Sierra Blanca', continent: 'sierra',
      labelX: 468, labelY: 362,
      adjacencies: ['nueva_andalucia', 'marbella_centro', 'marbella_este', 'istan', 'ojen'],
      d: 'M 355,270 C 395,255 455,250 512,262 C 550,270 575,295 572,328 C 568,360 540,385 500,395 C 458,405 408,402 372,385 C 335,368 318,340 325,312 C 330,290 342,275 355,270 Z' },

  ],

  continents: {
    costa: {
      name: 'Costa del Sol',
      bonus: 3,
      color: '#3b82f6',
      territories: ['san_pedro', 'puerto_banus', 'marbella_centro', 'marbella_este', 'elviria']
    },
    sierra: {
      name: 'Sierra',
      bonus: 2,
      color: '#22c55e',
      territories: ['la_zagaleta', 'benahavis', 'nueva_andalucia', 'istan', 'ojen', 'sierra_blanca']
    }
  },

  crossConnections: []
};

module.exports = { MARBELLA_MAP };
