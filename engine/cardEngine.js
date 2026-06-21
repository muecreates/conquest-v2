const CARD_TYPES = { INFANTRY: 'infantry', CAVALRY: 'cavalry', ARTILLERY: 'artillery', WILD: 'wild' };
const CARD_MODES = { CLASSIC: 'classic', FIXED: 'fixed', NONE: 'none' };

const SET_VALUES = [4, 6, 8, 10, 12, 15];

function getSetValue(setNumber) {
  if (setNumber <= 0) return 0;
  if (setNumber <= 6) return SET_VALUES[setNumber - 1];
  return 15 + (setNumber - 6) * 5;
}

function createDeck(territories) {
  const cards = [];
  const types = [CARD_TYPES.INFANTRY, CARD_TYPES.CAVALRY, CARD_TYPES.ARTILLERY];
  territories.forEach((t, i) => {
    cards.push({ id: `card_${t.id}`, type: types[i % 3], territory: t.id, territoryName: t.name });
  });
  cards.push({ id: 'wild_1', type: CARD_TYPES.WILD, territory: null, territoryName: 'Wild' });
  cards.push({ id: 'wild_2', type: CARD_TYPES.WILD, territory: null, territoryName: 'Wild' });
  return shuffle(cards);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValidSet(cards) {
  if (cards.length !== 3) return false;
  const types = cards.map(c => c.type === CARD_TYPES.WILD ? 'wild' : c.type);
  const nonWild = types.filter(t => t !== 'wild');
  const wilds = types.filter(t => t === 'wild').length;

  if (wilds >= 2) return true;
  if (wilds === 1) {
    // 2 same type + wild = set
    if (nonWild[0] === nonWild[1]) return true;
    // 2 different + wild: only valid if they're all different (with wild filling the gap)
    return nonWild[0] !== nonWild[1];
  }
  // 0 wilds: all same or all different
  const unique = new Set(nonWild).size;
  return unique === 1 || unique === 3;
}

function findTradableSets(hand) {
  const sets = [];
  for (let i = 0; i < hand.length - 2; i++) {
    for (let j = i + 1; j < hand.length - 1; j++) {
      for (let k = j + 1; k < hand.length; k++) {
        const combo = [hand[i], hand[j], hand[k]];
        if (isValidSet(combo)) sets.push(combo);
      }
    }
  }
  return sets;
}

function mustTradeCards(hand) {
  return hand.length >= 5;
}

function canTradeCards(hand, phase) {
  return phase === 'draft' && hand.length >= 3 && findTradableSets(hand).length > 0;
}

function tradeCards(hand, cardIds, setNumber, mode, playerTerritories) {
  if (mode === CARD_MODES.NONE) return { success: false, error: 'Cards disabled' };

  const selected = hand.filter(c => cardIds.includes(c.id));
  if (selected.length !== 3) return { success: false, error: 'Must select exactly 3 cards' };
  if (!isValidSet(selected)) return { success: false, error: 'Invalid set' };

  let troops;
  if (mode === CARD_MODES.FIXED) {
    troops = 8;
  } else {
    troops = getSetValue(setNumber);
  }

  // Bonus: +2 if any traded card matches a territory the player owns
  let bonusTerritory = null;
  for (const card of selected) {
    if (card.territory && playerTerritories.includes(card.territory)) {
      bonusTerritory = card.territory;
      break;
    }
  }
  if (bonusTerritory) troops += 2;

  const remainingHand = hand.filter(c => !cardIds.includes(c.id));
  return { success: true, troops, bonusTerritory, remainingHand, tradedCards: selected };
}

module.exports = {
  CARD_TYPES,
  CARD_MODES,
  SET_VALUES,
  getSetValue,
  createDeck,
  shuffle,
  isValidSet,
  findTradableSets,
  mustTradeCards,
  canTradeCards,
  tradeCards
};
