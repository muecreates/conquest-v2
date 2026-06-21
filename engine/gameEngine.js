const { getMap, buildAdjacencySet, areConnected } = require('./maps/mapLoader');
const { resolveCombat, resolveBlitz } = require('./combatEngine');
const { createDeck, tradeCards, CARD_MODES } = require('./cardEngine');
const { grantSpecialCard: _grantSpecialCard, applySpecialCard } = require('./specialCards');

const PHASES = { SETUP: 'setup', DRAFT: 'draft', ATTACK: 'attack', FORTIFY: 'fortify' };
const SETUP_TROOPS = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 };

function createGameState(settings, players) {
  const map = getMap(settings.map);
  const adjacency = buildAdjacencySet(map);
  const territories = {};
  for (const t of map.territories) territories[t.id] = { owner: null, troops: 0 };

  const playerCount = players.length;
  const startTroops = SETUP_TROOPS[playerCount] || 20;

  const gameState = {
    map: map.id, mapData: map, adjacency,
    phase: PHASES.SETUP, round: 0, currentPlayerIndex: 0,
    players: players.map((p, i) => ({
      id: p.id, name: p.name, color: p.color, isAI: p.isAI || false,
      aiDifficulty: p.aiDifficulty || 'medium',
      troops: startTroops, troopsToPlace: 0, hand: [],
      specialCard: null, bombUsed: false, lastChanceUsed: false,
      setsTraded: 0, territoriesConqueredThisTurn: false,
      stats: { territoriesConquered:0, troopsLost:0, troopsKilled:0, battlesWon:0, battlesLost:0, cardsTraded:0 }
    })),
    territories, deck: createDeck(map.territories), discardPile: [],
    settings, log: [], winner: null,
    setupTroopsPerPlayer: startTroops, setupTroopsRemaining: playerCount * startTroops
  };

  assignTerritories(gameState, settings.territorySetup);
  return gameState;
}

function assignTerritories(state, mode) {
  const tIds = state.mapData.territories.map(t => t.id);
  const shuffled = shuffle([...tIds]);
  const playerCount = state.players.length;

  if (mode === 'balanced' || mode === 'auto') {
    const contGroups = {};
    for (const t of state.mapData.territories) {
      if (!contGroups[t.continent]) contGroups[t.continent] = [];
      contGroups[t.continent].push(t.id);
    }
    let playerIdx = 0;
    for (const cont of Object.values(contGroups)) {
      for (const tid of shuffle(cont)) {
        state.territories[tid].owner = state.players[playerIdx % playerCount].id;
        state.territories[tid].troops = 1;
        playerIdx++;
      }
    }
  } else {
    for (let i = 0; i < shuffled.length; i++) {
      state.territories[shuffled[i]].owner = state.players[i % playerCount].id;
      state.territories[shuffled[i]].troops = 1;
    }
  }

  for (const p of state.players) {
    const owned = Object.values(state.territories).filter(t => t.owner === p.id).length;
    p.troops = Math.max(0, p.troops - owned);
  }
  if (!state.players.some(p => p.troops > 0)) startDraftPhase(state);
}

function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

// ── SETUP PHASE ──────────────────────────────────────────────────────────────

function deploySetup(state, playerId, territoryId) {
  if (state.phase !== PHASES.SETUP) return err('Not setup phase');
  const player = getPlayer(state, playerId);
  if (!player) return err('Player not found');
  if (getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  if (player.troops <= 0) return err('No troops left');
  const terr = state.territories[territoryId];
  if (!terr || terr.owner !== playerId) return err('Not your territory');

  terr.troops++;
  player.troops--;
  addLog(state, `${player.name} platziert in ${getTerritoryName(state, territoryId)}`);

  if (!state.players.some(p => p.troops > 0)) {
    startDraftPhase(state);
  } else {
    let next = (state.currentPlayerIndex + 1) % state.players.length, s = 0;
    while (state.players[next].troops <= 0 && s++ < state.players.length) next = (next + 1) % state.players.length;
    state.currentPlayerIndex = next;
  }
  return ok();
}

// ── DRAFT PHASE ──────────────────────────────────────────────────────────────

function startDraftPhase(state) {
  state.phase = PHASES.DRAFT;
  state.round++;
  const player = getCurrentPlayer(state);
  player.troopsToPlace = calculateDraftTroops(state, player);
  player.territoriesConqueredThisTurn = false;
  addLog(state, `--- Runde ${state.round}: ${player.name}s Zug ---`);
  addLog(state, `${player.name} erhält ${player.troopsToPlace} Truppen`);
  grantSpecialCard(state, player);
}

function grantSpecialCard(state, player) {
  if (!state.settings.specialCards) return;
  const c = _grantSpecialCard(player, state.round);
  if (c) addLog(state, `${player.name} erhält Spezialkarte: ${c}`);
}

function calculateDraftTroops(state, player) {
  const owned = Object.values(state.territories).filter(t => t.owner === player.id).length;
  let troops = Math.max(3, Math.floor(owned / 3));
  if (state.settings.continentBonuses !== false) {
    for (const [, cont] of Object.entries(state.mapData.continents)) {
      if (!cont.territories) continue;
      const ownsAll = cont.territories.every(tid => state.territories[tid]?.owner === player.id);
      if (ownsAll) troops += cont.bonus;
    }
  }
  return troops;
}

function deployTroop(state, playerId, territoryId, count = 1) {
  if (state.phase !== PHASES.DRAFT) return err('Not draft phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  if (count <= 0 || count > player.troopsToPlace) return err('Invalid count');
  const terr = state.territories[territoryId];
  if (!terr || terr.owner !== playerId) return err('Not your territory');
  terr.troops += count;
  player.troopsToPlace -= count;
  addLog(state, `${player.name} verstärkt ${getTerritoryName(state, territoryId)} (+${count})`);
  return ok();
}

function handleTradeCards(state, playerId, cardIds) {
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  if (state.phase !== PHASES.DRAFT) return err('Not draft phase');
  if (state.settings.cardMode === CARD_MODES.NONE) return err('Cards disabled');

  const playerTerritories = Object.entries(state.territories)
    .filter(([, t]) => t.owner === playerId).map(([id]) => id);
  const result = tradeCards(player.hand, cardIds, player.setsTraded + 1, state.settings.cardMode, playerTerritories);
  if (!result.success) return err(result.error);

  player.hand = result.remainingHand;
  player.troopsToPlace += result.troops;
  player.setsTraded++;
  player.stats.cardsTraded++;
  state.discardPile.push(...result.tradedCards);
  addLog(state, `${player.name} tauscht Karten → +${result.troops} Truppen`);
  return ok({ troops: result.troops, bonusTerritory: result.bonusTerritory });
}

// ── ATTACK PHASE ─────────────────────────────────────────────────────────────

function startAttackPhase(state, playerId) {
  if (state.phase !== PHASES.DRAFT) return err('Not draft phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  if (player.troopsToPlace > 0) return err('Must place all troops first');
  state.phase = PHASES.ATTACK;
  return ok();
}

function attack(state, playerId, fromId, toId) {
  if (state.phase !== PHASES.ATTACK) return err('Not attack phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  const from = state.territories[fromId];
  const to = state.territories[toId];
  if (!from || !to) return err('Territory not found');
  if (from.owner !== playerId) return err('Not your territory');
  if (to.owner === playerId) return err('Cannot attack own territory');

  const minTroops = (state.settings.lastChance && player.lastChanceActive) ? 1 : 2;
  if (from.troops < minTroops) return err('Need at least 2 troops to attack');
  if (!isAdjacent(state, fromId, toId)) return err('Not adjacent');

  const defBonus = to.fortified ? 3 : 0;
  const result = resolveCombat(from.troops, to.troops, state.settings.combatMode, player.blitzActive, defBonus);
  if (!result) return err('Cannot attack');

  const defender = getPlayer(state, to.owner);
  from.troops = result.attackerTroopsAfter;
  to.troops = result.defenderTroopsAfter;
  if (to.fortified) delete to.fortified;
  if (player.blitzActive) player.blitzActive = false;

  player.stats.troopsLost += result.attackerLosses;
  if (defender) defender.stats.troopsLost += result.defenderLosses;
  player.stats.troopsKilled += result.defenderLosses;

  let conquered = false;
  if (to.troops === 0) {
    conquered = true;
    const advance = from.troops - 1;
    to.owner = playerId;
    to.troops = advance;
    from.troops = 1;
    player.stats.territoriesConquered++;
    player.stats.battlesWon++;
    player.territoriesConqueredThisTurn = true;
    if (defender) defender.stats.battlesLost++;
    addLog(state, `${player.name} erobert ${getTerritoryName(state, toId)}!`);
    checkEliminated(state, defender, player);
  } else {
    if (result.attackerLosses > result.defenderLosses) player.stats.battlesLost++;
    else player.stats.battlesWon++;
    addLog(state, `${player.name} greift ${getTerritoryName(state, toId)} an → A:-${result.attackerLosses} V:-${result.defenderLosses}`);
  }

  const lastChance = checkLastChance(state, player);
  const winnerCheck = checkWinCondition(state);
  return ok({ ...result, conquered, winner: winnerCheck, lastChance });
}

function blitzAttack(state, playerId, fromId, toId) {
  if (state.phase !== PHASES.ATTACK) return err('Not attack phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  const from = state.territories[fromId];
  const to = state.territories[toId];
  if (!from || !to || from.owner !== playerId || to.owner === playerId) return err('Invalid attack');
  if (from.troops < 2) return err('Need at least 2 troops');
  if (!isAdjacent(state, fromId, toId)) return err('Not adjacent');

  const result = resolveBlitz(from.troops, to.troops, state.settings.combatMode);
  const defender = getPlayer(state, to.owner);
  const attLosses = from.troops - result.finalAttackerTroops;
  const defLosses = to.troops - result.finalDefenderTroops;
  from.troops = result.finalAttackerTroops;
  to.troops = result.finalDefenderTroops;

  player.stats.troopsLost += attLosses;
  if (defender) defender.stats.troopsLost += defLosses;
  player.stats.troopsKilled += defLosses;

  let conquered = false;
  if (result.attackerWon) {
    conquered = true;
    const advance = from.troops - 1;
    to.owner = playerId;
    to.troops = advance;
    from.troops = 1;
    player.stats.territoriesConquered++;
    player.stats.battlesWon++;
    player.territoriesConqueredThisTurn = true;
    if (defender) defender.stats.battlesLost++;
    addLog(state, `${player.name} blitzt ${getTerritoryName(state, toId)}! (${result.totalRounds} Runden)`);
    checkEliminated(state, defender, player);
  } else {
    player.stats.battlesLost++;
    addLog(state, `${player.name}s Blitz auf ${getTerritoryName(state, toId)} scheitert`);
  }

  const winnerCheck = checkWinCondition(state);
  return ok({ ...result, attLosses, defLosses, conquered, winner: winnerCheck });
}

// ── SPECIAL CARDS ────────────────────────────────────────────────────────────

function useSpecialCard(state, playerId, cardType, targetId) {
  const player = getPlayer(state, playerId);
  if (!player) return err('Player not found');
  if (state.phase !== PHASES.ATTACK && state.phase !== PHASES.DRAFT) return err('Wrong phase');
  const result = applySpecialCard(state, playerId, cardType, targetId);
  if (!result.success) return err(result.error);
  return ok();
}

// ── FORTIFY PHASE ─────────────────────────────────────────────────────────────

function startFortifyPhase(state, playerId) {
  if (state.phase !== PHASES.ATTACK) return err('Not attack phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  state.phase = PHASES.FORTIFY;
  return ok();
}

function fortify(state, playerId, fromId, toId, count) {
  if (state.phase !== PHASES.FORTIFY) return err('Not fortify phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  const from = state.territories[fromId];
  const to = state.territories[toId];
  if (!from || !to) return err('Territory not found');
  if (from.owner !== playerId || to.owner !== playerId) return err('Must own both territories');
  if (count < 1 || count >= from.troops) return err('Invalid count');
  if (!areConnected(fromId, toId, playerId, state.territories, state.adjacency)) {
    return err('Territories not connected through your network');
  }
  from.troops -= count;
  to.troops += count;
  addLog(state, `${player.name} verschiebt ${count} von ${getTerritoryName(state, fromId)} nach ${getTerritoryName(state, toId)}`);
  endTurn(state);
  return ok();
}

function skipFortify(state, playerId) {
  if (state.phase !== PHASES.FORTIFY && state.phase !== PHASES.ATTACK) return err('Invalid phase');
  const player = getPlayer(state, playerId);
  if (!player || getCurrentPlayer(state).id !== playerId) return err('Not your turn');
  endTurn(state);
  return ok();
}

function endTurn(state) {
  const player = getCurrentPlayer(state);
  if (player.territoriesConqueredThisTurn && state.settings.cardMode !== CARD_MODES.NONE) {
    if (!state.deck.length) { state.deck = [...state.discardPile]; state.discardPile = []; shuffle(state.deck); }
    if (state.deck.length) player.hand.push(state.deck.pop());
  }
  let next = (state.currentPlayerIndex + 1) % state.players.length, att = 0;
  while (state.players[next].eliminated && att++ < state.players.length) next = (next + 1) % state.players.length;
  state.currentPlayerIndex = next;
  startDraftPhase(state);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function checkEliminated(state, eliminated, conqueror) {
  if (!eliminated) return;
  if (Object.values(state.territories).some(t => t.owner === eliminated.id)) return;
  eliminated.eliminated = true;
  addLog(state, `${eliminated.name} wurde eliminiert!`);
  conqueror.hand.push(...eliminated.hand);
  eliminated.hand = [];
}

function checkLastChance(state, player) {
  if (!state.settings.lastChance || player.lastChanceUsed) return false;
  const trigger = state.settings.lastChanceTrigger || 3;
  const owned = Object.values(state.territories).filter(t => t.owner === player.id).length;
  if (owned <= trigger) {
    player.lastChanceUsed = true;
    player.lastChanceActive = true;
    _grantSpecialCard(player, state.round, true);
    addLog(state, `💀 ${player.name} kämpft um alles! (Letzte Chance)`);
    return true;
  }
  return false;
}

function checkWinCondition(state) {
  const { settings, mapData } = state;
  const totalTerritories = mapData.territories.length;
  const threshold = settings.victoryThreshold
    ? settings.victoryThreshold / 100
    : (settings.gameSpeed === 'short' ? 0.5 : settings.gameSpeed === 'blitz' ? 0.4 : 1.0);

  const activePlayers = state.players.filter(p => !p.eliminated);
  if (activePlayers.length === 1) {
    state.winner = activePlayers[0].id;
    state.phase = 'gameover';
    return activePlayers[0];
  }
  if (threshold < 1.0) {
    for (const player of activePlayers) {
      const owned = Object.values(state.territories).filter(t => t.owner === player.id).length;
      if (owned >= totalTerritories * threshold) {
        state.winner = player.id;
        state.phase = 'gameover';
        return player;
      }
    }
  }
  return null;
}

function isAdjacent(state, fromId, toId) { return state.adjacency[fromId]?.has(toId) || false; }
function getPlayer(state, playerId) { return state.players.find(p => p.id === playerId) || null; }
function getCurrentPlayer(state) { return state.players[state.currentPlayerIndex]; }
function getTerritoryName(state, id) { return state.mapData.territories.find(t => t.id === id)?.name || id; }
function addLog(state, msg) { state.log.unshift({ msg, round: state.round }); if (state.log.length > 50) state.log.pop(); }
function ok(data = {}) { return { success: true, ...data }; }
function err(msg) { return { success: false, error: msg }; }

function getPublicState(state) {
  const { adjacency, deck, ...pub } = state;
  pub.players = pub.players.map(({ hand, ...rest }) => ({ ...rest, hand, handSize: (hand || []).length }));
  return { ...pub, deckSize: state.deck.length };
}

module.exports = {
  PHASES, createGameState, deploySetup, deployTroop, handleTradeCards,
  startAttackPhase, attack, blitzAttack, startFortifyPhase, fortify, skipFortify,
  getCurrentPlayer, getPlayer, checkWinCondition, getPublicState, calculateDraftTroops,
  useSpecialCard
};
