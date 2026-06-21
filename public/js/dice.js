const DIE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function createDieEl(value, type, isWinner) {
  const die = document.createElement('div');
  die.className = `die ${type} ${isWinner ? 'winner' : 'loser'}`;
  die.textContent = DIE_FACES[value] || value;
  die.dataset.value = value;
  return die;
}

function animateDiceRoll(container, attackerDice, defenderDice) {
  container.innerHTML = '';

  // Determine winners/losers
  const pairs = Math.min(attackerDice.length, defenderDice.length);
  const attResults = attackerDice.map((v, i) => ({ v, win: i < pairs && v > defenderDice[i] }));
  const defResults = defenderDice.map((v, i) => ({ v, win: i < pairs && v >= attackerDice[i] }));

  // Attacker row
  const attRow = document.createElement('div');
  attRow.className = 'dice-row';
  const attLabel = document.createElement('span');
  attLabel.className = 'dice-label';
  attLabel.textContent = '⚔ Angreifer';
  attRow.appendChild(attLabel);

  attackerDice.forEach((val, i) => {
    const die = createDieEl(val, 'attacker', i < pairs && val > defenderDice[i]);
    die.classList.add('rolling');
    setTimeout(() => die.classList.remove('rolling'), 400);
    attRow.appendChild(die);
  });

  // Defender row
  const defRow = document.createElement('div');
  defRow.className = 'dice-row';
  const defLabel = document.createElement('span');
  defLabel.className = 'dice-label';
  defLabel.textContent = '🛡 Verteidiger';
  defRow.appendChild(defLabel);

  defenderDice.forEach((val, i) => {
    const die = createDieEl(val, 'defender', i < pairs && val >= attackerDice[i]);
    die.classList.add('rolling');
    setTimeout(() => die.classList.remove('rolling'), 400);
    defRow.appendChild(die);
  });

  container.appendChild(attRow);
  container.appendChild(defRow);
}

function showCombatResult(container, attackerLosses, defenderLosses) {
  const existing = container.querySelector('.combat-result');
  if (existing) existing.remove();

  const result = document.createElement('div');
  result.className = 'combat-result';

  if (attackerLosses === 0 && defenderLosses > 0) {
    result.classList.add('att-wins');
    result.textContent = `Angreifer verliert 0 — Verteidiger -${defenderLosses}`;
  } else if (defenderLosses === 0 && attackerLosses > 0) {
    result.classList.add('def-wins');
    result.textContent = `Angreifer -${attackerLosses} — Verteidiger verliert 0`;
  } else {
    result.classList.add('split');
    result.textContent = `Angreifer -${attackerLosses} — Verteidiger -${defenderLosses}`;
  }

  container.appendChild(result);
}

function showDiceModal(container, attackerDice, defenderDice, attLoss, defLoss, resultEl) {
  container.innerHTML = '';
  animateDiceRoll(container, attackerDice, defenderDice);
  if (!resultEl) return;
  resultEl.textContent = '';
  setTimeout(() => {
    if (attLoss === 0 && defLoss > 0)      resultEl.textContent = `✓ Angreifer: 0 verloren — Verteidiger: −${defLoss}`;
    else if (defLoss === 0 && attLoss > 0) resultEl.textContent = `✓ Verteidiger hält: Angreifer −${attLoss}`;
    else                                   resultEl.textContent = `Split: Angreifer −${attLoss} | Verteidiger −${defLoss}`;
    resultEl.style.color = attLoss < defLoss ? 'var(--success)' : attLoss > defLoss ? 'var(--danger)' : 'var(--warning)';
  }, 500);
}

function showWinChance(pct, detail) {
  const fill = document.getElementById('winChanceFill');
  const pctEl = document.getElementById('winChancePct');
  const detailEl = document.getElementById('winChanceDetail');

  if (!fill) return;
  fill.style.width = pct + '%';
  fill.style.background = pct >= 60 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  pctEl.textContent = pct + '%';
  if (detail) detailEl.textContent = detail;
}
