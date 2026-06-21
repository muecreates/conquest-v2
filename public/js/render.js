const SVG_NS = 'http://www.w3.org/2000/svg';

let mapData = null;
let gameState = null;
let selectedTerritoryId = null;
let highlightedTerritories = new Set();
let onTerritoryClick = null;

const CONTINENT_BORDER_COLORS = {
  north_america: '#e8a87c', south_america: '#82c785',
  europe: '#7eb8d4', africa: '#d4a84b',
  asia: '#c47eb4', australia: '#e87c7c',
  north: '#7eb8d4', west: '#82c785', central: '#e8a87c',
  south: '#d4a84b', east: '#c47eb4'
};

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
  const vb = mapData.viewBox || `0 0 ${mapData.width || 800} ${mapData.height || 600}`;
  svg.setAttribute('viewBox', vb);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Background
  const bg = createEl('rect', { x: 0, y: 0, width: 9999, height: 9999, fill: '#0a1628' });
  svg.appendChild(bg);

  // Draw cross-connections first
  const linesGroup = createEl('g', { id: 'cross-lines' });
  for (const cc of (mapData.crossConnections || [])) {
    const from = mapData.territories.find(t => t.id === cc.from);
    const to = mapData.territories.find(t => t.id === cc.to);
    if (!from || !to) continue;
    // If from is on the right side and to is on the left (Alaska↔Kamchatka), draw arc
    if (Math.abs(from.labelX - to.labelX) > (mapData.width || 700) * 0.5) {
      // Cross-edge connection: two short lines to map edge
      const vbW = parseInt((mapData.viewBox || '0 0 860 540').split(' ')[2]) || 860;
      const midY = (from.labelY + to.labelY) / 2;
      const p1 = createEl('path', {
        d: `M ${from.labelX},${from.labelY} Q ${vbW + 20},${midY - 30} ${vbW},${midY}`,
        fill: 'none', class: 'cross-line'
      });
      const p2 = createEl('path', {
        d: `M ${to.labelX},${to.labelY} Q ${-20},${midY - 30} 0,${midY}`,
        fill: 'none', class: 'cross-line'
      });
      linesGroup.appendChild(p1);
      linesGroup.appendChild(p2);
    } else {
      const line = createEl('line', {
        x1: from.labelX, y1: from.labelY,
        x2: to.labelX, y2: to.labelY,
        class: 'cross-line'
      });
      linesGroup.appendChild(line);
    }
  }
  svg.appendChild(linesGroup);

  // Territory group
  const terrGroup = createEl('g', { id: 'territories' });
  svg.appendChild(terrGroup);

  // Labels group
  const labelGroup = createEl('g', { id: 'labels' });
  svg.appendChild(labelGroup);

  for (const t of mapData.territories) {
    renderTerritory(t, terrGroup, labelGroup);
  }

  setupMapTooltip(svg);
}

function renderTerritory(t, terrGroup, labelGroup) {
  const state = gameState;
  const terrState = state?.territories?.[t.id] || { owner: null, troops: 0 };

  // Get player color
  const owner = state?.players?.find(p => p.id === terrState.owner);
  const fillColor = owner ? owner.color : '#2d333b';

  // Path
  const path = createEl('path', {
    d: t.svgPath || t.d,
    fill: fillColor,
    'fill-opacity': '0.75',
    class: 'territory-path',
    id: `terr-${t.id}`,
    'data-id': t.id
  });

  path.addEventListener('click', () => handleTerritoryClick(t.id));
  path.addEventListener('mouseenter', e => showTooltip(t, e));
  path.addEventListener('mousemove', e => moveTooltip(e));
  path.addEventListener('mouseleave', hideTooltip);

  terrGroup.appendChild(path);

  // Troop bubble
  const bubble = createEl('g', { class: 'troop-bubble', id: `bubble-${t.id}` });
  const circle = createEl('circle', { cx: t.labelX, cy: t.labelY, r: 11 });
  const text = createEl('text', { x: t.labelX, y: t.labelY, class: '' });
  text.textContent = terrState.troops || '0';

  bubble.appendChild(circle);
  bubble.appendChild(text);
  labelGroup.appendChild(bubble);
}

function refreshTerritories() {
  if (!mapData || !gameState) return;

  for (const t of mapData.territories) {
    const terrState = gameState.territories[t.id] || { owner: null, troops: 0 };
    const owner = gameState.players?.find(p => p.id === terrState.owner);
    const fillColor = owner ? owner.color : '#2d333b';

    const path = document.getElementById(`terr-${t.id}`);
    if (path) {
      path.setAttribute('fill', fillColor);
      path.setAttribute('fill-opacity', terrState.owner ? '0.75' : '0.4');
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
  // Clear previous
  for (const id of highlightedTerritories) {
    const el = document.getElementById(`terr-${id}`);
    if (el) { el.classList.remove('attackable', 'fortifiable'); }
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

// ── TOOLTIP ───────────────────────────────────────────────────────────────────

function setupMapTooltip(svg) {
  svg.addEventListener('mouseleave', hideTooltip);
}

function showTooltip(territory, e) {
  const tooltip = document.getElementById('mapTooltip');
  const terrState = gameState?.territories?.[territory.id] || {};
  const owner = gameState?.players?.find(p => p.id === terrState.owner);
  const contName = mapData.continents[territory.continent]?.name || territory.continent;

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
  tooltip.style.left = (e.clientX + 12) + 'px';
  tooltip.style.top = (e.clientY - 10) + 'px';

  const rect = tooltip.getBoundingClientRect();
  if (rect.right > window.innerWidth - 10) {
    tooltip.style.left = (e.clientX - rect.width - 12) + 'px';
  }
}

function hideTooltip() {
  document.getElementById('mapTooltip').classList.remove('visible');
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
