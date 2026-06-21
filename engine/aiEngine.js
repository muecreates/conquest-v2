const { getOverallWinChance, getAttackerDiceCount } = require('./combatEngine');
const { findTradableSets, mustTradeCards } = require('./cardEngine');
const { areConnected } = require('./maps/mapLoader');

function getAIAction(state, playerId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return null;
  const difficulty = player.aiDifficulty || 'medium';

  if (state.phase === 'setup') return getSetupAction(state, player, difficulty);
  if (state.phase === 'draft') return getDraftAction(state, player, difficulty);
  if (state.phase === 'attack') return getAttackAction(state, player, difficulty);
  if (state.phase === 'fortify') return getFortifyAction(state, player, difficulty);
  return null;
}

// ── SETUP ─────────────────────────────────────────────────────────────────────

function getSetupAction(state, player, difficulty) {
  if (player.troops <= 0) return null;
  const myTerritories = getMyTerritories(state, player.id);
  if (myTerritories.length === 0) return null;

  if (difficulty === 'easy') {
    const t = myTerritories[Math.floor(Math.random() * myTerritories.length)];
    return { type: 'deploy_setup', territoryId: t };
  }

  // Medium/Hard: reinforce border territories
  const border = myTerritories.filter(tid => hasThreat(state, tid, player.id));
  const target = border.length > 0 ? border[Math.floor(Math.random() * border.length)] : myTerritories[0];
  return { type: 'deploy_setup', territoryId: target };
}

// ── DRAFT ─────────────────────────────────────────────────────────────────────

function getDraftAction(state, player, difficulty) {
  // Must trade cards?
  if (mustTradeCards(player.hand)) {
    const sets = findTradableSets(player.hand);
    if (sets.length > 0) return { type: 'trade_cards', cardIds: sets[0].map(c => c.id) };
  }

  // Optionally trade if hard and beneficial
  if (difficulty === 'hard' && player.troopsToPlace <= 3) {
    const sets = findTradableSets(player.hand);
    if (sets.length > 0) return { type: 'trade_cards', cardIds: sets[0].map(c => c.id) };
  }

  if (player.troopsToPlace <= 0) {
    return { type: 'end_draft' };
  }

  const deployTarget = getBestDeployTarget(state, player, difficulty);
  if (!deployTarget) return { type: 'end_draft' };

  const count = difficulty === 'hard' ? Math.ceil(player.troopsToPlace / 2) : 1;
  return { type: 'deploy', territoryId: deployTarget, count: Math.min(count, player.troopsToPlace) };
}

function getBestDeployTarget(state, player, difficulty) {
  const myTerritories = getMyTerritories(state, player.id);
  if (myTerritories.length === 0) return null;

  if (difficulty === 'easy') {
    return myTerritories[Math.floor(Math.random() * myTerritories.length)];
  }

  if (difficulty === 'medium') {
    // Reinforce most threatened border territory
    let best = null, bestScore = -1;
    for (const tid of myTerritories) {
      const threat = getThreatScore(state, tid, player.id);
      if (threat > bestScore) { bestScore = threat; best = tid; }
    }
    return best || myTerritories[0];
  }

  // Hard: consider continent completion + defense
  let best = null, bestScore = -1;
  for (const tid of myTerritories) {
    let score = getThreatScore(state, tid, player.id);
    // Bonus for territories near continent completion
    score += getContinentPotential(state, tid, player.id) * 2;
    if (score > bestScore) { bestScore = score; best = tid; }
  }
  return best || myTerritories[0];
}

// ── ATTACK ────────────────────────────────────────────────────────────────────

function getAttackAction(state, player, difficulty) {
  const myTerritories = getMyTerritories(state, player.id);
  const attacks = getPossibleAttacks(state, player.id, myTerritories);

  if (attacks.length === 0 || difficulty === 'easy' && Math.random() < 0.3) {
    return { type: 'end_attack' };
  }

  const bestAttack = selectBestAttack(state, player, attacks, difficulty);
  if (!bestAttack) return { type: 'end_attack' };

  const from = state.territories[bestAttack.fromId];
  const to = state.territories[bestAttack.toId];

  const useBlitz = (state.settings.combatMode === 'blitz' || difficulty === 'hard') && from.troops >= 5 && to.troops <= from.troops * 0.6;
  return {
    type: useBlitz ? 'blitz_attack' : 'attack',
    fromId: bestAttack.fromId,
    toId: bestAttack.toId
  };
}

function getPossibleAttacks(state, playerId, myTerritories) {
  const attacks = [];
  for (const fromId of myTerritories) {
    if (state.territories[fromId].troops < 2) continue;
    const neighbors = state.adjacency[fromId] || new Set();
    for (const toId of neighbors) {
      if (state.territories[toId]?.owner !== playerId) {
        attacks.push({ fromId, toId });
      }
    }
  }
  return attacks;
}

function selectBestAttack(state, player, attacks, difficulty) {
  const MIN_WIN_CHANCE = { easy: 55, medium: 60, hard: 55 }[difficulty] || 60;

  let scored = attacks.filter(a => state.territories[a.fromId] && state.territories[a.toId]).map(a => {
    const from = state.territories[a.fromId];
    const to = state.territories[a.toId];
    const winChance = getOverallWinChance(from.troops, to.troops);
    let score = winChance;

    if (difficulty !== 'easy') {
      // Bonus for continent completion
      score += getContinentCompletionBonus(state, a.toId, player.id) * 20;
      // Bonus for eliminating weak players
      const defCount = getMyTerritories(state, to.owner).length;
      if (defCount <= 3) score += 15;
    }

    if (difficulty === 'hard') {
      // Block players close to winning
      const defOwned = getMyTerritories(state, to.owner).length;
      const total = state.mapData.territories.length;
      if (defOwned / total > 0.35) score += 25;
    }

    return { ...a, score, winChance };
  });

  scored = scored.filter(a => a.winChance >= MIN_WIN_CHANCE);
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);

  // Easy: sometimes random
  if (difficulty === 'easy') return scored[Math.floor(Math.random() * Math.min(3, scored.length))];
  return scored[0];
}

// ── FORTIFY ───────────────────────────────────────────────────────────────────

function getFortifyAction(state, player, difficulty) {
  if (difficulty === 'easy' && Math.random() < 0.6) return { type: 'skip_fortify' };

  const myTerritories = getMyTerritories(state, player.id);
  let best = null, bestScore = -Infinity;

  for (const fromId of myTerritories) {
    const from = state.territories[fromId];
    if (from.troops < 2) continue;
    const fromThreat = getThreatScore(state, fromId, player.id);

    for (const toId of myTerritories) {
      if (fromId === toId) continue;
      const toThreat = getThreatScore(state, toId, player.id);
      if (toThreat <= fromThreat) continue;

      if (!areConnected(fromId, toId, player.id, state.territories, state.adjacency)) continue;

      const score = toThreat - fromThreat;
      if (score > bestScore) {
        bestScore = score;
        best = { fromId, toId, count: Math.floor((from.troops - 1) / 2) + 1 };
      }
    }
  }

  if (!best || best.count < 1) return { type: 'skip_fortify' };
  return { type: 'fortify', fromId: best.fromId, toId: best.toId, count: Math.min(best.count, state.territories[best.fromId].troops - 1) };
}

// ── SCORING HELPERS ───────────────────────────────────────────────────────────

function getMyTerritories(state, playerId) {
  return Object.entries(state.territories)
    .filter(([, t]) => t.owner === playerId)
    .map(([id]) => id);
}

function hasThreat(state, territoryId, playerId) {
  const neighbors = state.adjacency[territoryId] || new Set();
  for (const nid of neighbors) {
    if (state.territories[nid]?.owner !== playerId) return true;
  }
  return false;
}

function getThreatScore(state, territoryId, playerId) {
  const neighbors = state.adjacency[territoryId] || new Set();
  let score = 0;
  for (const nid of neighbors) {
    const nt = state.territories[nid];
    if (nt && nt.owner !== playerId) {
      score += nt.troops;
    }
  }
  return score;
}

function getContinentPotential(state, territoryId, playerId) {
  const terrData = state.mapData.territories.find(t => t.id === territoryId);
  if (!terrData) return 0;
  const cont = state.mapData.continents[terrData.continent];
  if (!cont) return 0;
  const owned = cont.territories.filter(tid => state.territories[tid]?.owner === playerId).length;
  const total = cont.territories.length;
  return owned / total;
}

function getContinentCompletionBonus(state, territoryId, playerId) {
  const terrData = state.mapData.territories.find(t => t.id === territoryId);
  if (!terrData) return 0;
  const cont = state.mapData.continents[terrData.continent];
  if (!cont) return 0;
  const wouldOwn = cont.territories.filter(tid => {
    if (tid === territoryId) return true;
    return state.territories[tid]?.owner === playerId;
  }).length;
  return wouldOwn === cont.territories.length ? 1 : 0;
}

module.exports = { getAIAction };
