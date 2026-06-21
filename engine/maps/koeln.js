const KOELN_MAP = {
  id: 'koeln', name: 'Köln', description: '9 Stadtteile · ~20 Min', estimatedTime: 20,
  viewBox: '0 0 500 400',
  territories: [
    { id: 'innenstadt', name: 'Innenstadt', continent: 'mitte',
      d: 'M 220,200 L 260,190 L 285,215 L 280,250 L 245,265 L 210,255 L 200,225 Z',
      labelX: 243, labelY: 228, adjacencies: ['rodenkirchen','lindenthal','ehrenfeld','nippes','kalk','muelheim'] },
    { id: 'rodenkirchen', name: 'Rodenkirchen', continent: 'sued',
      d: 'M 210,255 L 245,265 L 258,295 L 248,335 L 215,345 L 188,325 L 185,290 Z',
      labelX: 219, labelY: 300, adjacencies: ['innenstadt','lindenthal','porz'] },
    { id: 'lindenthal', name: 'Lindenthal', continent: 'sued',
      d: 'M 160,195 L 200,180 L 220,200 L 210,255 L 185,265 L 155,248 L 148,220 Z',
      labelX: 183, labelY: 223, adjacencies: ['innenstadt','rodenkirchen','ehrenfeld'] },
    { id: 'ehrenfeld', name: 'Ehrenfeld', continent: 'west',
      d: 'M 130,155 L 170,140 L 205,158 L 210,195 L 185,208 L 148,205 L 125,182 Z',
      labelX: 168, labelY: 175, adjacencies: ['innenstadt','lindenthal','nippes','chorweiler'] },
    { id: 'nippes', name: 'Nippes', continent: 'nord',
      d: 'M 195,145 L 230,135 L 262,148 L 268,178 L 248,195 L 215,198 L 195,175 Z',
      labelX: 229, labelY: 168, adjacencies: ['innenstadt','ehrenfeld','chorweiler','muelheim'] },
    { id: 'chorweiler', name: 'Chorweiler', continent: 'nord',
      d: 'M 148,80 L 210,65 L 248,80 L 255,118 L 230,140 L 195,145 L 165,130 L 138,110 Z',
      labelX: 197, labelY: 107, adjacencies: ['ehrenfeld','nippes'] },
    { id: 'porz', name: 'Porz', continent: 'ost',
      d: 'M 295,258 L 340,248 L 368,270 L 362,315 L 330,338 L 292,330 L 272,305 L 278,272 Z',
      labelX: 320, labelY: 292, adjacencies: ['rodenkirchen','kalk'] },
    { id: 'kalk', name: 'Kalk', continent: 'ost',
      d: 'M 270,198 L 308,185 L 340,195 L 348,228 L 328,255 L 292,262 L 265,245 L 258,218 Z',
      labelX: 304, labelY: 225, adjacencies: ['innenstadt','muelheim','porz'] },
    { id: 'muelheim', name: 'Mülheim', continent: 'ost',
      d: 'M 262,148 L 305,135 L 342,148 L 352,180 L 335,205 L 302,212 L 265,200 Z',
      labelX: 308, labelY: 174, adjacencies: ['innenstadt','nippes','kalk'] },
  ],
  continents: {
    mitte: { name: 'Innenstadt', bonus: 3, color: '#6a3a6a', territories: ['innenstadt'] },
    nord:  { name: 'Norden',     bonus: 2, color: '#3a5a7a', territories: ['nippes','chorweiler'] },
    sued:  { name: 'Süden',      bonus: 2, color: '#4a7a4a', territories: ['rodenkirchen','lindenthal'] },
    west:  { name: 'Westen',     bonus: 1, color: '#7a6a4a', territories: ['ehrenfeld'] },
    ost:   { name: 'Osten',      bonus: 2, color: '#7a4a4a', territories: ['porz','kalk','muelheim'] }
  },
  crossConnections: []
};

module.exports = { KOELN_MAP };
