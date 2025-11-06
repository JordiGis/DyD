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
          // Migración para asegurar que cada entrada tenga la nueva estructura
          this.passiveDamages = parsedDamages.map(damage => {
            if (!damage.damageRolls) {
              // Es el formato antiguo, convertirlo
              return {
                id: damage.id || uuidv4(),
                name: damage.name,
                damageRolls: [{ dice: damage.dice, type: 'bludgeoning' }] // Asignar un tipo por defecto
              };
            }
            return {
              ...damage,
              id: damage.id || uuidv4()
            };
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
  },
});
