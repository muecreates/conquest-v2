const WORLD_MAP = {
  id: 'world',
  name: 'Weltmap',
  description: '42 Territorien — klassisch, 60–120 Min',
  viewBox: '0 0 860 540',
  territories: [

    // ── NORDAMERIKA ────────────────────────────────────────────────────────────
    { id: 'alaska', name: 'Alaska', continent: 'north_america', labelX: 50, labelY: 82,
      adjacencies: ['northwest_territory', 'alberta', 'kamchatka'],
      svgPath: 'M 15,48 L 55,40 L 82,42 L 92,58 L 90,78 L 78,105 L 55,118 L 28,112 L 10,92 L 12,65 Z' },

    { id: 'northwest_territory', name: 'NW Territory', continent: 'north_america', labelX: 148, labelY: 78,
      adjacencies: ['alaska', 'alberta', 'ontario', 'greenland'],
      svgPath: 'M 90,42 L 152,38 L 208,36 L 222,52 L 220,78 L 215,108 L 198,120 L 162,122 L 128,115 L 95,108 L 88,82 L 90,58 Z' },

    { id: 'greenland', name: 'Grönland', continent: 'north_america', labelX: 282, labelY: 45,
      adjacencies: ['northwest_territory', 'ontario', 'quebec', 'iceland'],
      svgPath: 'M 240,10 L 335,8 L 350,25 L 348,55 L 328,82 L 295,90 L 258,72 L 238,48 L 235,28 Z' },

    { id: 'alberta', name: 'Alberta', continent: 'north_america', labelX: 118, labelY: 152,
      adjacencies: ['alaska', 'northwest_territory', 'ontario', 'western_united_states'],
      svgPath: 'M 90,118 L 152,118 L 162,132 L 162,172 L 148,185 L 105,182 L 85,162 L 82,138 Z' },

    { id: 'ontario', name: 'Ontario', continent: 'north_america', labelX: 192, labelY: 145,
      adjacencies: ['northwest_territory', 'alberta', 'greenland', 'quebec', 'eastern_united_states', 'western_united_states'],
      svgPath: 'M 158,118 L 215,112 L 240,122 L 245,145 L 242,172 L 218,185 L 185,182 L 162,172 L 158,145 Z' },

    { id: 'quebec', name: 'Québec', continent: 'north_america', labelX: 270, labelY: 140,
      adjacencies: ['greenland', 'ontario', 'eastern_us'],
      svgPath: 'M 242,110 L 302,108 L 318,125 L 315,168 L 295,182 L 255,182 L 242,168 L 238,138 Z' },

    { id: 'western_united_states', name: 'Westen USA', continent: 'north_america', labelX: 118, labelY: 218,
      adjacencies: ['alberta', 'ontario', 'eastern_united_states', 'central_america'],
      svgPath: 'M 85,182 L 148,182 L 162,172 L 178,195 L 175,252 L 158,265 L 100,262 L 80,242 L 78,215 L 82,192 Z' },

    { id: 'eastern_united_states', name: 'Osten USA', continent: 'north_america', labelX: 224, labelY: 220,
      adjacencies: ['ontario', 'quebec', 'western_united_states', 'central_america'],
      svgPath: 'M 162,172 L 218,182 L 242,178 L 262,192 L 265,252 L 248,272 L 218,275 L 182,265 L 175,248 L 175,195 Z' },

    { id: 'central_america', name: 'Mittelamerika', continent: 'north_america', labelX: 162, labelY: 295,
      adjacencies: ['western_united_states', 'eastern_united_states', 'venezuela'],
      svgPath: 'M 118,265 L 185,262 L 218,272 L 228,268 L 238,288 L 228,318 L 198,328 L 155,322 L 128,302 L 115,282 Z' },

    // ── SÜDAMERIKA ─────────────────────────────────────────────────────────────
    { id: 'venezuela', name: 'Venezuela', continent: 'south_america', labelX: 232, labelY: 345,
      adjacencies: ['central_america', 'brazil', 'peru'],
      svgPath: 'M 188,322 L 268,318 L 285,335 L 282,362 L 252,372 L 208,368 L 182,352 L 182,332 Z' },

    { id: 'peru', name: 'Peru', continent: 'south_america', labelX: 195, labelY: 408,
      adjacencies: ['venezuela', 'brazil', 'argentina'],
      svgPath: 'M 175,368 L 232,362 L 248,378 L 245,435 L 222,450 L 188,442 L 168,418 L 165,388 Z' },

    { id: 'brazil', name: 'Brasilien', continent: 'south_america', labelX: 275, labelY: 395,
      adjacencies: ['venezuela', 'peru', 'argentina', 'north_africa'],
      svgPath: 'M 232,362 L 325,348 L 342,368 L 338,425 L 315,452 L 278,458 L 252,445 L 238,418 L 228,378 Z' },

    { id: 'argentina', name: 'Argentinien', continent: 'south_america', labelX: 218, labelY: 470,
      adjacencies: ['peru', 'brazil'],
      svgPath: 'M 185,445 L 268,442 L 282,462 L 272,505 L 235,515 L 198,502 L 180,478 L 182,455 Z' },

    // ── EUROPA ─────────────────────────────────────────────────────────────────
    { id: 'iceland', name: 'Island', continent: 'europe', labelX: 372, labelY: 65,
      adjacencies: ['greenland', 'great_britain', 'scandinavia'],
      svgPath: 'M 345,42 L 398,38 L 410,58 L 402,82 L 372,88 L 348,78 L 342,58 Z' },

    { id: 'great_britain', name: 'Großbritann.', continent: 'europe', labelX: 368, labelY: 128,
      adjacencies: ['iceland', 'northern_europe', 'western_europe', 'scandinavia'],
      svgPath: 'M 345,88 L 392,85 L 402,105 L 400,148 L 375,162 L 348,155 L 340,132 L 342,105 Z' },

    { id: 'scandinavia', name: 'Skandinavien', continent: 'europe', labelX: 438, labelY: 85,
      adjacencies: ['iceland', 'great_britain', 'northern_europe', 'ukraine'],
      svgPath: 'M 402,40 L 468,35 L 482,58 L 480,118 L 458,132 L 432,130 L 408,118 L 398,88 L 405,62 Z' },

    { id: 'northern_europe', name: 'Nordeuropa', continent: 'europe', labelX: 428, labelY: 162,
      adjacencies: ['great_britain', 'scandinavia', 'ukraine', 'western_europe', 'southern_europe'],
      svgPath: 'M 398,118 L 432,128 L 458,128 L 480,142 L 475,182 L 452,192 L 418,192 L 395,175 L 395,138 Z' },

    { id: 'western_europe', name: 'Westeuropa', continent: 'europe', labelX: 368, labelY: 208,
      adjacencies: ['great_britain', 'northern_europe', 'southern_europe', 'north_africa'],
      svgPath: 'M 342,158 L 395,155 L 398,175 L 402,192 L 395,242 L 372,255 L 348,248 L 335,228 L 335,178 Z' },

    { id: 'southern_europe', name: 'Südeuropa', continent: 'europe', labelX: 448, labelY: 215,
      adjacencies: ['western_europe', 'northern_europe', 'ukraine', 'middle_east', 'egypt', 'north_africa'],
      svgPath: 'M 398,188 L 452,185 L 480,178 L 502,195 L 498,248 L 468,260 L 432,252 L 402,238 L 395,212 Z' },

    { id: 'ukraine', name: 'Ukraine', continent: 'europe', labelX: 528, labelY: 138,
      adjacencies: ['scandinavia', 'northern_europe', 'southern_europe', 'middle_east', 'afghanistan', 'ural'],
      svgPath: 'M 480,58 L 568,52 L 582,78 L 578,188 L 555,202 L 518,198 L 498,190 L 480,175 L 475,148 L 478,88 Z' },

    // ── AFRIKA ─────────────────────────────────────────────────────────────────
    { id: 'north_africa', name: 'Nordafrika', continent: 'africa', labelX: 412, labelY: 290,
      adjacencies: ['western_europe', 'southern_europe', 'egypt', 'east_africa', 'congo', 'brazil'],
      svgPath: 'M 340,252 L 432,248 L 468,258 L 502,252 L 515,272 L 508,328 L 468,342 L 408,338 L 368,322 L 340,298 L 338,272 Z' },

    { id: 'egypt', name: 'Ägypten', continent: 'africa', labelX: 518, labelY: 278,
      adjacencies: ['southern_europe', 'north_africa', 'middle_east', 'east_africa'],
      svgPath: 'M 502,248 L 545,240 L 562,260 L 558,308 L 530,322 L 505,315 L 498,295 L 505,268 Z' },

    { id: 'east_africa', name: 'Ostafrika', continent: 'africa', labelX: 520, labelY: 358,
      adjacencies: ['egypt', 'north_africa', 'congo', 'south_africa', 'madagascar', 'middle_east'],
      svgPath: 'M 505,318 L 530,322 L 558,312 L 572,335 L 568,378 L 542,398 L 505,392 L 480,372 L 475,342 L 482,325 Z' },

    { id: 'congo', name: 'Kongo', continent: 'africa', labelX: 428, labelY: 368,
      adjacencies: ['north_africa', 'east_africa', 'south_africa'],
      svgPath: 'M 368,328 L 408,325 L 468,338 L 480,355 L 478,378 L 462,400 L 415,405 L 380,395 L 368,368 L 365,345 Z' },

    { id: 'south_africa', name: 'Südafrika', continent: 'africa', labelX: 432, labelY: 438,
      adjacencies: ['congo', 'east_africa', 'madagascar'],
      svgPath: 'M 378,398 L 415,402 L 462,400 L 480,372 L 490,415 L 488,458 L 462,475 L 428,480 L 392,468 L 375,440 L 372,410 Z' },

    { id: 'madagascar', name: 'Madagaskar', continent: 'africa', labelX: 545, labelY: 402,
      adjacencies: ['east_africa', 'south_africa'],
      svgPath: 'M 528,378 L 562,372 L 572,395 L 568,428 L 542,435 L 522,418 L 518,388 Z' },

    // ── ASIEN ──────────────────────────────────────────────────────────────────
    { id: 'middle_east', name: 'Naher Osten', continent: 'asia', labelX: 558, labelY: 248,
      adjacencies: ['southern_europe', 'ukraine', 'afghanistan', 'india', 'east_africa', 'egypt'],
      svgPath: 'M 498,195 L 558,190 L 582,200 L 600,222 L 592,282 L 562,298 L 535,290 L 512,270 L 502,248 L 498,218 Z' },

    { id: 'afghanistan', name: 'Afghanistan', continent: 'asia', labelX: 612, labelY: 192,
      adjacencies: ['ukraine', 'middle_east', 'india', 'china', 'ural'],
      svgPath: 'M 578,152 L 648,148 L 665,168 L 660,218 L 638,232 L 598,225 L 578,205 L 572,175 Z' },

    { id: 'india', name: 'Indien', continent: 'asia', labelX: 625, labelY: 278,
      adjacencies: ['middle_east', 'afghanistan', 'china', 'siam'],
      svgPath: 'M 578,222 L 638,228 L 660,248 L 658,305 L 635,328 L 602,328 L 578,298 L 568,268 L 572,242 Z' },

    { id: 'ural', name: 'Ural', continent: 'asia', labelX: 618, labelY: 112,
      adjacencies: ['ukraine', 'afghanistan', 'siberia', 'china'],
      svgPath: 'M 570,52 L 650,48 L 662,72 L 658,152 L 635,162 L 598,152 L 575,135 L 568,85 Z' },

    { id: 'siberia', name: 'Sibirien', continent: 'asia', labelX: 692, labelY: 88,
      adjacencies: ['ural', 'china', 'mongolia', 'irkutsk', 'yakutsk'],
      svgPath: 'M 655,48 L 742,42 L 756,65 L 752,138 L 725,150 L 695,148 L 662,132 L 652,105 Z' },

    { id: 'yakutsk', name: 'Jakutsk', continent: 'asia', labelX: 778, labelY: 78,
      adjacencies: ['siberia', 'irkutsk', 'kamchatka'],
      svgPath: 'M 758,38 L 812,35 L 822,58 L 818,108 L 798,122 L 768,118 L 752,98 L 752,58 Z' },

    { id: 'irkutsk', name: 'Irkutsk', continent: 'asia', labelX: 705, labelY: 162,
      adjacencies: ['siberia', 'yakutsk', 'kamchatka', 'mongolia'],
      svgPath: 'M 655,132 L 725,148 L 752,152 L 768,168 L 762,205 L 728,215 L 695,208 L 662,195 L 652,165 Z' },

    { id: 'mongolia', name: 'Mongolei', continent: 'asia', labelX: 720, labelY: 238,
      adjacencies: ['siberia', 'irkutsk', 'kamchatka', 'china', 'japan'],
      svgPath: 'M 658,205 L 725,212 L 762,205 L 778,225 L 775,260 L 745,268 L 708,265 L 672,252 L 655,228 Z' },

    { id: 'china', name: 'China', continent: 'asia', labelX: 672, labelY: 215,
      adjacencies: ['ural', 'siberia', 'mongolia', 'afghanistan', 'india', 'siam'],
      svgPath: 'M 658,152 L 695,148 L 725,148 L 752,152 L 762,198 L 758,218 L 728,245 L 702,258 L 672,252 L 645,238 L 635,215 L 638,182 L 655,162 Z' },

    { id: 'japan', name: 'Japan', continent: 'asia', labelX: 778, labelY: 188,
      adjacencies: ['mongolia', 'kamchatka'],
      svgPath: 'M 755,162 L 790,158 L 802,178 L 798,208 L 772,215 L 752,200 L 748,175 Z' },

    { id: 'kamchatka', name: 'Kamtschatka', continent: 'asia', labelX: 808, labelY: 88,
      adjacencies: ['yakutsk', 'irkutsk', 'mongolia', 'japan', 'alaska'],
      svgPath: 'M 818,35 L 852,32 L 858,62 L 850,112 L 832,128 L 808,132 L 790,118 L 778,95 L 790,58 Z' },

    { id: 'siam', name: 'Siam', continent: 'asia', labelX: 688, labelY: 312,
      adjacencies: ['india', 'china', 'indonesia'],
      svgPath: 'M 648,268 L 702,258 L 728,268 L 740,295 L 730,338 L 702,345 L 668,342 L 648,318 L 642,288 Z' },

    // ── AUSTRALIEN ─────────────────────────────────────────────────────────────
    { id: 'indonesia', name: 'Indonesien', continent: 'australia', labelX: 688, labelY: 378,
      adjacencies: ['siam', 'new_guinea', 'western_australia'],
      svgPath: 'M 645,342 L 702,338 L 722,355 L 728,382 L 715,400 L 678,402 L 645,390 L 638,365 Z' },

    { id: 'new_guinea', name: 'Neu-Guinea', continent: 'australia', labelX: 768, labelY: 358,
      adjacencies: ['indonesia', 'western_australia', 'eastern_australia'],
      svgPath: 'M 728,342 L 800,338 L 815,355 L 808,378 L 785,382 L 748,382 L 728,368 L 720,352 Z' },

    { id: 'western_australia', name: 'W-Australien', continent: 'australia', labelX: 688, labelY: 445,
      adjacencies: ['indonesia', 'new_guinea', 'eastern_australia'],
      svgPath: 'M 645,400 L 715,402 L 730,382 L 740,415 L 732,462 L 705,480 L 668,478 L 645,455 L 638,425 Z' },

    { id: 'eastern_australia', name: 'O-Australien', continent: 'australia', labelX: 768, labelY: 438,
      adjacencies: ['new_guinea', 'western_australia'],
      svgPath: 'M 730,380 L 785,382 L 815,395 L 825,428 L 815,472 L 785,488 L 748,482 L 728,455 L 725,418 Z' }

  ],
  continents: {
    north_america: { name: 'Nordamerika', bonus: 5, color: '#c0834a',
      territories: ['alaska','northwest_territory','greenland','alberta','ontario','quebec','western_united_states','eastern_united_states','central_america'] },
    south_america: { name: 'Südamerika', bonus: 2, color: '#5a9e5a',
      territories: ['venezuela','peru','brazil','argentina'] },
    europe:        { name: 'Europa',      bonus: 5, color: '#4a88b8',
      territories: ['iceland','great_britain','scandinavia','northern_europe','western_europe','southern_europe','ukraine'] },
    africa:        { name: 'Afrika',      bonus: 3, color: '#c49a3a',
      territories: ['north_africa','egypt','east_africa','congo','south_africa','madagascar'] },
    asia:          { name: 'Asien',       bonus: 7, color: '#8a5aa0',
      territories: ['middle_east','afghanistan','ural','siberia','yakutsk','kamchatka','irkutsk','mongolia','japan','china','india','siam'] },
    australia:     { name: 'Australien',  bonus: 2, color: '#b85a5a',
      territories: ['indonesia','new_guinea','western_australia','eastern_australia'] }
  },
  crossConnections: [
    { from: 'alaska',     to: 'kamchatka',   type: 'sea' },
    { from: 'brazil',     to: 'north_africa', type: 'sea' }
  ]
};

module.exports = { WORLD_MAP };
