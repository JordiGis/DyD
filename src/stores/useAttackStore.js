// src/stores/useAttackStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore'; // Importar el store de la cuenta

export const useAttackStore = defineStore('attack', {
  state: () => ({
    attacks: [],
    criticalHit: {
      rule: 'default',
      characterLevel: 1,
    },
  }),

  actions: {
    loadData() {
      const accountStore = useAccountStore();
      const data = accountStore.getSection('attacks');

      if (data) {
        // Cargar ataques y migrar formatos viejos si es necesario
        const parsedAttacks = data.attacks || [];
        this.attacks = parsedAttacks.map(attack => {
          // Asegurar compatibilidad hacia atrás
          return {
            ...attack,
            id: attack.id || uuidv4(),
            rerollDice: attack.rerollDice || [],
            damageRolls: (attack.damageRolls || []).map(roll => ({
              ...roll,
              lifeSteal: roll.lifeSteal || { percentage: 0 },
            })),
          };
        });

        // Cargar configuración de críticos
        if (data.criticalHit) {
          this.criticalHit = { ...this.criticalHit, ...data.criticalHit };
        }
      }
    },

    saveData() {
      const accountStore = useAccountStore();
      const dataToSave = {
        attacks: this.attacks,
        criticalHit: this.criticalHit,
      };
      accountStore.updateSection('attacks', dataToSave);
    },

    updateCriticalHitConfig(config) {
      this.criticalHit = { ...this.criticalHit, ...config };
      this.saveData();
    },

    addAttack(attackData) {
      const newAttack = {
        ...attackData,
        id: uuidv4(),
      };
      this.attacks.push(newAttack);
      this.saveData();
    },

    updateAttack(updatedAttack) {
      const index = this.attacks.findIndex(a => a.id === updatedAttack.id);
      if (index !== -1) {
        this.attacks[index] = updatedAttack;
        this.saveData();
      }
    },

    duplicateAttack(attackId) {
      const originalAttack = this.attacks.find(a => a.id === attackId);
      if (originalAttack) {
        const duplicatedAttack = JSON.parse(JSON.stringify(originalAttack));
        duplicatedAttack.id = uuidv4();
        duplicatedAttack.name = `${originalAttack.name} (Copia)`;

        const originalIndex = this.attacks.findIndex(a => a.id === attackId);
        this.attacks.splice(originalIndex + 1, 0, duplicatedAttack);
        this.saveData();
      }
    },

    deleteAttack(attackId) {
      this.attacks = this.attacks.filter(a => a.id !== attackId);
      this.saveData();
    },

    getAttackById(attackId) {
      return this.attacks.find(a => a.id === attackId);
    },

    updateAttackOrder(newOrder) {
      this.attacks = newOrder
        .map(id => this.attacks.find(a => a.id === id))
        .filter(Boolean);
      this.saveData();
    },
  },
});
