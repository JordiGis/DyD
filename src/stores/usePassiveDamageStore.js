// src/stores/usePassiveDamageStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const usePassiveDamageStore = defineStore('passiveDamage', {
  state: () => ({
    passiveDamages: [],
  }),

  actions: {
    loadPassiveDamages() {
      const data = localStorage.getItem('dnd-passive-damages-data');
      if (data) {
        try {
          const parsedDamages = JSON.parse(data);
          this.passiveDamages = parsedDamages.map(damage => {
            const newDamage = {
              id: damage.id || uuidv4(),
              name: damage.name,
              duration: damage.duration || 0, // Añadir duración, por defecto 0 (infinito)
              damageRolls: [],
            };

            if (damage.damageRolls) { // Formato intermedio
              newDamage.damageRolls = damage.damageRolls.map(roll => {
                if (typeof roll.dice === 'string') {
                  const [dicePart, bonusPart] = roll.dice.split('+');
                  const [numDice, diceType] = dicePart.split('d').map(Number);
                  return {
                    numDice: numDice || 1,
                    diceType: diceType || 6,
                    bonus: bonusPart ? parseInt(bonusPart) : 0,
                    type: roll.type || 'bludgeoning',
                  };
                }
                return roll; // Ya está en el formato nuevo
              });
            } else if (damage.dice) { // Formato más antiguo
                const [dicePart, bonusPart] = damage.dice.split('+');
                const [numDice, diceType] = dicePart.split('d').map(Number);
                newDamage.damageRolls.push({
                    numDice: numDice || 1,
                    diceType: diceType || 6,
                    bonus: bonusPart ? parseInt(bonusPart) : 0,
                    type: 'bludgeoning',
                });
            }
            return newDamage;
          });
        } catch (error) {
          console.error('Error loading or migrating passive damages from localStorage:', error);
          this.passiveDamages = [];
        }
      }
    },

    savePassiveDamages() {
      localStorage.setItem('dnd-passive-damages-data', JSON.stringify(this.passiveDamages));
    },

    addPassiveDamage(damageData) {
      const newDamage = {
        ...damageData,
        id: uuidv4(),
      };
      this.passiveDamages.push(newDamage);
      this.savePassiveDamages();
    },

    updatePassiveDamage(updatedDamage) {
      const index = this.passiveDamages.findIndex(d => d.id === updatedDamage.id);
      if (index !== -1) {
        this.passiveDamages[index] = updatedDamage;
        this.savePassiveDamages();
      }
    },

    duplicatePassiveDamage(damageId) {
        const originalDamage = this.passiveDamages.find(d => d.id === damageId);
        if (originalDamage) {
            const duplicatedDamage = JSON.parse(JSON.stringify(originalDamage));
            duplicatedDamage.id = uuidv4();
            duplicatedDamage.name = `${originalDamage.name} (Copia)`;

            const originalIndex = this.passiveDamages.findIndex(d => d.id === damageId);
            this.passiveDamages.splice(originalIndex + 1, 0, duplicatedDamage);

            this.savePassiveDamages();
        }
    },

    deletePassiveDamage(damageId) {
      this.passiveDamages = this.passiveDamages.filter(d => d.id !== damageId);
      this.savePassiveDamages();
    },

    decrementDurations() {
        let needsSave = false;
        this.passiveDamages.forEach(effect => {
            if (effect.duration > 0) {
                effect.duration--;
                needsSave = true;
            }
        });
        // Opcional: eliminar efectos con duración 0
        // this.passiveDamages = this.passiveDamages.filter(effect => effect.duration !== 0);
        if (needsSave) {
            this.savePassiveDamages();
        }
    }
  },
});
