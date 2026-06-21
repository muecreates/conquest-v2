// San Andreas map — shapes proportional to the GTA SA in-game map
// Los Santos: south-east (large city), San Fierro: north-west coast, Las Venturas: north-east desert
// Countryside fills the center/north
const SANANDREAS_MAP = {
  id: 'sanandreas',
  name: 'San Andreas',
  description: '12 Territorien · ~30 Min',
  estimatedTime: 30,
  viewBox: '0 0 960 600',
  territories: [

    // ── LOS SANTOS (south-east, large) ─────────────────────────────────────
    { id: 'ls_downtown', name: 'Los Santos Downtown', continent: 'los_santos',
      labelX: 730, labelY: 495,
      adjacencies: ['ls_east_ls', 'ls_vinewood', 'ls_flint'],
      d: 'M 650,420 L 760,415 L 790,435 L 800,470 L 795,510 L 770,535 L 730,545 L 695,540 L 668,520 L 655,490 L 650,460 Z' },

    { id: 'ls_east_ls', name: 'East Los Santos', continent: 'los_santos',
      labelX: 845, labelY: 490,
      adjacencies: ['ls_downtown', 'ls_vinewood', 'red_county'],
      d: 'M 800,420 L 880,415 L 905,435 L 912,470 L 900,510 L 875,535 L 835,545 L 800,535 L 795,510 L 800,470 Z' },

    { id: 'ls_vinewood', name: 'Vinewood', continent: 'los_santos',
      labelX: 770, labelY: 400,
      adjacencies: ['ls_downtown', 'ls_east_ls', 'ls_flint', 'red_county', 'bone_county'],
      d: 'M 640,360 L 910,355 L 912,420 L 800,420 L 650,420 L 640,395 Z' },

    { id: 'ls_flint', name: 'Flint County', continent: 'los_santos',
      labelX: 615, labelY: 470,
      adjacencies: ['ls_downtown', 'ls_vinewood', 'whetstone'],
      d: 'M 540,360 L 640,355 L 640,420 L 650,460 L 655,490 L 620,510 L 580,515 L 548,490 L 535,455 L 530,410 Z' },

    // ── SAN FIERRO (north-west coast, mid-size) ─────────────────────────────
    { id: 'sf_city', name: 'San Fierro City', continent: 'san_fierro',
      labelX: 155, labelY: 305,
      adjacencies: ['sf_tierra', 'sf_bay', 'bone_county'],
      d: 'M 50,240 L 195,235 L 220,260 L 230,295 L 220,340 L 195,365 L 140,375 L 90,370 L 50,350 L 38,315 L 42,270 Z' },

    { id: 'sf_tierra', name: 'Tierra Robada', continent: 'san_fierro',
      labelX: 195, labelY: 165,
      adjacencies: ['sf_city', 'sf_bay', 'bone_county', 'las_venturas'],
      d: 'M 50,100 L 300,92 L 315,130 L 310,185 L 285,215 L 220,230 L 195,235 L 50,240 Z' },

    { id: 'sf_bay', name: 'San Fierro Bay', continent: 'san_fierro',
      labelX: 290, labelY: 305,
      adjacencies: ['sf_city', 'sf_tierra', 'bone_county', 'whetstone'],
      d: 'M 220,235 L 380,228 L 400,260 L 395,340 L 370,375 L 310,385 L 250,380 L 220,360 L 220,295 Z' },

    // ── LAS VENTURAS (north-east, desert) ───────────────────────────────────
    { id: 'las_venturas', name: 'Las Venturas', continent: 'las_venturas',
      labelX: 680, labelY: 120,
      adjacencies: ['sf_tierra', 'bone_county', 'red_county', 'sherman'],
      d: 'M 490,60 L 760,55 L 785,90 L 790,150 L 775,190 L 730,210 L 640,220 L 580,215 L 520,200 L 490,165 L 475,115 Z' },

    { id: 'sherman', name: 'Sherman Reservoir', continent: 'las_venturas',
      labelX: 815, labelY: 115,
      adjacencies: ['las_venturas', 'red_county'],
      d: 'M 760,55 L 910,50 L 930,85 L 925,165 L 895,195 L 845,205 L 790,195 L 775,155 L 785,95 Z' },

    { id: 'red_county', name: 'Red County', continent: 'las_venturas',
      labelX: 820, labelY: 285,
      adjacencies: ['las_venturas', 'sherman', 'ls_east_ls', 'ls_vinewood', 'bone_county'],
      d: 'M 775,195 L 925,165 L 935,260 L 920,355 L 880,380 L 830,385 L 795,360 L 780,310 L 760,250 L 770,215 Z' },

    // ── COUNTRYSIDE (center) ─────────────────────────────────────────────────
    { id: 'bone_county', name: 'Bone County', continent: 'san_fierro',
      labelX: 530, labelY: 270,
      adjacencies: ['sf_tierra', 'sf_city', 'sf_bay', 'las_venturas', 'ls_vinewood', 'red_county', 'whetstone'],
      d: 'M 310,90 L 490,85 L 520,110 L 530,190 L 515,270 L 490,320 L 450,360 L 400,375 L 395,295 L 380,230 L 315,225 L 300,185 Z' },

    { id: 'whetstone', name: 'Whetstone', continent: 'los_santos',
      labelX: 430, labelY: 430,
      adjacencies: ['sf_bay', 'bone_county', 'ls_flint', 'ls_vinewood'],
      d: 'M 395,335 L 540,325 L 545,360 L 540,415 L 530,455 L 540,360 L 535,340 L 450,335 Z M 395,335 L 450,335 L 530,340 L 535,360 L 530,455 L 535,360 L 450,360 L 400,380 L 395,355 Z' },
  ],

  continents: {
    los_santos: {
      name: 'Los Santos',
      bonus: 3,
      color: '#ef4444',
      territories: ['ls_downtown', 'ls_east_ls', 'ls_vinewood', 'ls_flint', 'whetstone']
    },
    san_fierro: {
      name: 'San Fierro',
      bonus: 2,
      color: '#3b82f6',
      territories: ['sf_city', 'sf_tierra', 'sf_bay', 'bone_county']
    },
    las_venturas: {
      name: 'Las Venturas',
      bonus: 2,
      color: '#f59e0b',
      territories: ['las_venturas', 'sherman', 'red_county']
    }
  },

  crossConnections: []
};

module.exports = { SANANDREAS_MAP };
