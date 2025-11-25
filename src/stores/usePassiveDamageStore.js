// src/stores/usePassiveDamageStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore'; // Importar el store de la cuenta

export const usePassiveDamageStore = defineStore('passiveDamage', {
  state: () => ({
    passiveDamages: [],
  }),

  actions: {
    loadData() {
      const accountStore = useAccountStore();
      const data = accountStore.getSection('passiveDamages');
      if (data) {
        // La lógica de migración de formatos antiguos se mantiene aquí
        // por si se importan datos con estructuras viejas.
        this.passiveDamages = data.map(damage => {
          const newDamage = {
            id: damage.id || uuidv4(),
            name: damage.name,
            duration: damage.duration !== undefined ? damage.duration : 0,
            damageRolls: [],
          };

          if (Array.isArray(damage.damageRolls)) {
            newDamage.damageRolls = damage.damageRolls;
          }
          return newDamage;
        });
      }
    },

    saveData() {
      const accountStore = useAccountStore();
      accountStore.updateSection('passiveDamages', this.passiveDamages);
    },

    addPassiveDamage(damageData) {
      const newDamage = {
        ...damageData,
        id: uuidv4(),
      };
      this.passiveDamages.push(newDamage);
      this.saveData();
    },

    updatePassiveDamage(updatedDamage) {
      const index = this.passiveDamages.findIndex(d => d.id === updatedDamage.id);
      if (index !== -1) {
        this.passiveDamages[index] = updatedDamage;
        this.saveData();
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
        this.saveData();
      }
    },

    deletePassiveDamage(damageId) {
      this.passiveDamages = this.passiveDamages.filter(d => d.id !== damageId);
      this.saveData();
    },

    decrementDurations() {
      let changed = false;
      this.passiveDamages.forEach(effect => {
        if (effect.duration > 0) {
          effect.duration--;
          changed = true;
        }
      });

      const initialCount = this.passiveDamages.length;
      this.passiveDamages = this.passiveDamages.filter(effect => effect.duration !== 0);

      if (changed || this.passiveDamages.length !== initialCount) {
        this.saveData();
      }
    }
  },
});
