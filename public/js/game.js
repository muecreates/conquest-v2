const socket = io();

let state = null;
let myPlayerId = null;
let myHand = [];
let selectedFrom = null;
let selectedTo = null;
let roomCode = null;
let combatMode = 'classic';
let activeSpecialCard = null;

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
  });

  socket.on('combat_result', result => { showCombatResult(result); });

  socket.on('last_chance', () => { showLastChanceOverlay(); });

  socket.on('game_over', data => {
    showGameOver(data.winner, data.stats);
    $('newGameBtn').onclick = () => location.reload();
    $('backLobbyBtn').onclick = () => window.location.href = '/';
  });

  socket.on('action_error', ({ error }) => { showToast(error, 'error'); });

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

  // Reset selection if turn changed
  if (!isMyTurn) {
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
    sendAction('deploy_setup', { territoryId });
    return;
  }

  if (phase === 'draft') {
    if (terrState.owner !== myPlayerId) { showToast('Nicht dein Gebiet!', 'error'); return; }
    if ((myPlayer?.troopsToPlace || 0) <= 0) { showToast('Keine Truppen zum Platzieren!', 'error'); return; }

    setSelectedTerritory(territoryId);
    selectedFrom = territoryId;

    showDeployControl(myPlayer.troopsToPlace, count => {
      sendAction('deploy', { territoryId, count });
      hideDeployControl();
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

      // Highlight attackable neighbors
      const adjacents = getAdjacentEnemies(territoryId);
      setHighlightedTerritories(adjacents, 'attackable');
      showAttackButtons(false);
      showToast('Wähle ein Angriffsziel!');
    } else if (territoryId === selectedFrom) {
      clearSelection();
    } else if (terrState.owner === myPlayerId) {
      // Switch source
      selectedFrom = territoryId;
      setSelectedTerritory(territoryId);
      const adjacents = getAdjacentEnemies(territoryId);
      setHighlightedTerritories(adjacents, 'attackable');
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

      // Show attack buttons
      const useBlitz = combatMode === 'blitz';
      showAttackButtons(true, useBlitz);
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
    sendAction('start_fortify', {});
    clearSelection();
  });
  $('attackBtn')?.addEventListener('click', () => {
    if (!selectedFrom || !selectedTo) return;
    sendAction('attack', { fromId: selectedFrom, toId: selectedTo });
    showDiceSection(true);
    clearAttackSelection();
  });
  $('blitzBtn')?.addEventListener('click', () => {
    if (!selectedFrom || !selectedTo) return;
    sendAction('blitz_attack', { fromId: selectedFrom, toId: selectedTo });
    showDiceSection(true);
    clearAttackSelection();
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
  showAttackButtons(false);
  showWinChanceArea(false);
}

function clearSelection() {
  selectedFrom = null;
  selectedTo = null;
  setSelectedTerritory(null);
  setHighlightedTerritories([]);
  hideDeployControl();
  hideTerritorySidebar();
  showAttackButtons(false);
  showFortifyButton(false);
  showWinChanceArea(false);
}


// ── START ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
