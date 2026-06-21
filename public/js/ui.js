const PHASE_HINTS = {
  setup:   'Klicke eines deiner Territorien, um eine Truppe zu platzieren.',
  draft:   'Platziere deine Truppen. Klicke ein eigenes Territorium, dann "Platzieren".',
  attack:  'Klicke ein eigenes Territorium (≥2 Truppen), dann ein feindliches Nachbargebiet.',
  fortify: 'Verschiebe Truppen durch verbundene eigene Territorien. Oder überspringe.',
  gameover: 'Das Spiel ist beendet!'
};

const PHASE_NAMES = {
  setup: 'SETUP', draft: 'DRAFT', attack: 'ANGRIFF', fortify: 'VERSTÄRK.', gameover: 'ENDE'
};

let toastTimeout = null;

function updatePhaseUI(state, myPlayerId) {
  const current = state.players[state.currentPlayerIndex];
  const isMyTurn = current?.id === myPlayerId;
  const phase = state.phase;

  // Player banner
  const dot = document.getElementById('playerDot');
  const nameEl = document.getElementById('playerNameDisplay');
  const badge = document.getElementById('phaseBadge');
  const hint = document.getElementById('phaseHint');

  if (dot) dot.style.background = current?.color || '#555';
  if (nameEl) nameEl.textContent = isMyTurn ? `Dein Zug` : (current?.name || '?');
  if (badge) {
    badge.textContent = PHASE_NAMES[phase] || phase.toUpperCase();
    badge.className = `phase-badge phase-${phase}`;
  }
  if (hint) hint.textContent = isMyTurn ? (PHASE_HINTS[phase] || '') : `Warte auf ${current?.name}...`;

  // Stats
  const myPlayer = state.players.find(p => p.id === myPlayerId);
  if (myPlayer) {
    const myTerritories = Object.values(state.territories || {}).filter(t => t.owner === myPlayerId);
    const myTroops = myTerritories.reduce((s, t) => s + t.troops, 0);
    setText('statTerritories', myTerritories.length);
    setText('statTroops', myTroops);
    const toPlace = phase === 'setup' ? (myPlayer.troops || 0) : (myPlayer.troopsToPlace || 0);
    setText('statToPlace', toPlace);
  }

  // Show/hide action buttons
  const buttons = {
    endDraftBtn:   phase === 'draft' && isMyTurn,
    endAttackBtn:  phase === 'attack' && isMyTurn,
    skipFortifyBtn: phase === 'fortify' && isMyTurn,
    fortifyBtn:    false,
    attackBtn:     false,
    blitzBtn:      false,
    deployBtn:     false
  };

  for (const [id, show] of Object.entries(buttons)) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  }

  // Disable/enable end draft if troops remain
  const endDraftBtn = document.getElementById('endDraftBtn');
  if (endDraftBtn && myPlayer) {
    endDraftBtn.disabled = (myPlayer.troopsToPlace || 0) > 0;
    endDraftBtn.style.opacity = endDraftBtn.disabled ? '0.5' : '1';
    endDraftBtn.style.cursor = endDraftBtn.disabled ? 'not-allowed' : 'pointer';
  }
}

function updatePlayersOverview(state, myPlayerId) {
  const container = document.getElementById('playersOverview');
  if (!container) return;

  container.innerHTML = '';
  for (const player of state.players) {
    const isActive = state.players[state.currentPlayerIndex]?.id === player.id;
    const ownedCount = Object.values(state.territories || {}).filter(t => t.owner === player.id).length;

    const row = document.createElement('div');
    row.className = `player-row ${isActive ? 'active' : ''} ${player.eliminated ? 'eliminated' : ''}`;

    const dot = document.createElement('div');
    dot.className = 'player-color-dot';
    dot.style.background = player.color;

    const name = document.createElement('span');
    name.className = 'pname';
    name.textContent = player.name + (player.id === myPlayerId ? ' (Du)' : '') + (player.isAI ? ' 🤖' : '');

    const terr = document.createElement('span');
    terr.className = 'pterr';
    terr.textContent = player.eliminated ? 'Eliminiert' : `${ownedCount} Gebiete`;

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(terr);
    container.appendChild(row);
  }
}

function updateGameLog(log) {
  const logEl = document.getElementById('gameLog');
  if (!logEl) return;
  logEl.innerHTML = '';
  const entries = log.slice(0, 8);
  for (const entry of entries) {
    const li = document.createElement('li');
    li.textContent = entry.msg;
    if (entry.msg.includes('erobert')) li.classList.add('conquest');
    if (entry.msg.includes('---')) li.classList.add('round-start');
    logEl.appendChild(li);
  }
}

function updateCardsUI(hand, phase, isMyTurn, cardMode) {
  const section = document.getElementById('cardsSection');
  const countEl = document.getElementById('cardCount');
  const handEl = document.getElementById('cardsHand');
  const tradeBtn = document.getElementById('tradeCardsBtn');
  const hintEl = document.getElementById('cardsHint');

  if (!section) return;

  if (cardMode === 'none' || !hand) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  if (countEl) countEl.textContent = hand.length;

  if (!handEl) return;
  handEl.innerHTML = '';

  window._selectedCards = window._selectedCards || new Set();

  for (const card of hand) {
    const cardEl = document.createElement('div');
    const typeMap = { infantry: '🚶', cavalry: '🐎', artillery: '💣', wild: '⭐' };
    cardEl.className = `card ${card.type}`;
    cardEl.innerHTML = `<div class="card-icon">${typeMap[card.type] || '?'}</div><div>${card.territoryName?.slice(0, 8) || card.type}</div>`;
    cardEl.dataset.cardId = card.id;

    if (window._selectedCards.has(card.id)) cardEl.classList.add('selected');

    cardEl.addEventListener('click', () => {
      if (!isMyTurn || phase !== 'draft') return;
      if (window._selectedCards.has(card.id)) {
        window._selectedCards.delete(card.id);
        cardEl.classList.remove('selected');
      } else {
        window._selectedCards.add(card.id);
        cardEl.classList.add('selected');
      }
      updateTradeButton(hand, phase, isMyTurn, cardMode);
    });

    handEl.appendChild(cardEl);
  }

  updateTradeButton(hand, phase, isMyTurn, cardMode);

  const mustTrade = hand.length >= 5;
  if (hintEl) {
    hintEl.textContent = mustTrade ? '⚠ Du musst Karten einlösen!' : (hand.length >= 3 ? 'Wähle 3 passende Karten.' : '');
    hintEl.style.color = mustTrade ? 'var(--warning)' : '';
  }
}

function updateTradeButton(hand, phase, isMyTurn, cardMode) {
  const tradeBtn = document.getElementById('tradeCardsBtn');
  const tradeVal = document.getElementById('tradeValue');
  if (!tradeBtn) return;

  const selected = Array.from(window._selectedCards);
  const canTrade = isMyTurn && phase === 'draft' && selected.length === 3;
  tradeBtn.style.display = (isMyTurn && phase === 'draft' && hand.length >= 3) ? '' : 'none';
  tradeBtn.disabled = !canTrade;
  tradeBtn.style.opacity = canTrade ? '1' : '0.5';
  if (tradeVal) tradeVal.textContent = '?';
}

function getSelectedCardIds() {
  return Array.from(window._selectedCards || []);
}

function clearSelectedCards() {
  window._selectedCards = new Set();
  document.querySelectorAll('.card.selected').forEach(el => el.classList.remove('selected'));
}

function showGameOver(winner, stats) {
  const overlay = document.getElementById('gameOverOverlay');
  const title = document.getElementById('gameOverTitle');
  const winnerEl = document.getElementById('gameOverWinner');
  const tbody = document.getElementById('statsBody');

  if (!overlay) return;
  overlay.style.display = 'flex';

  title.textContent = '🏆 Sieg!';
  winnerEl.textContent = `${winner.name} hat gewonnen!`;
  winnerEl.style.color = winner.color;

  tbody.innerHTML = '';
  for (const p of stats) {
    const kd = p.troopsLost > 0 ? (p.troopsKilled / p.troopsLost).toFixed(1) : p.troopsKilled;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="color:${p.color}; font-weight:700">■</span> ${p.name}</td>
      <td>${p.territoriesOwned}</td>
      <td style="color:var(--success)">${p.battlesWon || 0}</td>
      <td style="color:var(--danger)">${p.battlesLost || 0}</td>
      <td>${kd}</td>
      <td>${p.cardsTraded || 0}</td>
    `;
    if (p.id === winner.id) tr.style.background = 'rgba(56,139,253,0.08)';
    tbody.appendChild(tr);
  }
}

function showTerritorySidebar(territory, terrState, owner, phase, isMyTurn, myPlayerId) {
  const section = document.getElementById('selectedTerrSection');
  if (!section) return;
  section.style.display = '';

  setText('selTerrName', territory.name);
  setText('selTerrOwner', owner ? owner.name : 'Neutral');
  setText('selTerrTroops', `${terrState.troops} Truppen`);
  setText('selTerrContinent', territory.continent);

  const ownerEl = document.getElementById('selTerrOwner');
  if (ownerEl && owner) ownerEl.style.color = owner.color;
}

function showDeployControl(max, callback) {
  const ctrl = document.getElementById('deployControl');
  const slider = document.getElementById('deploySlider');
  const count = document.getElementById('deployCount');
  const btn = document.getElementById('deployBtn');
  if (!ctrl) return;

  ctrl.style.display = '';
  slider.max = max;
  slider.min = 1;
  slider.value = 1;
  count.textContent = 1;

  slider.oninput = () => { count.textContent = slider.value; };
  document.getElementById('deployMinus').onclick = () => {
    if (slider.value > 1) { slider.value--; count.textContent = slider.value; }
  };
  document.getElementById('deployPlus').onclick = () => {
    if (slider.value < max) { slider.value++; count.textContent = slider.value; }
  };
  btn.onclick = () => callback(parseInt(slider.value));
}

function hideDeployControl() {
  const ctrl = document.getElementById('deployControl');
  if (ctrl) ctrl.style.display = 'none';
}

function hideTerritorySidebar() {
  const section = document.getElementById('selectedTerrSection');
  if (section) section.style.display = 'none';
  hideDeployControl();
  document.getElementById('winChanceArea').style.display = 'none';
}

function showAttackButtons(show, showBlitz = false) {
  const attackBtn = document.getElementById('attackBtn');
  const blitzBtn = document.getElementById('blitzBtn');
  if (attackBtn) attackBtn.style.display = show ? '' : 'none';
  if (blitzBtn) blitzBtn.style.display = (show && showBlitz) ? '' : 'none';
}

function showFortifyButton(show) {
  const btn = document.getElementById('fortifyBtn');
  if (btn) btn.style.display = show ? '' : 'none';
}

function showWinChanceArea(show) {
  const area = document.getElementById('winChanceArea');
  if (area) area.style.display = show ? '' : 'none';
}

function showDiceSection(show) {
  const section = document.getElementById('diceSection');
  if (section) section.style.display = show ? '' : 'none';
}

function showToast(msg, type = '', duration = 2500) {
  if (toastTimeout) clearTimeout(toastTimeout);
  let toast = document.getElementById('_toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = '_toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.style.opacity = '1';
  toastTimeout = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// Cards toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('cardsToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const panel = document.getElementById('cardsPanel');
      const arrow = document.getElementById('cardsArrow');
      if (!panel) return;
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : '';
      if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
    });
  }
});

// ── SPECIAL CARD UI ───────────────────────────────────────────────────────────

function showLastChanceOverlay() {
  const overlay = document.getElementById('lastChanceOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  setTimeout(() => { overlay.style.display = 'none'; }, 5000);
}

function updateSpecialCardUI(mySpecialCard, phase, isMyTurn) {
  const section = document.getElementById('specialCardSection');
  if (!section) return;
  if (!mySpecialCard || !isMyTurn) { section.style.display = 'none'; return; }
  section.style.display = '';
  const cardNames = { bomb: '☢️ Atombombe', fortress: '🛡️ Festung', blitzkrieg: '⚡ Blitzkrieg' };
  const btn = section.querySelector('.special-card-btn');
  if (btn) {
    btn.textContent = cardNames[mySpecialCard] || mySpecialCard;
    btn.dataset.cardType = mySpecialCard;
  }
}
