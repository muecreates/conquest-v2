const COMBAT_MODES = { CLASSIC: 'classic', BALANCED: 'balanced', AGGRESSIVE: 'aggressive', BLITZ: 'blitz' };

const WIN_PROBABILITIES = {
  '3v2': { attackerBoth: 0.3717, split: 0.3358, defenderBoth: 0.2926 },
  '3v1': { attacker: 0.6597, defender: 0.3403 },
  '2v2': { attackerBoth: 0.2276, split: 0.3241, defenderBoth: 0.4483 },
  '2v1': { attacker: 0.5787, defender: 0.4213 },
  '1v2': { attacker: 0.2546, defender: 0.7454 },
  '1v1': { attacker: 0.4167, defender: 0.5833 }
};

function rollDice(count) {
  const dice = [];
  for (let i = 0; i < count; i++) dice.push(Math.floor(Math.random() * 6) + 1);
  return dice.sort((a, b) => b - a);
}

function getAttackerDiceCount(attackerTroops) {
  if (attackerTroops >= 4) return 3;
  if (attackerTroops >= 3) return 2;
  if (attackerTroops >= 2) return 1;
  return 0;
}

function getDefenderDiceCount(defenderTroops) {
  return Math.min(defenderTroops, 2);
}

function resolveBattle(attackerDice, defenderDice, mode) {
  const pairs = Math.min(attackerDice.length, defenderDice.length);
  let attackerLosses = 0;
  let defenderLosses = 0;

  for (let i = 0; i < pairs; i++) {
    const aVal = attackerDice[i];
    const dVal = defenderDice[i];

    if (mode === COMBAT_MODES.AGGRESSIVE) {
      if (aVal >= dVal) defenderLosses++;
      else attackerLosses++;
    } else if (mode === COMBAT_MODES.BALANCED) {
      if (aVal > dVal) defenderLosses++;
      else if (aVal < dVal) attackerLosses++;
      else { attackerLosses++; defenderLosses++; }
    } else {
      // Classic + Blitz: defender wins ties
      if (aVal > dVal) defenderLosses++;
      else attackerLosses++;
    }
  }
  return { attackerLosses, defenderLosses };
}

function resolveCombat(attackerTroops, defenderTroops, mode = COMBAT_MODES.CLASSIC, blitzActive = false, defBonus = 0) {
  let numAttDice = getAttackerDiceCount(attackerTroops);
  if (blitzActive) numAttDice = Math.min(Math.max(numAttDice, 1), Math.min(attackerTroops - 1, 6));
  const numDefDice = Math.min(getDefenderDiceCount(defenderTroops) + defBonus, 3);

  if (numAttDice === 0) return null;

  const attackerDice = rollDice(numAttDice);
  const defenderDice = rollDice(numDefDice);
  const { attackerLosses, defenderLosses } = resolveBattle(attackerDice, defenderDice, mode);

  return {
    attackerDice,
    defenderDice,
    attackerLosses,
    defenderLosses,
    attackerTroopsAfter: attackerTroops - attackerLosses,
    defenderTroopsAfter: defenderTroops - defenderLosses
  };
}

function resolveBlitz(attackerTroops, defenderTroops, mode = COMBAT_MODES.CLASSIC) {
  const rounds = [];
  let att = attackerTroops;
  let def = defenderTroops;

  while (att > 1 && def > 0) {
    const result = resolveCombat(att, def, mode);
    if (!result) break;
    att = result.attackerTroopsAfter;
    def = result.defenderTroopsAfter;
    rounds.push({ ...result, attackerAfter: att, defenderAfter: def });
    if (rounds.length > 200) break; // safety cap
  }

  return {
    rounds,
    finalAttackerTroops: att,
    finalDefenderTroops: def,
    attackerWon: def === 0,
    totalRounds: rounds.length
  };
}

function getWinProbability(attackerTroops, defenderTroops) {
  const attDice = getAttackerDiceCount(attackerTroops);
  const defDice = getDefenderDiceCount(defenderTroops);
  const key = `${attDice}v${defDice}`;
  return WIN_PROBABILITIES[key] || null;
}

function getOverallWinChance(attackerTroops, defenderTroops) {
  // Approximate win chance using simulation (1000 blitz runs)
  if (attackerTroops <= 1) return 0;
  let wins = 0;
  const runs = 500;
  for (let i = 0; i < runs; i++) {
    let att = attackerTroops, def = defenderTroops;
    while (att > 1 && def > 0) {
      const r = resolveCombat(att, def, COMBAT_MODES.CLASSIC);
      if (!r) break;
      att = r.attackerTroopsAfter;
      def = r.defenderTroopsAfter;
    }
    if (def === 0) wins++;
  }
  return Math.round((wins / runs) * 100);
}

module.exports = {
  COMBAT_MODES,
  WIN_PROBABILITIES,
  rollDice,
  resolveCombat,
  resolveBlitz,
  getWinProbability,
  getOverallWinChance,
  getAttackerDiceCount,
  getDefenderDiceCount
};
