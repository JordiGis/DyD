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
    let { dice, min = 1, bonus = 0, type } = damageRoll;

    // Asegurarse de que los valores numéricos sean correctos
    min = Number(min) || 1;
    bonus = Number(bonus) || 0;

    const rolls = rollDice(dice).map(roll => Math.max(roll, min));
    const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
    const total = rollSum + bonus;

    grandTotal += total;

    if (!results[type]) {
      results[type] = {
        rolls: [],
        bonus: 0,
        total: 0,
        lifeSteal: null,
      };
    }

    results[type].rolls.push(...rolls);
    results[type].bonus += bonus;
    results[type].total += total;

    if (attack.lifeSteal && attack.lifeSteal.percentage > 0) {
      const healed = Math.floor(total * (attack.lifeSteal.percentage / 100));
      totalHealed += healed;

      if (!results[type].lifeSteal) {
        results[type].lifeSteal = {
          percentage: attack.lifeSteal.percentage,
          healed: 0,
        };
      }
      results[type].lifeSteal.healed += healed;
    }
  });

  return {
    name: attack.name,
    results,
    grandTotal,
    totalHealed,
  };
}
