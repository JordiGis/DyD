// src/stores/useCharacterStateStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore';
import { useCounterStore } from './useCounterStore';

export const useCharacterStateStore = defineStore('characterState', () => {
  // --- State ---
  const states = ref([]);
  const counterStore = useCounterStore();

  // --- Data Persistence ---
  function saveData() {
    const accountStore = useAccountStore();
    const activeCharacterId = accountStore.accountData.activeCharacterId;
    if (!activeCharacterId) return;

    const characterIndex = accountStore.accountData.characters.findIndex(c => c.id === activeCharacterId);
    if (characterIndex !== -1) {
      accountStore.accountData.characters[characterIndex].characterState = states.value;
      accountStore.saveDataToLocalStorage();
    }
  }

  function loadData() {
    const accountStore = useAccountStore();
    const activeCharacterId = accountStore.accountData.activeCharacterId;
    if (!activeCharacterId) {
      states.value = [];
      return;
    }

    const activeCharacter = accountStore.accountData.characters.find(c => c.id === activeCharacterId);
    states.value = (activeCharacter && Array.isArray(activeCharacter.characterState)) ? activeCharacter.characterState : [];
  }

  // --- Actions: States ---
  function addState({ name, linkedCounterId, discountOnActivate, discountType }) {
    states.value.push({
      id: uuidv4(),
      name,
      linkedCounterId: linkedCounterId || null,
      discountOnActivate: discountOnActivate || 0,
      discountType: discountType || 'resta',
      active: false,
    });
    saveData();
  }

  function toggleStateActive(id) {
    const state = states.value.find(s => s.id === id);
    if (!state) return;
    state.active = !state.active;

    if (state.active && state.linkedCounterId) {
      const amount = Math.abs(state.discountOnActivate || 1);
      const delta = state.discountType === 'suma' ? amount : -amount;
      counterStore.updateCounterValue(state.linkedCounterId, delta);
    }
    saveData();
  }

  function removeState(id) {
    states.value = states.value.filter(s => s.id !== id);
    saveData();
  }

  function resetStatesOnRest() {
    states.value.forEach(state => {
      state.active = false;
    });
    saveData();
  }


  return {
    states,
    loadData,
    addState,
    removeState,
    toggleStateActive,
    resetStatesOnRest,
  };
});
