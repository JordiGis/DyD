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
      const activeCharacterId = accountStore.accountData.activeCharacterId;
      if (!activeCharacterId) {
        this.passiveDamages = [];
        return;
      }

      const activeCharacter = accountStore.accountData.characters.find(c => c.id === activeCharacterId);
      if (activeCharacter && activeCharacter.passiveDamages) {
        this.passiveDamages = activeCharacter.passiveDamages.map(damage => ({
          ...damage,
          id: damage.id || uuidv4(),
          duration: damage.duration !== undefined ? damage.duration : 0,
          damageRolls: damage.damageRolls || [],
        }));
      } else {
        this.passiveDamages = [];
      }
    },

    saveData() {
      const accountStore = useAccountStore();
      const activeCharacterId = accountStore.accountData.activeCharacterId;
      if (!activeCharacterId) return;

      const characterIndex = accountStore.accountData.characters.findIndex(c => c.id === activeCharacterId);
      if (characterIndex !== -1) {
        accountStore.accountData.characters[characterIndex].passiveDamages = this.passiveDamages;
        accountStore.saveDataToLocalStorage();
      }
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
