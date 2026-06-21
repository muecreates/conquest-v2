// Bikini Bottom map — organic shapes inspired by the show's layout
// Jellyfish Fields: upper-right (large open space)
// Goo Lagoon: right (dark blue, water)
// Downtown Bikini Bottom: center
// Krusty Krab / Chum Bucket: lower-center-left (adjacent)
// Sandy's Dome: lower-center (dome shape)
// Rock Bottom: lower-left (dark, deep)
// Kelp Forest: upper-left (tall, green)
// Industrial Zone: right-center
const BIKINI_BOTTOM_MAP = {
  id: 'bikiniBottom',
  name: 'Bikini Bottom',
  description: '9 Territorien · ~15 Min',
  estimatedTime: 15,
  viewBox: '0 0 960 600',
  territories: [

    // ── KELP FOREST — upper-left, tall narrow green ───────────────────────
    { id: 'kelp_forest', name: 'Kelp Forest', continent: 'outskirts',
      labelX: 115, labelY: 195,
      adjacencies: ['rock_bottom', 'downtown', 'jellyfish_fields'],
      d: 'M 38,48 C 55,38 130,30 175,42 C 205,50 215,80 210,120 C 205,160 180,215 170,265 C 160,310 155,340 145,370 C 132,400 105,415 80,405 C 52,393 30,365 28,330 C 22,280 25,235 30,185 C 35,140 28,72 38,48 Z' },

    // ── JELLYFISH FIELDS — upper-right, large open ─────────────────────────
    { id: 'jellyfish_fields', name: 'Jellyfish Fields', continent: 'outskirts',
      labelX: 620, labelY: 130,
      adjacencies: ['kelp_forest', 'downtown', 'industrial_zone', 'goo_lagoon'],
      d: 'M 225,35 C 310,22 480,18 620,25 C 730,30 830,42 890,65 C 920,78 930,105 920,135 C 905,170 860,200 800,215 C 730,232 620,240 520,235 C 420,228 330,215 265,195 C 215,178 190,155 195,120 C 200,88 212,45 225,35 Z' },

    // ── INDUSTRIAL ZONE — right-center ─────────────────────────────────────
    { id: 'industrial_zone', name: 'Industrial Zone', continent: 'deep',
      labelX: 820, labelY: 340,
      adjacencies: ['jellyfish_fields', 'goo_lagoon', 'downtown'],
      d: 'M 800,215 C 855,210 905,225 930,255 C 948,278 945,320 935,360 C 922,400 895,430 860,445 C 825,458 782,452 755,432 C 728,412 715,378 718,345 C 722,308 740,268 765,248 C 780,235 792,218 800,215 Z' },

    // ── GOO LAGOON — right, dark blue water area ───────────────────────────
    { id: 'goo_lagoon', name: 'Goo Lagoon', continent: 'outskirts',
      labelX: 820, labelY: 500,
      adjacencies: ['industrial_zone', 'jellyfish_fields', 'sandy_dome'],
      d: 'M 755,435 C 790,450 845,458 880,468 C 918,480 940,498 938,525 C 935,552 905,572 865,578 C 818,585 762,580 725,565 C 688,548 672,520 680,492 C 690,462 720,438 755,435 Z' },

    // ── DOWNTOWN — center, dense ────────────────────────────────────────────
    { id: 'downtown', name: 'Downtown', continent: 'downtown',
      labelX: 435, labelY: 290,
      adjacencies: ['kelp_forest', 'jellyfish_fields', 'industrial_zone', 'krusty_krab', 'chum_bucket', 'sandy_dome'],
      d: 'M 268,195 C 335,178 430,170 520,175 C 575,178 618,195 635,225 C 650,252 645,290 622,318 C 596,348 550,368 500,375 C 448,382 390,378 348,358 C 305,338 278,305 270,270 C 262,238 262,208 268,195 Z' },

    // ── KRUSTY KRAB — lower-left of downtown ───────────────────────────────
    { id: 'krusty_krab', name: 'Krusty Krab', continent: 'downtown',
      labelX: 270, labelY: 440,
      adjacencies: ['downtown', 'chum_bucket', 'rock_bottom', 'sandy_dome'],
      d: 'M 148,375 C 195,362 270,358 332,368 C 368,375 390,395 385,425 C 378,460 345,490 300,502 C 255,514 200,510 162,492 C 122,472 100,440 108,412 C 116,390 132,382 148,375 Z' },

    // ── CHUM BUCKET — tiny, right next to Krusty Krab ──────────────────────
    { id: 'chum_bucket', name: 'Chum Bucket', continent: 'downtown',
      labelX: 450, labelY: 445,
      adjacencies: ['downtown', 'krusty_krab', 'sandy_dome'],
      d: 'M 388,380 C 425,370 480,365 525,370 C 558,374 578,392 572,418 C 565,448 535,470 495,478 C 455,486 412,480 390,460 C 370,440 368,410 388,380 Z' },

    // ── SANDY'S DOME — lower-center, round ─────────────────────────────────
    { id: 'sandy_dome', name: "Sandy's Dome", continent: 'deep',
      labelX: 580, labelY: 520,
      adjacencies: ['downtown', 'krusty_krab', 'chum_bucket', 'goo_lagoon'],
      d: 'M 528,462 C 568,448 622,448 660,468 C 692,484 710,515 700,545 C 690,572 660,588 622,590 C 580,592 538,576 515,550 C 494,526 492,492 528,462 Z' },

    // ── ROCK BOTTOM — lower-left, dark deep ────────────────────────────────
    { id: 'rock_bottom', name: 'Rock Bottom', continent: 'deep',
      labelX: 108, labelY: 520,
      adjacencies: ['kelp_forest', 'krusty_krab'],
      d: 'M 30,408 C 58,392 105,388 148,400 C 188,412 212,440 205,475 C 198,510 170,540 132,552 C 90,565 45,558 22,535 C 2,514 5,480 15,455 C 22,435 18,418 30,408 Z' },

  ],

  continents: {
    downtown: {
      name: 'Downtown',
      bonus: 3,
      color: '#f59e0b',
      territories: ['downtown', 'krusty_krab', 'chum_bucket']
    },
    outskirts: {
      name: 'Außenbezirk',
      bonus: 2,
      color: '#22c55e',
      territories: ['kelp_forest', 'jellyfish_fields', 'goo_lagoon']
    },
    deep: {
      name: 'Tiefsee',
      bonus: 2,
      color: '#3b82f6',
      territories: ['industrial_zone', 'sandy_dome', 'rock_bottom']
    }
  },

  crossConnections: []
};

module.exports = { BIKINI_BOTTOM_MAP };
