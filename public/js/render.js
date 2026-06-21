const SVG_NS = 'http://www.w3.org/2000/svg';

let mapData = null;
let gameState = null;
let selectedTerritoryId = null;
let highlightedTerritories = new Set();
let onTerritoryClick = null;

function initMap(map, state, clickHandler) {
  mapData = map;
  gameState = state;
  onTerritoryClick = clickHandler;
  renderMap();
}

function updateMapState(state) {
  gameState = state;
  refreshTerritories();
}

function renderMap() {
  const svg = document.getElementById('game-map');
  svg.innerHTML = '';
  const vb = mapData.viewBox || '0 0 960 600';
  svg.setAttribute('viewBox', vb);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Background
  svg.appendChild(createEl('rect', { x: 0, y: 0, width: 9999, height: 9999, fill: '#0a1628' }));

  // Grid overlay (subtle)
  const defs = createEl('defs', {});
  const pattern = createEl('pattern', { id: 'grid', width: '40', height: '40', patternUnits: 'userSpaceOnUse' });
  pattern.appendChild(createEl('path', { d: 'M 40 0 L 0 0 0 40', fill: 'none', stroke: '#161b22', 'stroke-width': '0.5' }));
  defs.appendChild(pattern);
  svg.appendChild(defs);
  svg.appendChild(createEl('rect', { width: 9999, height: 9999, fill: 'url(#grid)', opacity: '0.4' }));

  // Cross-connections
  const linesGroup = createEl('g', { id: 'cross-lines' });
  for (const cc of (mapData.crossConnections || [])) {
    const from = mapData.territories.find(t => t.id === cc.from);
    const to = mapData.territories.find(t => t.id === cc.to);
    if (!from || !to) continue;
    const vbW = parseInt(vb.split(' ')[2]) || 960;
    if (Math.abs(from.labelX - to.labelX) > vbW * 0.5) {
      const midY = (from.labelY + to.labelY) / 2;
      linesGroup.appendChild(createEl('path', { d: `M ${from.labelX},${from.labelY} Q ${vbW+20},${midY-30} ${vbW},${midY}`, fill: 'none', class: 'cross-line' }));
      linesGroup.appendChild(createEl('path', { d: `M ${to.labelX},${to.labelY} Q -20,${midY-30} 0,${midY}`, fill: 'none', class: 'cross-line' }));
    } else {
      linesGroup.appendChild(createEl('line', { x1: from.labelX, y1: from.labelY, x2: to.labelX, y2: to.labelY, class: 'cross-line' }));
    }
  }
  svg.appendChild(linesGroup);

  // Territory paths (one group per continent for z-ordering)
  const terrGroup = createEl('g', { id: 'territories' });
  svg.appendChild(terrGroup);

  // Label group (troop bubbles)
  const labelGroup = createEl('g', { id: 'labels' });
  svg.appendChild(labelGroup);

  // Continent labels group (on top, no pointer events)
  const contLabelGroup = createEl('g', { id: 'cont-labels', style: 'pointer-events:none' });
  svg.appendChild(contLabelGroup);

  for (const t of mapData.territories) {
    renderTerritory(t, terrGroup, labelGroup);
  }

  // Draw continent labels
  if (mapData.continents) {
    renderContinentLabels(contLabelGroup);
  }

  setupMapTooltip(svg);
}

function renderTerritory(t, terrGroup, labelGroup) {
  const terrState = gameState?.territories?.[t.id] || { owner: null, troops: 0 };
  const owner = gameState?.players?.find(p => p.id === terrState.owner);
  const fillColor = owner ? owner.color : '#2d3748';

  // Get continent color for border
  const contData = mapData.continents?.[t.continent];
  const contColor = contData?.color || '#4a5568';

  const path = createEl('path', {
    d: t.svgPath || t.d || '',
    fill: fillColor,
    'fill-opacity': terrState.owner ? '0.72' : '0.35',
    stroke: contColor,
    'stroke-width': '1.8',
    'stroke-linejoin': 'round',
    'stroke-opacity': '0.85',
    'paint-order': 'stroke fill',
    class: 'territory-path',
    id: `terr-${t.id}`,
    'data-id': t.id,
    'data-continent': t.continent
  });

  path.addEventListener('click', () => handleTerritoryClick(t.id));
  path.addEventListener('mouseenter', e => showTooltip(t, e));
  path.addEventListener('mousemove', e => moveTooltip(e));
  path.addEventListener('mouseleave', hideTooltip);
  terrGroup.appendChild(path);

  // Troop bubble
  const bubble = createEl('g', { class: 'troop-bubble', id: `bubble-${t.id}` });
  const circle = createEl('circle', { cx: t.labelX, cy: t.labelY, r: '13', fill: 'rgba(0,0,0,0.7)', stroke: contColor, 'stroke-width': '1.5' });
  const text = createEl('text', { x: t.labelX, y: t.labelY, class: 'bubble-text' });
  text.textContent = terrState.troops || '0';
  bubble.appendChild(circle);
  bubble.appendChild(text);
  labelGroup.appendChild(bubble);
}

function renderContinentLabels(group) {
  const continents = mapData.continents || {};
  const vbParts = (mapData.viewBox || '0 0 960 600').split(' ');
  const vbW = parseFloat(vbParts[2]) || 960;
  const vbH = parseFloat(vbParts[3]) || 600;

  for (const [contId, cont] of Object.entries(continents)) {
    const terrs = cont.territories || [];
    // Compute centroid of all label positions for this continent
    const pts = terrs.map(tid => {
      const t = mapData.territories.find(x => x.id === tid);
      return t ? [t.labelX, t.labelY] : null;
    }).filter(Boolean);
    if (!pts.length) continue;
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;

    const label = createEl('text', {
      x: cx, y: cy,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: cont.color || '#fff',
      'fill-opacity': '0.18',
      'font-size': Math.max(16, Math.min(28, vbW / 40)),
      'font-weight': '900',
      'font-family': 'monospace',
      'letter-spacing': '2',
      'text-transform': 'uppercase',
      style: 'pointer-events:none; user-select:none; text-transform:uppercase'
    });
    label.textContent = (cont.name || contId).toUpperCase();
    group.appendChild(label);
  }
}

function refreshTerritories() {
  if (!mapData || !gameState) return;

  for (const t of mapData.territories) {
    const terrState = gameState.territories[t.id] || { owner: null, troops: 0 };
    const owner = gameState.players?.find(p => p.id === terrState.owner);
    const fillColor = owner ? owner.color : '#2d3748';

    const path = document.getElementById(`terr-${t.id}`);
    if (path) {
      path.setAttribute('fill', fillColor);
      path.setAttribute('fill-opacity', terrState.owner ? '0.72' : '0.35');
    }

    const bubble = document.getElementById(`bubble-${t.id}`);
    if (bubble) {
      const text = bubble.querySelector('text');
      if (text) text.textContent = terrState.troops || '0';
    }
  }

  applyHighlights();
}

function handleTerritoryClick(territoryId) {
  if (onTerritoryClick) onTerritoryClick(territoryId);
}

function setSelectedTerritory(id) {
  if (selectedTerritoryId) {
    const prev = document.getElementById(`terr-${selectedTerritoryId}`);
    if (prev) prev.classList.remove('selected');
  }
  selectedTerritoryId = id;
  if (id) {
    const el = document.getElementById(`terr-${id}`);
    if (el) el.classList.add('selected');
  }
}

function setHighlightedTerritories(ids, type = 'attackable') {
  for (const id of highlightedTerritories) {
    const el = document.getElementById(`terr-${id}`);
    if (el) el.classList.remove('attackable', 'fortifiable');
  }
  highlightedTerritories = new Set(ids);
  for (const id of ids) {
    const el = document.getElementById(`terr-${id}`);
    if (el) el.classList.add(type);
  }
}

function applyHighlights() {
  for (const id of highlightedTerritories) {
    const el = document.getElementById(`terr-${id}`);
    if (el) el.classList.add('attackable');
  }
  if (selectedTerritoryId) {
    const el = document.getElementById(`terr-${selectedTerritoryId}`);
    if (el) el.classList.add('selected');
  }
}

function flashTerritory(id, className = 'selected', duration = 500) {
  const el = document.getElementById(`terr-${id}`);
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

// ── TOOLTIP ──────────────────────────────────────────────────────────────────

function setupMapTooltip(svg) {
  svg.addEventListener('mouseleave', hideTooltip);
}

function showTooltip(territory, e) {
  const tooltip = document.getElementById('mapTooltip');
  if (!tooltip) return;
  const terrState = gameState?.territories?.[territory.id] || {};
  const owner = gameState?.players?.find(p => p.id === terrState.owner);
  const contName = mapData.continents?.[territory.continent]?.name || territory.continent;

  document.getElementById('tooltipName').textContent = territory.name;
  document.getElementById('tooltipOwner').textContent = owner ? owner.name : 'Neutral';
  document.getElementById('tooltipDot').style.background = owner ? owner.color : '#555';
  document.getElementById('tooltipTroops').textContent = `${terrState.troops || 0} Truppen`;
  document.getElementById('tooltipContinent').textContent = contName;

  tooltip.classList.add('visible');
  moveTooltip(e);
}

function moveTooltip(e) {
  const tooltip = document.getElementById('mapTooltip');
  if (!tooltip) return;
  tooltip.style.left = (e.clientX + 12) + 'px';
  tooltip.style.top = (e.clientY - 10) + 'px';
  const rect = tooltip.getBoundingClientRect();
  if (rect.right > window.innerWidth - 10) {
    tooltip.style.left = (e.clientX - rect.width - 12) + 'px';
  }
}

function hideTooltip() {
  const el = document.getElementById('mapTooltip');
  if (el) el.classList.remove('visible');
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function createEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function getTerritoryById(id) {
  return mapData?.territories?.find(t => t.id === id) || null;
}
