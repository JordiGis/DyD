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
    const diceType = `d${dice.split('d')[1]}`;

    const currentRolls = rollDice(dice);
    const appliedMinRolls = currentRolls.map(roll => ({
        value: Math.max(roll, min),
        diceType: diceType,
        originalValue: roll,
        isReplaced: false
    }));

    const rollSum = appliedMinRolls.reduce((sum, roll) => sum + roll.value, 0);
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

/**
 * Lanza los dados de reroll y los agrupa por tipo.
 * @param {Array} rerollDiceConf - Configuración de los dados de reroll.
 * @returns {Object} Objeto con los resultados de los dados de reroll, agrupados por tipo de dado.
 */
export function rollRerollDice(rerollDiceConf) {
  const rerollResults = {};

  if (!rerollDiceConf) {
    return rerollResults;
  }

  rerollDiceConf.forEach(reroll => {
    const diceType = `d${reroll.dice.split('d')[1]}`;
    const rolls = rollDice(reroll.dice);

    if (!rerollResults[diceType]) {
      rerollResults[diceType] = [];
    }
    rerollResults[diceType].push(...rolls);
  });

  // Ordenar cada grupo de resultados de mayor a menor
  for (const type in rerollResults) {
    rerollResults[type].sort((a, b) => b - a);
  }

  return rerollResults;
}

/**
 * Reemplaza los dados más bajos del resultado del ataque con los más altos de los dados de reroll.
 * @param {Object} attackResults - Los resultados actuales del ataque.
 * @param {Object} rerollResults - Los resultados de los dados de reroll.
 * @returns {Object} Un objeto con los resultados del ataque actualizados.
 */
export function replaceDice(attackResults, rerollResults) {
  const updatedResults = JSON.parse(JSON.stringify(attackResults));

  for (const rerollType in rerollResults) {
    const rerollValues = rerollResults[rerollType];

    // Encontrar todos los dados del mismo tipo en los resultados del ataque
    let matchingDice = [];
    for (const damageType in updatedResults.results) {
      updatedResults.results[damageType].rolls.forEach((roll, index) => {
        if (roll.diceType === rerollType && !roll.isReplaced) {
          matchingDice.push({ roll, damageType, index });
        }
      });
    }

    // Ordenar los dados coincidentes por valor ascendente
    matchingDice.sort((a, b) => a.roll.value - b.roll.value);

    // Reemplazar los dados más bajos con los más altos del reroll
    const numToReplace = Math.min(matchingDice.length, rerollValues.length);
    for (let i = 0; i < numToReplace; i++) {
      const dieToReplace = matchingDice[i];
      const newValue = rerollValues[i];

      if (newValue > dieToReplace.roll.value) {
        dieToReplace.roll.originalValue = dieToReplace.roll.value;
        dieToReplace.roll.value = newValue;
        dieToReplace.roll.isReplaced = true;
      }
    }
  }

  // Recalcular los totales y el robo de vida
  let newGrandTotal = 0;
  let newTotalHealed = 0;
  for (const damageType in updatedResults.results) {
    const typeData = updatedResults.results[damageType];
    const newSum = typeData.rolls.reduce((sum, roll) => sum + roll.value, 0);
    typeData.total = newSum + typeData.bonus;
    newGrandTotal += typeData.total;

    // Recalcular el robo de vida si existe
    if (typeData.lifeSteal) {
      const percentageDisplay = typeData.lifeSteal.percentage_display;
      const mainPercentage = parseFloat(percentageDisplay);
      if (!isNaN(mainPercentage)) {
        const healed = Math.floor(typeData.total * (mainPercentage / 100));
        typeData.lifeSteal.healed = healed;
        newTotalHealed += healed;
      }
    }
  }
  updatedResults.grandTotal = newGrandTotal;
  updatedResults.totalHealed = newTotalHealed;

  return updatedResults;
}
