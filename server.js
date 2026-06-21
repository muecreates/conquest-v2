const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const {
  createGameState, deploySetup, deployTroop, handleTradeCards,
  startAttackPhase, attack, blitzAttack, startFortifyPhase,
  fortify, skipFortify, getCurrentPlayer, getPlayer, getPublicState,
  useSpecialCard, PHASES
} = require('./engine/gameEngine');
const { getAIAction } = require('./engine/aiEngine');
const { getAvailableMaps } = require('./engine/maps/mapLoader');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/maps', (_, res) => res.json(getAvailableMaps()));
app.get('/health', (_, res) => res.json({ status: 'ok', version: '2.0.0' }));

// Map thumbnail SVGs (miniaturized outlines)
app.get('/api/map-thumbs', (_, res) => {
  const { getMap } = require('./engine/maps/mapLoader');
  const maps = ['world','europe','africa','germany','koeln','marbella','sanandreas','bikiniBottom'];
  const thumbs = {};
  for (const id of maps) {
    try {
      const map = getMap(id);
      thumbs[id] = buildThumbSVG(map);
    } catch(e) { thumbs[id] = ''; }
  }
  res.json(thumbs);
});

function buildThumbSVG(map) {
  const vb = (map.viewBox || '0 0 960 600').split(' ');
  const vW = parseFloat(vb[2]) || 960;
  const vH = parseFloat(vb[3]) || 600;
  const W = 60, H = 40;
  const contColors = {};
  for (const [id, c] of Object.entries(map.continents || {})) {
    for (const tid of (c.territories || [])) contColors[tid] = c.color || '#4a5568';
  }

  // Use simplified approach: just circles at territory label positions
  // For small maps (<20 territories), try to use paths but with heavy simplification
  const terrs = map.territories;
  let content = '';

  if (terrs.length <= 16) {
    // Short paths: take first 30 coords only
    content = terrs.map(t => {
      const d = t.svgPath || t.d || '';
      if (!d) return '';
      // Take only the first 200 chars of path (rough shape)
      const shortD = d.length > 300 ? d.substring(0, 300).replace(/\s[LlCcQqAa][^MLZ]*$/, ' Z') : d;
      const color = contColors[t.id] || '#4a5568';
      return `<path d="${shortD}" fill="${color}" fill-opacity="0.75" stroke="#0a1628" stroke-width="${vW/150}"/>`;
    }).join('');
  } else {
    // Large maps: dots only
    const r = Math.max(4, vW / 80);
    content = terrs.map(t => {
      const color = contColors[t.id] || '#4a5568';
      return `<circle cx="${t.labelX}" cy="${t.labelY}" r="${r}" fill="${color}" fill-opacity="0.85"/>`;
    }).join('');
  }

  return `<svg viewBox="${vb[0]} ${vb[1]} ${vW} ${vH}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;border-radius:3px;background:#0a1628">${content}</svg>`;
}

const rooms = new Map();
const PLAYER_COLORS = ['#2d5c8e','#8e2d2d','#2d7843','#7a6018','#7a5018','#4a2d8e'];
const AI_NAMES = ['Alpha','Bravo','Charlie','Delta','Echo','Foxtrot'];

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getRoom(code) { return rooms.get(code); }

function broadcastState(room) {
  const pub = getPublicState(room.gameState);
  for (const p of room.players) {
    if (!p.socketId) continue;
    const playerData = pub.players.find(pl => pl.id === p.id);
    io.to(p.socketId).emit('state_update', {
      ...pub, myPlayerId: p.id,
      myHand: playerData?.hand || [],
      mySpecialCard: playerData?.specialCard || null
    });
  }
}

function scheduleAI(room) {
  if (!room.gameState || room.gameState.phase === 'gameover') return;
  const current = getCurrentPlayer(room.gameState);
  if (!current?.isAI) return;
  setTimeout(() => processAITurn(room), 600 + Math.random() * 400);
}

function processAITurn(room) {
  const state = room.gameState;
  if (!state || state.phase === 'gameover') return;
  const current = getCurrentPlayer(state);
  if (!current?.isAI) return;

  const action = getAIAction(state, current.id);
  if (!action) return;

  let result;
  switch (action.type) {
    case 'deploy_setup': result = deploySetup(state, current.id, action.territoryId); break;
    case 'trade_cards':  result = handleTradeCards(state, current.id, action.cardIds); break;
    case 'deploy':       result = deployTroop(state, current.id, action.territoryId, action.count); break;
    case 'end_draft':    result = startAttackPhase(state, current.id); break;
    case 'attack':
      result = attack(state, current.id, action.fromId, action.toId);
      if (result.success && result.combat_result) io.to(room.code).emit('combat_result', result);
      break;
    case 'blitz_attack': result = blitzAttack(state, current.id, action.fromId, action.toId); break;
    case 'end_attack':
      result = startFortifyPhase(state, current.id);
      if (result.success) result = skipFortify(state, current.id);
      break;
    case 'fortify':      result = fortify(state, current.id, action.fromId, action.toId, action.count); break;
    case 'skip_fortify': result = skipFortify(state, current.id); break;
    default: return;
  }

  if (state.phase === 'gameover') {
    io.to(room.code).emit('game_over', { winner: getPlayer(state, state.winner), stats: buildStats(state) });
  }
  broadcastState(room);
  if (state.phase !== 'gameover') {
    scheduleAI(room);
    scheduleTurnTimer(room);
  }
}

function buildStats(state) {
  return state.players.map(p => ({
    id: p.id, name: p.name, color: p.color,
    ...p.stats, survived: !p.eliminated,
    territoriesOwned: Object.values(state.territories).filter(t => t.owner === p.id).length
  }));
}

function startGameInRoom(room) {
  room.gameState = createGameState(room.settings, room.players);
  room.turnTimerHandle = null;
  broadcastState(room);
  io.to(room.code).emit('game_started', { roomCode: room.code });
  scheduleAI(room);
  scheduleTurnTimer(room);
}

function scheduleTurnTimer(room) {
  if (room.turnTimerHandle) { clearTimeout(room.turnTimerHandle); room.turnTimerHandle = null; }
  const timerSec = room.settings?.turnTimer || 0;
  if (!timerSec || !room.gameState || room.gameState.phase === 'gameover') return;
  const current = getCurrentPlayer(room.gameState);
  if (!current || current.isAI) return;

  const deadlineMs = timerSec * 1000;
  room.turnTimerDeadline = Date.now() + deadlineMs;
  io.to(room.code).emit('turn_timer', { seconds: timerSec, playerId: current.id });

  room.turnTimerHandle = setTimeout(() => {
    const state = room.gameState;
    if (!state || state.phase === 'gameover') return;
    const cp = getCurrentPlayer(state);
    if (!cp || cp.isAI || cp.id !== current.id) return;
    // Auto-finish turn: deploy all remaining to strongest border territory, skip attack
    autoFinishTurn(room, cp.id);
  }, deadlineMs);
}

function autoFinishTurn(room, playerId) {
  const state = room.gameState;
  // Deploy remaining to strongest own border territory
  if (state.phase === 'setup' || state.phase === 'reinforce') {
    const ownTerrs = Object.entries(state.territories)
      .filter(([, t]) => t.owner === playerId)
      .map(([id, t]) => ({ id, troops: t.troops }))
      .sort((a, b) => b.troops - a.troops);
    if (ownTerrs.length > 0) {
      const toPlace = state.players.find(p => p.id === playerId)?.troopsToPlace || 0;
      if (toPlace > 0) deployTroop(state, playerId, ownTerrs[0].id, toPlace);
    }
  }
  // Skip to end of turn
  let r = startAttackPhase(state, playerId);
  if (r?.success) {
    r = startFortifyPhase(state, playerId);
    if (r?.success) skipFortify(state, playerId);
    else skipFortify(state, playerId);
  }
  io.to(room.code).emit('turn_timeout', { playerId });
  if (state.phase === 'gameover') {
    io.to(room.code).emit('game_over', { winner: getPlayer(state, state.winner), stats: buildStats(state) });
  }
  broadcastState(room);
  scheduleAI(room);
  scheduleTurnTimer(room);
}

io.on('connection', (socket) => {

  // Single-player / classic create_room
  socket.on('create_room', ({ playerName, settings }) => {
    let code = genCode();
    while (rooms.has(code)) code = genCode();

    const playerCount = Math.max(2, Math.min(6, settings.playerCount || 4));
    const humanPlayer = {
      id: `p_${socket.id}`, name: playerName || 'Spieler 1',
      color: PLAYER_COLORS[0], isAI: false, socketId: socket.id
    };
    const players = [humanPlayer];
    for (let i = 1; i < playerCount; i++) {
      players.push({
        id: `ai_${i}`, name: `KI ${AI_NAMES[i - 1]}`,
        color: PLAYER_COLORS[i], isAI: true,
        aiDifficulty: settings.aiDifficulty || 'medium', socketId: null
      });
    }

    const room = { code, players, settings, isMultiplayer: false, gameState: null, hostId: socket.id };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room_joined', { roomCode: code, players: players.map(p => ({ id: p.id, name: p.name, color: p.color, isAI: p.isAI })) });
    startGameInRoom(room);
  });

  // Multiplayer: host creates room without starting
  socket.on('create_mp_room', ({ playerName, settings }) => {
    let code = genCode();
    while (rooms.has(code)) code = genCode();

    const humanPlayer = {
      id: `p_${socket.id}`, name: playerName || 'Spieler 1',
      color: PLAYER_COLORS[0], isAI: false, socketId: socket.id
    };
    const room = { code, players: [humanPlayer], settings, isMultiplayer: true, gameState: null, hostId: socket.id };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room_created', { roomCode: code, players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, isAI: p.isAI })) });
  });

  // Add AI to multiplayer room
  socket.on('add_ai', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || !room.isMultiplayer || room.hostId !== socket.id) return;
    if (room.players.length >= 6) return;
    const i = room.players.length;
    room.players.push({
      id: `ai_${i}`, name: `KI ${AI_NAMES[i - 1] || i}`,
      color: PLAYER_COLORS[i] || '#888', isAI: true,
      aiDifficulty: room.settings.aiDifficulty || 'medium', socketId: null
    });
    io.to(roomCode).emit('player_joined', { players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, isAI: p.isAI })) });
  });

  // Sync bots and start (new lobby: host sets exact bot count then starts)
  socket.on('sync_bots_and_start', ({ roomCode, botCount, aiDifficulty }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    // Remove existing AI players, keep humans
    room.players = room.players.filter(p => !p.isAI);
    // Add requested number of bots
    const n = Math.max(0, Math.min(botCount, 6 - room.players.length));
    for (let i = 0; i < n; i++) {
      const idx = room.players.length;
      room.players.push({
        id: `ai_${idx}`, name: `KI ${AI_NAMES[idx - 1] || idx}`,
        color: PLAYER_COLORS[idx] || '#888', isAI: true,
        aiDifficulty: aiDifficulty || 'medium', socketId: null
      });
    }
    startGameInRoom(room);
  });

  // Host starts multiplayer game
  socket.on('start_game', ({ roomCode }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostId !== socket.id) return;
    startGameInRoom(room);
  });

  // Player joins room
  socket.on('join_room', ({ code, playerName }) => {
    const room = getRoom(code);
    if (!room) return socket.emit('error', { msg: 'Raum nicht gefunden' });
    socket.join(code);

    // If multiplayer waiting room
    if (room.isMultiplayer && !room.gameState) {
      const i = room.players.length;
      if (i < 6) {
        const newPlayer = {
          id: `p_${socket.id}`, name: playerName || `Spieler ${i + 1}`,
          color: PLAYER_COLORS[i] || '#888', isAI: false, socketId: socket.id
        };
        room.players.push(newPlayer);
        io.to(code).emit('player_joined', { players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, isAI: p.isAI })) });
      }
      socket.emit('room_joined', { roomCode: code, players: room.players.map(p => ({ id: p.id, name: p.name, color: p.color, isAI: p.isAI })) });
    } else if (room.gameState) {
      const humanPlayer = room.players.find(p => !p.isAI && !p.socketId);
      if (humanPlayer) humanPlayer.socketId = socket.id;
      socket.emit('game_started', { roomCode: code });
      broadcastState(room);
    }
  });

  // Game actions
  socket.on('game_action', ({ roomCode, type, payload }) => {
    const room = getRoom(roomCode);
    if (!room || !room.gameState) return;
    const state = room.gameState;
    const humanPlayer = room.players.find(p => p.socketId === socket.id);
    if (!humanPlayer) return;
    const playerId = humanPlayer.id;

    let result;
    switch (type) {
      case 'deploy_setup': result = deploySetup(state, playerId, payload.territoryId); break;
      case 'deploy':       result = deployTroop(state, playerId, payload.territoryId, payload.count || 1); break;
      case 'trade_cards':  result = handleTradeCards(state, playerId, payload.cardIds); break;
      case 'end_draft':    result = startAttackPhase(state, playerId); break;
      case 'attack':
        result = attack(state, playerId, payload.fromId, payload.toId);
        if (result.success) socket.emit('combat_result', result);
        break;
      case 'blitz_attack':
        result = blitzAttack(state, playerId, payload.fromId, payload.toId);
        if (result.success) socket.emit('combat_result', result);
        break;
      case 'start_fortify': result = startFortifyPhase(state, playerId); break;
      case 'fortify':      result = fortify(state, playerId, payload.fromId, payload.toId, payload.count); break;
      case 'skip_fortify': result = skipFortify(state, playerId); break;
      case 'special_card': result = useSpecialCard(state, playerId, payload.cardType, payload.targetId); break;
      default: result = { success: false, error: 'Unbekannte Aktion' };
    }

    if (!result?.success) {
      socket.emit('action_error', { error: result?.error || 'Aktion fehlgeschlagen' });
      return;
    }

    if (state.phase === 'gameover') {
      io.to(roomCode).emit('game_over', { winner: getPlayer(state, state.winner), stats: buildStats(state) });
    }
    if (result.lastChance) {
      socket.emit('last_chance', { player: humanPlayer });
    }
    broadcastState(room);
    scheduleAI(room);
    scheduleTurnTimer(room);
  });

  socket.on('disconnect', () => {
    for (const [, room] of rooms) {
      const player = room.players.find(p => p.socketId === socket.id);
      if (player) { player.socketId = null; break; }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Conquest v2 running on http://localhost:${PORT}`));
