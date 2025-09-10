// src/utils/attackLogic.js

/**
 * Lanza los dados según una cadena de texto (ej: "2d6").
 * @param {string} diceString - La cadena que define los dados (ej: "2d6").
 * @returns {number[]} Un array con el resultado de cada dado.
 */
export function rollDice(diceString) {
  const [numDice, diceSize] = diceString.toLowerCase().split('d').map(Number);
  const rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * diceSize) + 1);
  }
  return rolls;
}

/**
 * Ejecuta un ataque y calcula el daño y el robo de vida.
 * @param {object} attack - El objeto de ataque.
 * @returns {object} El resultado del ataque, agrupado por tipo de daño.
 */
export function executeAttack(attack) {
  const results = {};
  let grandTotal = 0;
  let totalHealed = 0;

  attack.damageRolls.forEach(damageRoll => {
    let { dice, min = 1, bonus = 0, type, lifeSteal = { percentage: 0 } } = damageRoll;

    min = Number(min) || 1;
    bonus = Number(bonus) || 0;
    const lifeStealPercentage = Number(lifeSteal.percentage) || 0;

    const currentRolls = rollDice(dice);
    const appliedMinRolls = currentRolls.map(roll => Math.max(roll, min));
    const rollSum = appliedMinRolls.reduce((sum, roll) => sum + roll, 0);
    const damageRollTotal = rollSum + bonus;

    grandTotal += damageRollTotal;

    if (!results[type]) {
      results[type] = {
        rolls: [],
        bonus: 0,
        total: 0,
        lifeSteal: { healed: 0, percentages: [] },
      };
    }

    results[type].rolls.push(...appliedMinRolls);
    results[type].bonus += bonus;
    results[type].total += damageRollTotal;

    if (lifeStealPercentage > 0) {
      const healed = Math.floor(damageRollTotal * (lifeStealPercentage / 100));
      totalHealed += healed;
      results[type].lifeSteal.healed += healed;
      results[type].lifeSteal.percentages.push(lifeStealPercentage);
    }
  });

  for (const type in results) {
    if (results[type].lifeSteal.healed === 0) {
      results[type].lifeSteal = null;
    } else {
      const uniquePercentages = [...new Set(results[type].lifeSteal.percentages)];
      results[type].lifeSteal.percentage_display = uniquePercentages.join('% / ') + '%';
      delete results[type].lifeSteal.percentages;
    }
  }

  return {
    name: attack.name,
    results,
    grandTotal,
    totalHealed,
  };
}
