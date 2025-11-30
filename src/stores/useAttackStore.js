// src/stores/useAttackStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore'; // Importar el store de la cuenta
import { executeAttack as executeAttackLogic, executeCriticalAttack as executeCriticalAttackLogic } from '../utils/attackLogic';
import { showAttackResult as showAttackResultLogic } from '../utils/attackExecutor';

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
      const activeCharacterId = accountStore.accountData.activeCharacterId;
      if (!activeCharacterId) {
        this.attacks = [];
        this.criticalHit = { rule: 'default', characterLevel: 1 };
        return;
      }

      const activeCharacter = accountStore.accountData.characters.find(c => c.id === activeCharacterId);
      if (activeCharacter) {
        this.attacks = (activeCharacter.attacks || []).map(attack => ({
          ...attack,
          id: attack.id || uuidv4(),
          rerollDice: attack.rerollDice || [],
          damageRolls: (attack.damageRolls || []).map(roll => ({
            ...roll,
            lifeSteal: roll.lifeSteal || { percentage: 0 },
          })),
          isPreparable: attack.isPreparable || false,
          isPrepared: attack.isPrepared || false,
          description: attack.description || '',
        }));
        this.criticalHit = activeCharacter.criticalHit || { rule: 'default', characterLevel: 1 };
      } else {
        this.attacks = [];
        this.criticalHit = { rule: 'default', characterLevel: 1 };
      }
    },

    saveData() {
      const accountStore = useAccountStore();
      const activeCharacterId = accountStore.accountData.activeCharacterId;
      if (!activeCharacterId) return;

      const characterIndex = accountStore.accountData.characters.findIndex(c => c.id === activeCharacterId);
      if (characterIndex !== -1) {
        accountStore.accountData.characters[characterIndex].attacks = this.attacks;
        accountStore.accountData.characters[characterIndex].criticalHit = this.criticalHit;
        accountStore.saveDataToLocalStorage();
      }
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
    executeAndShowAttack(attack, isCritical = false) {
      const result = isCritical ? executeCriticalAttackLogic(attack, this.criticalHit) : executeAttackLogic(attack);
      showAttackResultLogic(result, attack.rerollDice);
    },
  },
});
