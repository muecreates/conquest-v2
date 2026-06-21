const PLAYER_COLORS = ['#2d5c8e','#8e2d2d','#2d7843','#7a6018','#7a5018','#4a2d8e'];

const PRESETS = {
  blitz:     { combatMode:'blitz',   cardMode:'none',     victoryThreshold:40, territorySetup:'auto',  aiDifficulty:'medium', specialCards:false, lastChance:false, playerCount:2 },
  standard:  { combatMode:'classic', cardMode:'classic',  victoryThreshold:50, territorySetup:'auto',  aiDifficulty:'medium', specialCards:true,  lastChance:true,  playerCount:4 },
  klassisch: { combatMode:'classic', cardMode:'classic',  victoryThreshold:100,territorySetup:'draft', aiDifficulty:'hard',   specialCards:false, lastChance:false, playerCount:4 }
};

let selectedMap = 'koeln';
let currentPreset = 'standard';
let socket = null;
let mpRoomCode = null;
let mpPlayers = [];

const $ = id => document.getElementById(id);

// ── TOGGLE GROUPS ──────────────────────────────────────────────────────────

function getTgl(groupId) {
  const el = $(`${groupId}`);
  if (!el) return null;
  return el.querySelector('.tgl.active')?.dataset.val || null;
}

function setTgl(groupId, val) {
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
      currentPreset = null;
      document.querySelectorAll('.preset-btn').forEach(p => p.classList.remove('active'));
    });
  });
}

// ── PRESETS ────────────────────────────────────────────────────────────────

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  currentPreset = name;
  setTgl('combatMode', p.combatMode);
  setTgl('cardMode', p.cardMode);
  setTgl('victoryThreshold', p.victoryThreshold);
  setTgl('territorySetup', p.territorySetup);
  setTgl('aiLevel', p.aiDifficulty);
  setTgl('specialCards', String(p.specialCards));
  setTgl('lastChance', String(p.lastChance));
  setTgl('playerCount', p.playerCount);
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === name);
  });
}

// ── MAP CAROUSEL ───────────────────────────────────────────────────────────

function initMapCarousel() {
  document.querySelectorAll('.map-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.map-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedMap = card.dataset.map;
    });
  });
}

// ── SETTINGS BUILDER ───────────────────────────────────────────────────────

function buildSettings() {
  return {
    map: selectedMap,
    playerCount: parseInt(getTgl('playerCount') || '4'),
    aiDifficulty: getTgl('aiLevel') || 'medium',
    combatMode: getTgl('combatMode') || 'classic',
    cardMode: getTgl('cardMode') || 'classic',
    territorySetup: getTgl('territorySetup') || 'auto',
    victoryThreshold: parseInt(getTgl('victoryThreshold') || '50'),
    specialCards: getTgl('specialCards') === 'true',
    lastChance: getTgl('lastChance') === 'true',
    lastChanceTrigger: parseInt(getTgl('lastChanceTrigger') || '3'),
    continentBonuses: true
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
    renderMpPlayers();
    generateQR(data.roomCode);
  });

  socket.on('player_joined', data => {
    mpPlayers = data.players || [];
    renderMpPlayers();
    updateMpStartBtn();
  });

  socket.on('room_joined', data => {
    mpRoomCode = data.roomCode;
    mpPlayers = data.players || [];
    renderMpPlayers();
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

function renderMpPlayers() {
  const list = $('mpPlayerList');
  if (!list) return;
  list.innerHTML = '';
  (mpPlayers || []).forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'mp-player-row';
    row.innerHTML = `<span class="mp-player-dot" style="background:${PLAYER_COLORS[i] || '#555'}"></span>
      <span>${p.name}${p.isAI ? ' 🤖' : ''}</span>`;
    list.appendChild(row);
  });
  updateMpStartBtn();
}

function updateMpStartBtn() {
  const btn = $('mpStartBtn');
  if (btn) btn.disabled = (mpPlayers || []).length < 2;
}

function showCreateRoom() {
  initSocket();
  const name = $('playerName').value.trim() || 'Spieler 1';
  const settings = buildSettings();
  sessionStorage.setItem('playerName', name);
  sessionStorage.setItem('settings', JSON.stringify(settings));
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

  $('advToggle').addEventListener('click', () => {
    const panel = $('advPanel');
    const visible = panel.style.display !== 'none';
    panel.style.display = visible ? 'none' : '';
    $('advToggle').textContent = visible ? '▼ Erweiterte Einstellungen' : '▲ Erweiterte Einstellungen';
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

  $('mpAddAI').addEventListener('click', () => {
    if (socket && mpRoomCode) socket.emit('add_ai', { roomCode: mpRoomCode });
  });

  $('mpStartBtn').addEventListener('click', () => {
    if (socket && mpRoomCode) socket.emit('start_game', { roomCode: mpRoomCode });
  });

  $('joinCode').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  $('joinBtn').addEventListener('click', joinRoom);

  $('playerName').addEventListener('keydown', e => {
    if (e.key === 'Enter') startSingleplayer();
  });
});
