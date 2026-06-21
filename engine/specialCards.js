const SPECIAL_CARDS = ['bomb', 'fortress', 'blitzkrieg'];

function grantSpecialCard(player, round, forceGrant = false) {
  if (player.specialCard) return;
  if (!forceGrant && round % 5 !== 0) return;
  player.specialCard = SPECIAL_CARDS[Math.floor(Math.random() * SPECIAL_CARDS.length)];
  return player.specialCard;
}

function applySpecialCard(state, playerId, cardType, targetId) {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: 'Spieler nicht gefunden' };
  if (player.specialCard !== cardType) return { success: false, error: 'Karte nicht vorhanden' };

  const target = state.territories[targetId];
  const getTerritoryName = id => state.mapData.territories.find(t => t.id === id)?.name || id;

  switch (cardType) {
    case 'bomb':
      if (!target) return { success: false, error: 'Gebiet nicht gefunden' };
      if (target.owner === playerId) return { success: false, error: 'Eigenes Gebiet nicht angreifbar' };
      if (player.bombUsed) return { success: false, error: 'Bombe bereits eingesetzt' };
      target.troops = 0;
      target.owner = null;
      player.bombUsed = true;
      state.log.unshift({ msg: `☢️ ${player.name} setzt Atombombe auf ${getTerritoryName(targetId)} ein!`, round: state.round });
      break;

    case 'fortress':
      if (!target) return { success: false, error: 'Gebiet nicht gefunden' };
      if (target.owner !== playerId) return { success: false, error: 'Nur eigene Gebiete' };
      target.fortified = true;
      state.log.unshift({ msg: `🛡 ${player.name} errichtet Festung in ${getTerritoryName(targetId)}`, round: state.round });
      break;

    case 'blitzkrieg':
      player.blitzActive = true;
      state.log.unshift({ msg: `⚡ ${player.name} aktiviert Blitzkrieg!`, round: state.round });
      break;

    default:
      return { success: false, error: 'Unbekannte Spezialkarte' };
  }

  player.specialCard = null;
  return { success: true };
}

module.exports = { SPECIAL_CARDS, grantSpecialCard, applySpecialCard };
