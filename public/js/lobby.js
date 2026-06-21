const PLAYER_COLORS = ['#2d5c8e','#8e2d2d','#2d7843','#7a6018','#7a5018','#4a2d8e'];

const PRESETS = {
  blitz:     { combatMode:'blitz',   cardMode:'none',     victoryThreshold:40,  territorySetup:'auto',  aiDifficulty:'medium', specialCards:false, lastChance:false, playerCount:3,  turnTimer:60 },
  standard:  { combatMode:'classic', cardMode:'classic',  victoryThreshold:50,  territorySetup:'auto',  aiDifficulty:'medium', specialCards:true,  lastChance:true,  playerCount:4,  turnTimer:60 },
  klassisch: { combatMode:'classic', cardMode:'classic',  victoryThreshold:100, territorySetup:'draft', aiDifficulty:'hard',   specialCards:false, lastChance:false, playerCount:4,  turnTimer:0  }
};

// Map base times (territory count × per-territory-factor)
const MAP_BASE_TIMES = {
  bikiniBottom:  { min: 10, max: 20 },
  koeln:         { min: 15, max: 25 },
  marbella:      { min: 15, max: 28 },
  sanandreas:    { min: 20, max: 35 },
  germany:       { min: 20, max: 35 },
  africa:        { min: 25, max: 45 },
  europe:        { min: 30, max: 55 },
  world:         { min: 40, max: 75 }
};

let selectedMap = 'koeln';
let currentPreset = 'standard';
let socket = null;
let mpRoomCode = null;
let mpPlayers = [];
let mpSlotConfig = []; // { type: 'human'|'bot', name: string }

const $ = id => document.getElementById(id);

// ── TOGGLE GROUPS ──────────────────────────────────────────────────────────

function getTgl(groupId) {
  const el = $(groupId);
  if (!el) return null;
  return el.querySelector('.tgl.active')?.dataset.val || null;
}

function setTgl(groupId, val, silent = false) {
  const group = $(groupId);
  if (!group) return;
  group.querySelectorAll('.tgl').forEach(b => {
    b.classList.toggle('active', b.dataset.val === String(val));
  });
}

function initToggleGroups() {
  document.querySelectorAll('.toggle-group').forEach(group => {
    group.addEventListener('click', e => {
      const btn = e.target.closest('.tgl');
      if (!btn) return;
      group.querySelectorAll('.tgl').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Deselect preset (user manually changed a setting)
      currentPreset = null;
      document.querySelectorAll('.preset-btn').forEach(p => p.classList.remove('active'));
      updateTimeEstimate();
    });
  });
}

// ── PRESETS ────────────────────────────────────────────────────────────────

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  currentPreset = name;
  setTgl('combatMode',       p.combatMode);
  setTgl('cardMode',         p.cardMode);
  setTgl('victoryThreshold', p.victoryThreshold);
  setTgl('territorySetup',   p.territorySetup);
  setTgl('aiLevel',          p.aiDifficulty);
  setTgl('specialCards',     String(p.specialCards));
  setTgl('lastChance',       String(p.lastChance));
  setTgl('playerCount',      p.playerCount);
  setTgl('turnTimer',        p.turnTimer);
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === name);
  });
  updateTimeEstimate();
}

// ── MAP CAROUSEL ───────────────────────────────────────────────────────────

function initMapCarousel() {
  document.querySelectorAll('.map-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.map-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedMap = card.dataset.map;
      updateTimeEstimate();
    });
  });
}

// ── TIME ESTIMATE (Step 8) ─────────────────────────────────────────────────

function updateTimeEstimate() {
  const el = $('timeEstimate');
  if (!el) return;

  const base = MAP_BASE_TIMES[selectedMap] || { min: 20, max: 45 };
  const players = parseInt(getTgl('playerCount') || '4');
  const cardMode = getTgl('cardMode') || 'classic';
  const setup = getTgl('territorySetup') || 'auto';
  const preset = currentPreset;

  let factor = 1.0;

  // Player count multiplier
  if (players >= 5) factor *= 1.3;
  else if (players >= 4) factor *= 1.1;
  else if (players <= 2) factor *= 0.8;

  // Cards add time
  if (cardMode === 'classic') factor *= 1.15;

  // Draft adds time
  if (setup === 'draft') factor *= 1.2;

  // Preset shortcuts
  if (preset === 'blitz') factor *= 0.7;
  else if (preset === 'klassisch') factor *= 1.4;

  const minTime = Math.round(base.min * factor);
  const maxTime = Math.round(base.max * factor);

  // Check if multiplayer with real players
  const isMultiplayer = document.getElementById('mpScreen')?.classList.contains('active') ||
                        (mpSlotConfig.filter(s => s.type === 'human').length > 1);

  let text = `ca. ${minTime}–${maxTime} Min`;
  if (isMultiplayer) {
    text += ' (abhängig von Spielergeschwindigkeit)';
  }

  el.textContent = text;
}

// ── SETTINGS BUILDER ───────────────────────────────────────────────────────

function buildSettings() {
  return {
    map: selectedMap,
    playerCount:       parseInt(getTgl('playerCount') || '4'),
    aiDifficulty:      getTgl('aiLevel') || 'medium',
    combatMode:        getTgl('combatMode') || 'classic',
    cardMode:          getTgl('cardMode') || 'classic',
    territorySetup:    getTgl('territorySetup') || 'auto',
    victoryThreshold:  parseInt(getTgl('victoryThreshold') || '50'),
    specialCards:      getTgl('specialCards') === 'true',
    lastChance:        getTgl('lastChance') === 'true',
    lastChanceTrigger: 3,
    turnTimer:         parseInt(getTgl('turnTimer') || '60'),
    continentBonuses:  true
  };
}

// ── SINGLEPLAYER ───────────────────────────────────────────────────────────

function startSingleplayer() {
  const name = $('playerName').value.trim() || 'Spieler 1';
  const settings = buildSettings();
  sessionStorage.setItem('playerName', name);
  sessionStorage.setItem('playerColor', PLAYER_COLORS[0]);
  sessionStorage.setItem('settings', JSON.stringify(settings));
  sessionStorage.setItem('mode', 'singleplayer');
  window.location.href = 'game.html';
}

// ── MULTIPLAYER LOBBY ──────────────────────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const el = $(id);
  if (el) { el.style.display = ''; el.classList.add('active'); }
}

function initSocket() {
  if (socket) return;
  socket = io();

  socket.on('room_created', data => {
    mpRoomCode = data.roomCode;
    $('mpRoomCode').textContent = data.roomCode;
    mpPlayers = data.players || [];
    renderMpSlots();
    generateQR(data.roomCode);
  });

  socket.on('player_joined', data => {
    mpPlayers = data.players || [];
    syncSlotsFromPlayers();
    renderMpSlots();
    updateMpStartBtn();
  });

  socket.on('room_joined', data => {
    mpRoomCode = data.roomCode;
    mpPlayers = data.players || [];
    syncSlotsFromPlayers();
    renderMpSlots();
    generateQR(data.roomCode);
  });

  socket.on('game_started', () => {
    sessionStorage.setItem('mode', 'multiplayer');
    sessionStorage.setItem('roomCode', mpRoomCode);
    window.location.href = 'game.html';
  });

  socket.on('error', data => alert(data.msg || 'Fehler'));
}

function generateQR(code) {
  const container = $('qrContainer');
  if (!container) return;
  container.innerHTML = '';
  const url = `${location.origin}/join/${code}`;
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, { text: url, width: 128, height: 128, colorDark: '#388bfd', colorLight: '#0d1117' });
  }
  const link = document.createElement('div');
  link.style.cssText = 'font-size:11px;color:#8b949e;margin-top:6px';
  link.textContent = url;
  container.appendChild(link);
}

// ── MP SLOTS (Step 11: Human/Bot per slot) ─────────────────────────────────

function initMpSlots() {
  const count = parseInt(getTgl('playerCount') || '4');
  mpSlotConfig = [];
  for (let i = 0; i < count; i++) {
    mpSlotConfig.push({ type: i === 0 ? 'human' : 'bot', name: i === 0 ? ($('playerName').value.trim() || 'Spieler 1') : `KI ${i}` });
  }
}

function syncSlotsFromPlayers() {
  // After players joined, sync slot display
  const count = Math.max(mpSlotConfig.length, mpPlayers.length);
  for (let i = 0; i < count; i++) {
    if (!mpSlotConfig[i]) mpSlotConfig[i] = { type: 'human', name: `Spieler ${i+1}` };
    if (mpPlayers[i]) {
      mpSlotConfig[i].type = mpPlayers[i].isAI ? 'bot' : 'human';
      mpSlotConfig[i].name = mpPlayers[i].name;
    }
  }
}

function renderMpSlots() {
  const container = $('mpSlots');
  if (!container) return;
  container.innerHTML = '';

  const count = parseInt(getTgl('playerCount') || '4');
  // Ensure slot config matches count
  while (mpSlotConfig.length < count) {
    mpSlotConfig.push({ type: 'bot', name: `KI ${mpSlotConfig.length}` });
  }
  mpSlotConfig.length = count;

  mpSlotConfig.forEach((slot, i) => {
    const row = document.createElement('div');
    row.className = 'mp-slot-row';
    const isHost = i === 0;
    const player = mpPlayers[i];
    const connected = player && !player.isAI;

    row.innerHTML = `
      <div class="slot-dot" style="background:${PLAYER_COLORS[i] || '#555'}"></div>
      <div class="slot-info">
        <span class="slot-name">${slot.name || (slot.type === 'human' ? `Spieler ${i+1}` : `Bot ${i+1}`)}</span>
        ${connected ? '<span class="slot-connected">✓ Verbunden</span>' : ''}
      </div>
      <div class="slot-type-toggle">
        ${isHost ? '<span class="slot-host-badge">HOST</span>' : `
          <button class="tgl ${slot.type === 'human' ? 'active' : ''}" data-slot="${i}" data-type="human">Mensch</button>
          <button class="tgl ${slot.type === 'bot' ? 'active' : ''}" data-slot="${i}" data-type="bot">Bot</button>
        `}
      </div>
    `;
    container.appendChild(row);
  });

  // Handle slot type changes
  container.querySelectorAll('[data-slot]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.slot);
      const type = btn.dataset.type;
      mpSlotConfig[idx].type = type;
      // If switching to bot, remove human player if present
      if (type === 'bot' && socket && mpRoomCode) {
        socket.emit('set_slot_type', { roomCode: mpRoomCode, slotIndex: idx, type: 'bot' });
      }
      renderMpSlots();
      syncBotsToServer();
    });
  });

  updateMpStartBtn();
}

function syncBotsToServer() {
  if (!socket || !mpRoomCode) return;
  const botSlots = mpSlotConfig.filter((s, i) => i > 0 && s.type === 'bot').length;
  // Re-sync: tell server how many bots we want
  socket.emit('set_bot_count', { roomCode: mpRoomCode, count: botSlots });
}

function updateMpStartBtn() {
  const btn = $('mpStartBtn');
  if (btn) btn.disabled = !mpRoomCode || (mpPlayers || []).length < 1;
}

function showCreateRoom() {
  initSocket();
  const name = $('playerName').value.trim() || 'Spieler 1';
  const settings = buildSettings();
  sessionStorage.setItem('playerName', name);
  sessionStorage.setItem('settings', JSON.stringify(settings));

  initMpSlots();
  renderMpSlots();
  socket.emit('create_mp_room', { playerName: name, settings });
}

function joinRoom() {
  initSocket();
  const code = $('joinCode').value.trim().toUpperCase();
  const name = $('joinName').value.trim() || 'Spieler 2';
  if (!code) return;
  sessionStorage.setItem('playerName', name);
  socket.emit('join_room', { code, playerName: name });
  mpRoomCode = code;
  sessionStorage.setItem('roomCode', code);
  sessionStorage.setItem('mode', 'multiplayer');
  window.location.href = 'game.html';
}

// ── INIT ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initToggleGroups();
  initMapCarousel();
  applyPreset('standard');

  document.querySelectorAll('.preset-btn').forEach(b => {
    b.addEventListener('click', () => applyPreset(b.dataset.preset));
  });

  $('spBtn').addEventListener('click', startSingleplayer);

  $('mpBtn').addEventListener('click', () => {
    showScreen('mpScreen');
    showCreateRoom();
  });

  $('mpBackBtn').addEventListener('click', () => showScreen('lobbyScreen'));

  $('tabCreate').addEventListener('click', () => {
    $('mpCreate').style.display = '';
    $('mpJoin').style.display = 'none';
    $('tabCreate').classList.add('active');
    $('tabJoin').classList.remove('active');
  });

  $('tabJoin').addEventListener('click', () => {
    $('mpCreate').style.display = 'none';
    $('mpJoin').style.display = '';
    $('tabJoin').classList.add('active');
    $('tabCreate').classList.remove('active');
  });

  $('mpStartBtn').addEventListener('click', () => {
    if (!socket || !mpRoomCode) return;
    // Add bots for bot slots before starting
    const botSlots = mpSlotConfig.filter((s, i) => i > 0 && s.type === 'bot');
    // Ensure correct number of bots in room
    socket.emit('sync_bots_and_start', {
      roomCode: mpRoomCode,
      botCount: botSlots.length,
      aiDifficulty: getTgl('aiLevel') || 'medium'
    });
  });

  $('joinCode').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  $('joinBtn').addEventListener('click', joinRoom);

  $('playerName').addEventListener('keydown', e => {
    if (e.key === 'Enter') startSingleplayer();
  });

  // Update slots when player count changes
  $('playerCount').addEventListener('click', () => {
    if (mpRoomCode) {
      initMpSlots();
      renderMpSlots();
    }
    updateTimeEstimate();
  });

  updateTimeEstimate();
});
