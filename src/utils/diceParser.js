// src/utils/diceParser.js

/**
 * Parses a dice expression (e.g., '2d6+3') and rolls the dice.
 * @param {string} expression - The dice expression.
 * @returns {number} The total result of the roll.
 */
export function rollDice(expression) {
  if (typeof expression !== 'string' || !expression.trim()) {
    console.error('Invalid dice expression:', expression);
    return 0;
  }

  try {
    const parts = expression.toLowerCase().split('+');
    let total = 0;

    // Handle the dice part (e.g., '2d6')
    if (parts[0].includes('d')) {
      const [numDice, diceType] = parts[0].split('d').map(Number);
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceType) + 1;
      }
    } else {
      // If there's no 'd', it might be a flat number
      total += Number(parts[0]);
    }

    // Handle the bonus part (e.g., '+3')
    if (parts.length > 1) {
      total += Number(parts[1]);
    }

    return total;
  } catch (error) {
    console.error('Error parsing dice expression:', expression, error);
    return 0; // Return 0 if parsing fails
  }
}
