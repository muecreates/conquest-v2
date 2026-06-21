const SANANDREAS_MAP = {
  id: 'sanandreas',
  name: 'GTA San Andreas',
  description: '12 Territorien · ~30 Min',
  estimatedTime: 30,
  viewBox: '0 0 600 700',
  territories: [

    // ── LOS SANTOS (south) ──────────────────────────────────────────────
    { id: 'ls_downtown', name: 'Downtown LS', continent: 'los_santos',
      labelX: 205, labelY: 590,
      adjacencies: ['ls_east_ls', 'ls_vinewood', 'sf_san_fierro'],
      d: 'M 120,520 L 290,515 L 295,560 L 290,625 L 200,640 L 120,630 L 105,580 Z' },

    { id: 'ls_east_ls', name: 'East Los Santos', continent: 'los_santos',
      labelX: 355, labelY: 580,
      adjacencies: ['ls_downtown', 'ls_vinewood', 'lv_las_venturas'],
      d: 'M 290,515 L 420,510 L 435,555 L 430,625 L 295,630 L 295,560 Z' },

    { id: 'ls_vinewood', name: 'Vinewood', continent: 'los_santos',
      labelX: 280, labelY: 480,
      adjacencies: ['ls_downtown', 'ls_east_ls', 'sf_san_fierro', 'lv_las_venturas'],
      d: 'M 120,440 L 430,435 L 430,510 L 120,520 Z' },

    { id: 'ls_flint', name: 'Flint County', continent: 'los_santos',
      labelX: 130, labelY: 590,
      adjacencies: ['ls_downtown', 'sf_san_fierro'],
      d: 'M 20,510 L 120,510 L 120,650 L 20,645 Z' },

    // ── SAN FIERRO (west) ───────────────────────────────────────────────
    { id: 'sf_san_fierro', name: 'San Fierro City', continent: 'san_fierro',
      labelX: 95, labelY: 345,
      adjacencies: ['ls_downtown', 'ls_vinewood', 'ls_flint', 'sf_bone_county', 'sf_tierra'],
      d: 'M 20,260 L 200,255 L 210,310 L 200,430 L 20,435 Z' },

    { id: 'sf_tierra', name: 'Tierra Robada', continent: 'san_fierro',
      labelX: 165, labelY: 205,
      adjacencies: ['sf_san_fierro', 'sf_bone_county', 'lv_las_venturas'],
      d: 'M 20,140 L 250,135 L 260,200 L 250,260 L 200,255 L 20,260 Z' },

    { id: 'sf_bone_county', name: 'Bone County', continent: 'san_fierro',
      labelX: 285, labelY: 305,
      adjacencies: ['sf_san_fierro', 'sf_tierra', 'ls_vinewood', 'lv_las_venturas', 'lv_desert'],
      d: 'M 200,255 L 400,250 L 415,320 L 405,435 L 200,430 Z' },

    // ── LAS VENTURAS (north) ────────────────────────────────────────────
    { id: 'lv_las_venturas', name: 'Las Venturas City', continent: 'las_venturas',
      labelX: 460, labelY: 200,
      adjacencies: ['ls_east_ls', 'ls_vinewood', 'sf_tierra', 'sf_bone_county', 'lv_desert', 'lv_sherman'],
      d: 'M 380,100 L 580,95 L 585,250 L 510,260 L 400,255 L 385,200 Z' },

    { id: 'lv_desert', name: 'Las Venturas Desert', continent: 'las_venturas',
      labelX: 470, labelY: 360,
      adjacencies: ['lv_las_venturas', 'sf_bone_county', 'ls_east_ls', 'lv_sherman'],
      d: 'M 400,255 L 510,260 L 580,255 L 585,450 L 430,455 L 405,435 L 415,320 Z' },

    { id: 'lv_sherman', name: 'Sherman Reservoir', continent: 'las_venturas',
      labelX: 460, labelY: 80,
      adjacencies: ['lv_las_venturas', 'sf_tierra'],
      d: 'M 260,15 L 580,10 L 580,95 L 380,100 L 250,105 L 255,50 Z' },

    // ── COUNTRYSIDE ─────────────────────────────────────────────────────
    { id: 'whetstone', name: 'Whetstone', continent: 'los_santos',
      labelX: 70, labelY: 100,
      adjacencies: ['sf_tierra', 'sf_san_fierro'],
      d: 'M 20,15 L 255,10 L 255,50 L 250,135 L 20,140 Z' },

    { id: 'red_county', name: 'Red County', continent: 'las_venturas',
      labelX: 490, labelY: 565,
      adjacencies: ['ls_east_ls', 'lv_desert'],
      d: 'M 430,455 L 585,450 L 585,650 L 430,655 L 430,555 Z' },
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
      territories: ['sf_san_fierro', 'sf_tierra', 'sf_bone_county']
    },
    las_venturas: {
      name: 'Las Venturas',
      bonus: 2,
      color: '#f59e0b',
      territories: ['lv_las_venturas', 'lv_desert', 'lv_sherman', 'red_county']
    }
  },

  crossConnections: []
};

module.exports = { SANANDREAS_MAP };
