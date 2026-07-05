const socket = io();

let state = null;
let myPlayerId = null;
let myHand = [];
let selectedFrom = null;
let selectedTo = null;
let roomCode = null;
let combatMode = 'classic';
let activeSpecialCard = null;
let timerInterval = null;

const $ = id => document.getElementById(id);

// ── INIT ──────────────────────────────────────────────────────────────────────

function init() {
  const playerName = sessionStorage.getItem('playerName') || 'Spieler';
  const settings = JSON.parse(sessionStorage.getItem('settings') || '{}');
  const mode = sessionStorage.getItem('mode') || 'singleplayer';
  combatMode = settings.combatMode || 'classic';

  if (mode === 'multiplayer') {
    const storedCode = sessionStorage.getItem('roomCode');
    if (storedCode) {
      socket.emit('join_room', { code: storedCode, playerName });
    }
  } else {
    socket.emit('create_room', { playerName, settings });
  }

  socket.on('room_joined', data => {
    roomCode = data.roomCode;
    myPlayerId = data.players.find(p => !p.isAI)?.id || data.players[0].id;
  });

  socket.on('game_started', () => { /* state comes via state_update */ });

  socket.on('state_update', data => {
    state = data;
    myPlayerId = data.myPlayerId || myPlayerId;
    myHand = data.myHand || [];
    handleStateUpdate();
    maybeShowTurnBanner(state);
    updatePhaseTabRow(state.phase);
    fixPlayerRowColors(state);
  });

  socket.on('combat_result', result => {
    showCombatResult(result);
    if (result.conquered && result.territoryId) flashConqueredTerritory(result.territoryId);
    if (result.fromId && result.toId) showCombatIndicator(result.fromId, result.toId);
  });

  socket.on('last_chance', () => { showLastChanceOverlay(); });

  socket.on('game_over', data => {
    showGameOver(data.winner, data.stats);
    startConfetti(data.winner?.color || '#f0c040');
    $('newGameBtn').onclick = () => location.reload();
    $('backLobbyBtn').onclick = () => window.location.href = '/';
  });

  socket.on('action_error', ({ error }) => { showToast(error, 'error'); });

  socket.on('turn_timer', ({ seconds, playerId }) => {
    if (playerId === myPlayerId) startTurnTimer(seconds);
    else stopTurnTimer();
  });

  socket.on('turn_timeout', () => {
    stopTurnTimer();
    showToast('Zeit abgelaufen — Zug automatisch beendet!', 'error', 3000);
  });

  bindButtons();
}

// ── STATE UPDATE ──────────────────────────────────────────────────────────────

function handleStateUpdate() {
  if (!state) return;

  if (!mapData && state.mapData) {
    initMap(state.mapData, state, handleTerritoryClick);
  } else if (state.mapData) {
    updateMapState(state);
  }

  const isMyTurn = getCurrentPlayer()?.id === myPlayerId;
  updatePhaseUI(state, myPlayerId);
  updatePlayersOverview(state, myPlayerId);
  updateGameLog(state.log || []);

  const settings = JSON.parse(sessionStorage.getItem('settings') || '{}');
  updateCardsUI(myHand, state.phase, isMyTurn, settings.cardMode || 'classic');

  const myPlayerState = state.players?.find(p => p.id === myPlayerId);
  if (myPlayerState?.specialCard !== undefined) {
    updateSpecialCardUI(myPlayerState.specialCard, state.phase, isMyTurn);
  }

  // Reset selection if turn changed or phase changed
  if (!isMyTurn || state.phase === 'fortify' || state.phase === 'draft') {
    clearSelection();
  }

  if (state.phase === 'gameover') {
    // Will be shown via game_over event
  }
}

// ── TERRITORY INTERACTION ─────────────────────────────────────────────────────

function handleTerritoryClick(territoryId) {
  if (!state || !myPlayerId) return;

  // Special card targeting
  if (activeSpecialCard) {
    sendAction('special_card', { cardType: activeSpecialCard, targetId: territoryId });
    activeSpecialCard = null;
    return;
  }

  const current = getCurrentPlayer();
  const isMyTurn = current?.id === myPlayerId;
  const phase = state.phase;

  if (!isMyTurn) {
    showToast('Nicht dein Zug!', 'error');
    return;
  }

  const terrState = state.territories[territoryId];
  if (!terrState) return;
  const territory = state.mapData.territories.find(t => t.id === territoryId);
  const owner = state.players.find(p => p.id === terrState.owner);
  const myPlayer = state.players.find(p => p.id === myPlayerId);

  // Show territory info
  showTerritorySidebar(territory, terrState, owner, phase, isMyTurn, myPlayerId);

  if (phase === 'setup') {
    if (terrState.owner !== myPlayerId) { showToast('Nicht dein Gebiet!', 'error'); return; }
    setSelectedTerritory(territoryId);
    selectedFrom = territoryId;
    showDeployBottomPanel(territory.name, terrState.troops, 1, () => {
      sendAction('deploy_setup', { territoryId });
      hideDeployBottomPanel();
      clearSelection();
    });
    return;
  }

  if (phase === 'draft') {
    if (terrState.owner !== myPlayerId) { showToast('Nicht dein Gebiet!', 'error'); return; }
    if ((myPlayer?.troopsToPlace || 0) <= 0) { showToast('Keine Truppen zum Platzieren!', 'error'); return; }

    setSelectedTerritory(territoryId);
    selectedFrom = territoryId;
    showDeployBottomPanel(territory.name, terrState.troops, myPlayer.troopsToPlace, count => {
      sendAction('deploy', { territoryId, count });
      hideDeployBottomPanel();
    });
    showWinChanceArea(false);
    return;
  }

  if (phase === 'attack') {
    if (!selectedFrom) {
      // Select source
      if (terrState.owner !== myPlayerId) { showToast('Wähle zuerst dein eigenes Gebiet!', 'error'); return; }
      if (terrState.troops < 2) { showToast('Brauche mindestens 2 Truppen!', 'error'); return; }

      selectedFrom = territoryId;
      setSelectedTerritory(territoryId);

      // Zoom in + highlight attackable neighbors with arrows
      const fromTerrData = state.mapData.territories.find(t => t.id === territoryId);
      if (fromTerrData) zoomToTerritory(fromTerrData);
      const adjacents = getAdjacentEnemies(territoryId);
      setHighlightedTerritories(adjacents, 'attackable');
      drawAttackArrows(territoryId, adjacents);
      showAttackButtons(false);
      showToast('Wähle ein Angriffsziel!');
    } else if (territoryId === selectedFrom) {
      clearSelection();
    } else if (terrState.owner === myPlayerId) {
      // Switch source
      clearAttackArrows();
      selectedFrom = territoryId;
      setSelectedTerritory(territoryId);
      const switchTerrData = state.mapData.territories.find(t => t.id === territoryId);
      if (switchTerrData) zoomToTerritory(switchTerrData);
      const adjacents = getAdjacentEnemies(territoryId);
      setHighlightedTerritories(adjacents, 'attackable');
      drawAttackArrows(territoryId, adjacents);
    } else {
      // Attack target
      const adjacents = getAdjacentEnemies(selectedFrom);
      if (!adjacents.includes(territoryId)) { showToast('Nicht angrenzend!', 'error'); return; }

      selectedTo = territoryId;

      // Show win chance
      const fromTroops = state.territories[selectedFrom].troops;
      const toTroops = state.territories[selectedTo].troops;
      showWinChanceArea(true);
      const attDice = Math.min(3, fromTroops - 1);
      const defDice = Math.min(2, toTroops);
      const key = `${attDice}v${defDice}`;
      updateWinChance(fromTroops, toTroops, key);

      // Show attack buttons — pass troop count so blitz is disabled if < 2
      const useBlitz = combatMode === 'blitz';
      showAttackButtons(true, useBlitz, fromTroops);
    }
    return;
  }

  if (phase === 'fortify') {
    if (!selectedFrom) {
      if (terrState.owner !== myPlayerId) { showToast('Wähle dein eigenes Gebiet!', 'error'); return; }
      if (terrState.troops < 2) { showToast('Brauche mindestens 2 Truppen!', 'error'); return; }
      selectedFrom = territoryId;
      setSelectedTerritory(territoryId);

      // Highlight connected own territories
      const connected = getConnectedOwn(territoryId);
      setHighlightedTerritories(connected.filter(id => id !== territoryId), 'fortifiable');
      showToast('Wähle Ziel-Territorium!');
    } else if (territoryId === selectedFrom) {
      clearSelection();
    } else if (terrState.owner === myPlayerId) {
      selectedTo = territoryId;
      const fromTroops = state.territories[selectedFrom].troops;
      showDeployControl(fromTroops - 1, count => {
        sendAction('fortify', { fromId: selectedFrom, toId: selectedTo, count });
        hideDeployControl();
        clearSelection();
      });
      showFortifyButton(true);
    } else {
      showToast('Muss dein eigenes Gebiet sein!', 'error');
    }
    return;
  }
}

function updateWinChance(fromTroops, toTroops, key) {
  // Rough probability lookup
  const probs = {
    '3v2': 37, '3v1': 66, '2v2': 23, '2v1': 58, '1v2': 25, '1v1': 42
  };
  const pct = probs[key] || 50;
  const attDice = Math.min(3, fromTroops - 1);
  const defDice = Math.min(2, toTroops);

  showWinChance(pct, `${attDice} Angreifer-Würfel vs ${defDice} Verteidiger-Würfel`);
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

function bindButtons() {
  $('endDraftBtn')?.addEventListener('click', () => sendAction('end_draft', {}));
  $('endAttackBtn')?.addEventListener('click', () => {
    clearAttackArrows();
    resetZoom();
    sendAction('start_fortify', {});
    clearSelection();
  });
  $('attackBtn')?.addEventListener('click', () => {
    if (!selectedFrom || !selectedTo) return;
    // Shake both territories before sending
    shakeTerritory(selectedFrom);
    shakeTerritory(selectedTo);
    clearAttackArrows();
    setTimeout(() => {
      sendAction('attack', { fromId: selectedFrom, toId: selectedTo });
      showDiceSection(true);
      clearAttackSelection();
    }, 150);
  });
  $('blitzBtn')?.addEventListener('click', () => {
    if (!selectedFrom || !selectedTo) return;
    shakeTerritory(selectedFrom);
    shakeTerritory(selectedTo);
    clearAttackArrows();
    setTimeout(() => {
      sendAction('blitz_attack', { fromId: selectedFrom, toId: selectedTo });
      showDiceSection(true);
      clearAttackSelection();
    }, 150);
  });
  $('skipFortifyBtn')?.addEventListener('click', () => {
    sendAction('skip_fortify', {});
    clearSelection();
  });
  $('tradeCardsBtn')?.addEventListener('click', () => {
    const cardIds = getSelectedCardIds();
    if (cardIds.length !== 3) { showToast('Wähle genau 3 Karten!', 'error'); return; }
    sendAction('trade_cards', { cardIds });
    clearSelectedCards();
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.special-card-btn');
    if (!btn) return;
    const cardType = btn.dataset.cardType;
    if (!cardType) return;
    if (cardType === 'blitzkrieg') {
      sendAction('special_card', { cardType, targetId: null });
      showToast('Blitzkrieg aktiviert!', 'success');
    } else {
      activeSpecialCard = cardType;
      showToast(cardType === 'bomb' ? 'Feindliches Gebiet wählen!' : 'Eigenes Gebiet wählen!');
    }
  });
}

function sendAction(type, payload) {
  if (!roomCode) return;
  socket.emit('game_action', { roomCode, type, payload });
}

// ── COMBAT RESULT DISPLAY ─────────────────────────────────────────────────────

function showCombatResult(result) {
  const dice = result.attackerDice || result.rounds?.[result.rounds.length - 1]?.attackerDice || [];
  const defDice = result.defenderDice || result.rounds?.[result.rounds.length - 1]?.defenderDice || [];
  const attLoss = result.attackerLosses || result.attLosses || 0;
  const defLoss = result.defenderLosses || result.defLosses || 0;

  // Show inline dice section
  showDiceSection(true);
  const diceArea = $('diceArea');
  if (diceArea && dice.length > 0) {
    animateDiceRoll(diceArea, dice, defDice);
    setTimeout(() => showCombatResult_text(diceArea, attLoss, defLoss), 450);
  }

  // Show combat modal
  const modal = $('combatModal');
  const cmDiceArea = $('cmDiceArea');
  const cmResult = $('cmResult');
  const cmTitle = $('cmTitle');
  if (modal && cmDiceArea) {
    modal.style.display = 'flex';
    if (cmTitle) cmTitle.textContent = result.conquered ? '⚔ Gebiet erobert!' : '⚔ Kampf';
    showDiceModal(cmDiceArea, dice, defDice, attLoss, defLoss, cmResult);
    if (combatMode === 'blitz') setTimeout(() => { modal.style.display = 'none'; }, 1500);
  }

  if (result.conquered) setTimeout(() => showToast('Territorium erobert!', 'success'), 600);
}

function showCombatResult_text(container, attLoss, defLoss) {
  const existing = container.querySelector('.combat-result');
  if (existing) existing.remove();

  const result = document.createElement('div');
  result.className = 'combat-result';

  if (attLoss === 0) { result.classList.add('att-wins'); }
  else if (defLoss === 0) { result.classList.add('def-wins'); }
  else { result.classList.add('split'); }

  result.textContent = `Angreifer −${attLoss}  |  Verteidiger −${defLoss}`;
  container.appendChild(result);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getCurrentPlayer() {
  return state?.players?.[state.currentPlayerIndex] || null;
}

function getAdjacentEnemies(territoryId) {
  if (!state?.mapData) return [];
  const territory = state.mapData.territories.find(t => t.id === territoryId);
  if (!territory) return [];

  const adj = new Set(territory.adjacencies);
  for (const cc of (state.mapData.crossConnections || [])) {
    if (cc.from === territoryId) adj.add(cc.to);
    if (cc.to === territoryId) adj.add(cc.from);
  }

  return Array.from(adj).filter(id => {
    const t = state.territories[id];
    return t && t.owner !== myPlayerId;
  });
}

function getConnectedOwn(startId) {
  if (!state?.mapData) return [];
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift();
    const terrData = state.mapData.territories.find(t => t.id === current);
    if (!terrData) continue;

    const adj = new Set(terrData.adjacencies);
    for (const cc of (state.mapData.crossConnections || [])) {
      if (cc.from === current) adj.add(cc.to);
      if (cc.to === current) adj.add(cc.from);
    }

    for (const nid of adj) {
      if (!visited.has(nid) && state.territories[nid]?.owner === myPlayerId) {
        visited.add(nid);
        queue.push(nid);
      }
    }
  }
  return Array.from(visited);
}

function clearAttackSelection() {
  selectedTo = null;
  setHighlightedTerritories([], 'attackable');
  clearAttackArrows();
  showAttackButtons(false);
  showWinChanceArea(false);
}

function clearSelection() {
  selectedFrom = null;
  selectedTo = null;
  setSelectedTerritory(null);
  setHighlightedTerritories([]);
  clearAttackArrows();
  resetZoom();
  hideDeployControl();
  hideDeployBottomPanel();
  hideTerritorySidebar();
  showAttackButtons(false);
  showFortifyButton(false);
  showWinChanceArea(false);
}


// ── BOTTOM DEPLOY PANEL ───────────────────────────────────────────────────────

let _deployCallback = null;

function showDeployBottomPanel(terrName, currentTroops, maxDeploy, callback) {
  _deployCallback = callback;
  const panel = $('deployBottomPanel');
  const nameEl = $('dbpName');
  const troopsEl = $('dbpTroops');
  const slider = $('dbpSlider');
  const count = $('dbpCount');
  const minus = $('dbpMinus');
  const plus = $('dbpPlus');
  const confirm = $('dbpConfirm');
  if (!panel) return;

  nameEl.textContent = terrName;
  troopsEl.textContent = `${currentTroops} Truppen aktuell`;
  slider.min = 1;
  slider.max = Math.max(1, maxDeploy);
  slider.value = maxDeploy === 1 ? 1 : Math.min(1, maxDeploy);
  count.textContent = slider.value;

  // Hide slider if only 1 to place
  const showSlider = maxDeploy > 1;
  slider.style.display = showSlider ? '' : 'none';
  minus.style.display = showSlider ? '' : 'none';
  plus.style.display = showSlider ? '' : 'none';
  count.textContent = showSlider ? slider.value : 1;

  slider.oninput = () => { count.textContent = slider.value; };
  minus.onclick = () => { if (parseInt(slider.value) > 1) { slider.value--; count.textContent = slider.value; } };
  plus.onclick = () => { if (parseInt(slider.value) < maxDeploy) { slider.value++; count.textContent = slider.value; } };
  confirm.onclick = () => { if (_deployCallback) { _deployCallback(parseInt(slider.value)); _deployCallback = null; } };

  panel.style.display = 'flex';
}

function hideDeployBottomPanel() {
  const panel = $('deployBottomPanel');
  if (panel) panel.style.display = 'none';
  _deployCallback = null;
}

// ── TURN TIMER ────────────────────────────────────────────────────────────────

function startTurnTimer(seconds) {
  stopTurnTimer();
  const bar = $('turnTimerBar');
  const fill = $('timerFill');
  const label = $('timerLabel');
  if (!bar || !fill || !label) return;

  bar.style.display = '';
  let remaining = seconds;

  fill.style.transition = 'none';
  fill.style.width = '100%';
  label.textContent = `${remaining}s`;

  setTimeout(() => {
    fill.style.transition = `width ${seconds}s linear`;
    fill.style.width = '0%';
  }, 50);

  timerInterval = setInterval(() => {
    remaining--;
    label.textContent = `${remaining}s`;
    if (remaining <= 10) label.style.color = 'var(--danger)';
    if (remaining <= 0) stopTurnTimer();
  }, 1000);
}

function stopTurnTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const bar = $('turnTimerBar');
  if (bar) bar.style.display = 'none';
}

// ── MISSING UI HELPERS ────────────────────────────────────────────────────────

function showWinChance(pct, detail) {
  const area = $('winChanceArea');
  const pctEl = $('winChancePct');
  const fillEl = $('winChanceFill');
  const detailEl = $('winChanceDetail');
  if (!area) return;
  area.style.display = '';
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fillEl) {
    fillEl.style.width = `${pct}%`;
    fillEl.style.background = pct >= 60 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  }
  if (detailEl) detailEl.textContent = detail || '';
}

// ── ANIMATIONS ────────────────────────────────────────────────────────────────

let _lastPlayerId = null;
let _lastPhase = null;

function maybeShowTurnBanner(state) {
  const current = state.players[state.currentPlayerIndex];
  if (!current) return;
  const isNew = current.id !== _lastPlayerId || state.phase !== _lastPhase;
  if (!isNew) return;
  _lastPlayerId = current.id;
  _lastPhase = state.phase;

  const banner = $('turnBanner');
  if (!banner) return;
  banner.textContent = current.id === myPlayerId ? 'DEIN ZUG' : `${current.name.toUpperCase()} IST DRAN`;
  banner.style.color = current.color;
  banner.style.borderColor = current.color;
  banner.style.display = '';
  banner.classList.remove('hiding');

  clearTimeout(banner._hideTimer);
  banner._hideTimer = setTimeout(() => {
    banner.classList.add('hiding');
    setTimeout(() => { banner.style.display = 'none'; }, 420);
  }, 2000);
}

function updatePhaseTabRow(phase) {
  const tabs = { draft: 'ptabDraft', attack: 'ptabAttack', fortify: 'ptabFortify' };
  for (const [p, id] of Object.entries(tabs)) {
    const el = $(id);
    if (el) el.classList.toggle('active', p === phase);
  }
  const row = $('phaseTabRow');
  if (row) {
    const show = ['draft','attack','fortify'].includes(phase);
    row.style.display = show ? '' : 'none';
  }
}

function flashConqueredTerritory(territoryId) {
  const el = document.getElementById(`terr-${territoryId}`);
  if (!el) return;
  el.classList.add('territory-conquering');
  setTimeout(() => el.classList.remove('territory-conquering'), 600);
}

function animateTroopMovement(fromId, toId, count) {
  const fromEl = document.getElementById(`bubble-${fromId}`);
  const toEl = document.getElementById(`bubble-${toId}`);
  const svg = document.getElementById('game-map');
  if (!fromEl || !toEl || !svg) return;

  const svgRect = svg.getBoundingClientRect();
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();

  const mover = document.createElement('div');
  mover.className = 'troop-mover';
  mover.textContent = count;
  mover.style.left = (fromRect.left + fromRect.width/2 - 14) + 'px';
  mover.style.top  = (fromRect.top  + fromRect.height/2 - 14) + 'px';
  document.body.appendChild(mover);

  const dx = toRect.left - fromRect.left;
  const dy = toRect.top  - fromRect.top;
  mover.style.transform = `translate(${dx}px, ${dy}px)`;

  setTimeout(() => mover.remove(), 750);
}

function showCombatIndicator(fromId, toId) {
  const fromEl = document.getElementById(`bubble-${fromId}`);
  const toEl = document.getElementById(`bubble-${toId}`);
  const indicator = $('combatIndicator');
  if (!fromEl || !toEl || !indicator) return;

  const fromRect = fromEl.getBoundingClientRect();
  const toRect   = toEl.getBoundingClientRect();
  const midX = (fromRect.left + toRect.left) / 2 + fromRect.width/2;
  const midY = (fromRect.top  + toRect.top)  / 2 + fromRect.height/2;

  indicator.style.left = midX + 'px';
  indicator.style.top  = midY + 'px';
  indicator.style.display = '';
  clearTimeout(indicator._hideTimer);
  indicator._hideTimer = setTimeout(() => { indicator.style.display = 'none'; }, 2000);
}

// Canvas confetti particle system
function startConfetti(winnerColor) {
  const canvas = $('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = '';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const colors = [winnerColor, '#f0c040', '#ffffff', '#f39c12', '#e74c3c'];
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.5,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotVel: (Math.random() - 0.5) * 6
  }));

  let frame = 0;
  const maxFrames = 240;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.5);
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotVel;
    }
    frame++;
    if (frame < maxFrames) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
  }
  draw();
}

function fixPlayerRowColors(state) {
  const container = $('playersOverview');
  if (!container) return;
  const rows = container.querySelectorAll('.player-row');
  const activePlayer = state.players[state.currentPlayerIndex];
  rows.forEach((row, i) => {
    const player = state.players[i];
    if (player) {
      row.style.setProperty('--player-color', player.color);
    }
  });
}

// Touch support for SVG territories
function setupTouchEvents() {
  const svg = document.getElementById('game-map');
  if (!svg) return;
  svg.addEventListener('touchend', e => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.dataset.id) handleTerritoryClick(el.dataset.id);
  }, { passive: false });
}

// ── START ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupTouchEvents();
  init();
});
