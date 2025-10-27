
// src/utils/damageCalculations.js

/**
 * Calcula el bonus de daño para la regla de crítico "Massive Damage (DAD)"
 * basado en el nivel del personaje.
 * @param {number} characterLevel - El nivel del personaje.
 * @returns {number} El bonus de daño.
 */
export function calculateDadBonus(characterLevel) {
  if (characterLevel <= 0) {
    return 0;
  }
  if (characterLevel >= 1 && characterLevel <= 4) return 10;
  if (characterLevel >= 5 && characterLevel <= 10) return 20;
  if (characterLevel >= 11 && characterLevel <= 16) return 30;
  if (characterLevel >= 17 && characterLevel <= 20) return 40;

  // Patrón para niveles superiores
  const baseLevel = 21;
  const baseDamage = 50;
  if (characterLevel >= baseLevel) {
    const levelGroup = Math.floor((characterLevel - baseLevel) / 4);
    return baseDamage + levelGroup * 10;
  }

  return 0;
}
