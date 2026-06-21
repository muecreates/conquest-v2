// Marbella map — proportional to real geography
// Coast runs east-west at bottom. Sierra Blanca/mountains in upper half.
// Puerto Banus: west coast
// Marbella Centro: center coast
// San Pedro: west of Marbella Centro
// Estepona: far west coast
// Marbella Este / Elviria: east coast
// Nueva Andalucia: inland behind Puerto Banus
// Sierra Blanca: mountain ridge center-north
// Benahavis: northwest inland
// Istan: far north, reservoir area
// Ojen: north-center (mountain village)
// La Zagaleta: northwest luxury estate
const MARBELLA_MAP = {
  id: 'marbella',
  name: 'Marbella',
  description: '11 Viertel · ~20 Min',
  estimatedTime: 20,
  viewBox: '0 0 960 600',
  territories: [

    // ── KÜSTE (Costa del Sol) ───────────────────────────────────────────────
    { id: 'estepona', name: 'Estepona', continent: 'costa',
      labelX: 95, labelY: 498,
      adjacencies: ['san_pedro', 'benahavis', 'la_zagaleta'],
      d: 'M 22,455 C 45,438 90,432 140,438 C 172,442 195,460 192,485 C 188,510 162,530 130,538 C 95,546 55,542 30,525 C 8,510 5,488 22,455 Z' },

    { id: 'san_pedro', name: 'San Pedro', continent: 'costa',
      labelX: 245, labelY: 498,
      adjacencies: ['estepona', 'puerto_banus', 'nueva_andalucia', 'benahavis'],
      d: 'M 192,455 C 218,440 268,435 315,440 C 348,444 368,462 362,488 C 355,515 322,535 280,540 C 238,545 195,538 178,518 C 162,500 168,468 192,455 Z' },

    { id: 'puerto_banus', name: 'Puerto Banús', continent: 'costa',
      labelX: 390, labelY: 498,
      adjacencies: ['san_pedro', 'marbella_centro', 'nueva_andalucia'],
      d: 'M 362,455 C 388,440 435,435 475,440 C 505,444 522,462 515,488 C 508,515 475,535 438,540 C 400,545 360,538 345,518 C 330,500 338,468 362,455 Z' },

    { id: 'marbella_centro', name: 'Marbella Centro', continent: 'costa',
      labelX: 540, labelY: 498,
      adjacencies: ['puerto_banus', 'marbella_este', 'nueva_andalucia', 'sierra_blanca'],
      d: 'M 515,455 C 540,440 588,435 630,440 C 660,444 678,462 672,488 C 664,515 632,535 595,540 C 558,545 518,538 502,518 C 488,500 494,468 515,455 Z' },

    { id: 'marbella_este', name: 'Marbella Este', continent: 'costa',
      labelX: 755, labelY: 490,
      adjacencies: ['marbella_centro', 'ojen', 'sierra_blanca'],
      d: 'M 672,448 C 712,430 790,425 855,432 C 900,438 930,460 928,488 C 926,515 895,538 852,548 C 805,558 748,552 712,532 C 678,514 665,488 672,448 Z' },

    // ── SIERRA (inland) ──────────────────────────────────────────────────────
    { id: 'nueva_andalucia', name: 'Nueva Andalucía', continent: 'sierra',
      labelX: 352, labelY: 375,
      adjacencies: ['san_pedro', 'puerto_banus', 'marbella_centro', 'sierra_blanca', 'benahavis'],
      d: 'M 230,322 C 275,305 355,298 435,305 C 495,310 535,332 528,368 C 520,405 480,432 428,440 C 372,448 310,440 272,415 C 235,390 218,348 230,322 Z' },

    { id: 'sierra_blanca', name: 'Sierra Blanca', continent: 'sierra',
      labelX: 570, labelY: 355,
      adjacencies: ['nueva_andalucia', 'marbella_centro', 'marbella_este', 'ojen'],
      d: 'M 490,298 C 548,282 638,278 712,288 C 762,295 792,322 782,358 C 770,398 718,428 658,436 C 595,444 530,434 495,408 C 462,382 452,322 490,298 Z' },

    { id: 'benahavis', name: 'Benahavís', continent: 'sierra',
      labelX: 188, labelY: 350,
      adjacencies: ['estepona', 'san_pedro', 'nueva_andalucia', 'la_zagaleta'],
      d: 'M 45,298 C 85,278 155,272 220,282 C 265,290 288,318 278,355 C 268,392 230,418 185,425 C 138,432 88,422 58,398 C 28,374 20,335 45,298 Z' },

    { id: 'ojen', name: 'Ojén', continent: 'sierra',
      labelX: 675, labelY: 238,
      adjacencies: ['sierra_blanca', 'marbella_este', 'istan'],
      d: 'M 595,188 C 645,172 728,168 798,178 C 848,186 878,212 868,248 C 856,288 800,318 735,325 C 668,332 602,318 568,292 C 535,268 540,210 595,188 Z' },

    { id: 'la_zagaleta', name: 'La Zagaleta', continent: 'sierra',
      labelX: 118, labelY: 222,
      adjacencies: ['estepona', 'benahavis', 'istan'],
      d: 'M 28,172 C 65,155 128,148 185,158 C 228,166 252,192 242,228 C 232,265 192,290 148,295 C 102,300 55,285 28,258 C 5,235 5,188 28,172 Z' },

    { id: 'istan', name: 'Istán', continent: 'sierra',
      labelX: 425, labelY: 168,
      adjacencies: ['la_zagaleta', 'benahavis', 'nueva_andalucia', 'ojen'],
      d: 'M 215,82 C 305,58 492,50 618,62 C 695,70 738,98 722,138 C 706,178 638,205 550,215 C 458,225 358,218 285,198 C 218,180 175,142 185,108 C 192,88 200,90 215,82 Z' },
  ],

  continents: {
    costa:  { name: 'Costa del Sol', bonus: 3, color: '#3b82f6',
              territories: ['estepona','san_pedro','puerto_banus','marbella_centro','marbella_este'] },
    sierra: { name: 'Sierra',        bonus: 2, color: '#22c55e',
              territories: ['nueva_andalucia','benahavis','sierra_blanca','ojen','la_zagaleta','istan'] }
  },

  crossConnections: []
};

module.exports = { MARBELLA_MAP };
