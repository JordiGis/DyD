// src/utils/diceParser.js

/**
 * Rolls dice based on number, type, and bonus.
 * @param {number} numDice - The number of dice to roll.
 * @param {number} diceType - The number of sides on the dice.
 * @param {number} bonus - A flat bonus to add to the total.
 * @returns {number} The total result of the roll.
 */
export function rollDice(numDice, diceType, bonus) {
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * diceType) + 1;
  }
  return total + bonus;
}
