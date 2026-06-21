const BIKINI_BOTTOM_MAP = {
  id: 'bikiniBottom',
  name: 'Bikini Bottom',
  description: '9 Territorien · ~15 Min',
  estimatedTime: 15,
  viewBox: '0 0 560 420',
  territories: [

    // ── DOWNTOWN ─────────────────────────────────────────────
    { id: 'downtown', name: 'Downtown', continent: 'downtown',
      labelX: 275, labelY: 210,
      adjacencies: ['krusty_krab', 'chum_bucket', 'jellyfish_fields', 'sandy_dome'],
      d: 'M 200,165 L 350,160 L 360,215 L 350,265 L 200,270 L 188,215 Z' },

    { id: 'krusty_krab', name: 'Krusty Krab', continent: 'downtown',
      labelX: 155, labelY: 270,
      adjacencies: ['downtown', 'chum_bucket', 'goo_lagoon', 'rock_bottom'],
      d: 'M 80,225 L 195,220 L 200,270 L 188,320 L 80,325 L 65,270 Z' },

    { id: 'chum_bucket', name: 'Chum Bucket', continent: 'downtown',
      labelX: 155, labelY: 195,
      adjacencies: ['downtown', 'krusty_krab', 'jellyfish_fields'],
      d: 'M 80,150 L 200,145 L 200,165 L 188,215 L 80,225 L 68,185 Z' },

    // ── OUTSKIRTS ────────────────────────────────────────────
    { id: 'jellyfish_fields', name: 'Jellyfish Fields', continent: 'outskirts',
      labelX: 390, labelY: 140,
      adjacencies: ['downtown', 'chum_bucket', 'kelp_forest', 'industrial_zone'],
      d: 'M 350,80 L 500,75 L 510,160 L 360,168 L 350,160 Z' },

    { id: 'goo_lagoon', name: 'Goo Lagoon', continent: 'outskirts',
      labelX: 130, labelY: 360,
      adjacencies: ['krusty_krab', 'rock_bottom'],
      d: 'M 20,310 L 185,305 L 188,320 L 180,390 L 20,395 Z' },

    { id: 'rock_bottom', name: 'Rock Bottom', continent: 'outskirts',
      labelX: 275, labelY: 350,
      adjacencies: ['krusty_krab', 'goo_lagoon', 'sandy_dome', 'industrial_zone'],
      d: 'M 185,305 L 370,300 L 380,345 L 370,390 L 185,395 L 180,350 Z' },

    { id: 'kelp_forest', name: 'Kelp Forest', continent: 'outskirts',
      labelX: 450, labelY: 250,
      adjacencies: ['jellyfish_fields', 'industrial_zone', 'sandy_dome'],
      d: 'M 370,160 L 510,155 L 520,310 L 370,315 L 360,265 L 360,215 Z' },

    // ── DEEP ─────────────────────────────────────────────────
    { id: 'industrial_zone', name: 'Industrial Zone', continent: 'deep',
      labelX: 450, labelY: 355,
      adjacencies: ['jellyfish_fields', 'rock_bottom', 'kelp_forest', 'sandy_dome'],
      d: 'M 370,315 L 520,308 L 525,395 L 370,400 L 375,350 Z' },

    { id: 'sandy_dome', name: "Sandy's Dome", continent: 'deep',
      labelX: 275, labelY: 80,
      adjacencies: ['downtown', 'jellyfish_fields', 'rock_bottom', 'industrial_zone', 'kelp_forest'],
      d: 'M 200,20 L 350,15 L 360,80 L 350,160 L 200,165 L 188,80 Z' },
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
      territories: ['jellyfish_fields', 'goo_lagoon', 'rock_bottom', 'kelp_forest']
    },
    deep: {
      name: 'Tiefsee',
      bonus: 2,
      color: '#3b82f6',
      territories: ['industrial_zone', 'sandy_dome']
    }
  },

  crossConnections: []
};

module.exports = { BIKINI_BOTTOM_MAP };
