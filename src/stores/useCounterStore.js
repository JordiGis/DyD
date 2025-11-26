import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore';
import { useCharacterStateStore } from './useCharacterStateStore';

export const useCounterStore = defineStore('counter', () => {
  // --- State ---
  const counters = ref([]);

  // --- Data Persistence ---
  function saveData() {
    const accountStore = useAccountStore();
    const activeCharacterId = accountStore.accountData.activeCharacterId;
    if (!activeCharacterId) return;

    const characterIndex = accountStore.accountData.characters.findIndex(c => c.id === activeCharacterId);
    if (characterIndex !== -1) {
      accountStore.accountData.characters[characterIndex].counters = counters.value;
      accountStore.saveDataToLocalStorage();
    }
  }

  function loadData() {
    const accountStore = useAccountStore();
    const activeCharacterId = accountStore.accountData.activeCharacterId;
    if (!activeCharacterId) {
      counters.value = [];
      return;
    }
    const activeCharacter = accountStore.accountData.characters.find(c => c.id === activeCharacterId);
    counters.value = (activeCharacter && Array.isArray(activeCharacter.counters)) ? activeCharacter.counters : [];
  }

  // --- Actions: Counters ---
  function addCounter({ name, initial, min, max, buttons, shortRest = 0, longRest = 0 }) {
    counters.value.push({
      id: uuidv4(),
      name,
      value: initial,
      min,
      max,
      shortRest,
      shortRestReset: arguments[0].shortRestReset || false,
      longRest,
      longRestReset: arguments[0].longRestReset || false,
      buttons: buttons || [
        { label: '+1', increment: 1 },
        { label: '-1', increment: -1 },
      ],
    });
    saveData();
  }

  function updateCounterValue(id, delta) {
    const counter = counters.value.find(c => c.id === id);
    if (!counter) return;
    let newValue = counter.value + delta;
    if (counter.max !== undefined) newValue = Math.min(newValue, counter.max);
    if (counter.min !== undefined) newValue = Math.max(newValue, counter.min);
    counter.value = newValue;
    saveData();
  }

  function setCounterToMax(id) {
    const counter = counters.value.find(c => c.id === id);
    if (counter && counter.max !== undefined) {
      counter.value = counter.max;
      saveData();
    }
  }

  function removeCounter(id) {
    counters.value = counters.value.filter(c => c.id !== id);
    saveData();
  }

  // --- Actions: Rests ---
  function regenerateCountersByRest(type = 'short') {
    counters.value.forEach(counter => {
      const restKey = type === 'short' ? 'shortRest' : 'longRest';
      const resetKey = type === 'short' ? 'shortRestReset' : 'longRestReset';

      if (counter[resetKey]) {
        counter.value = counter[restKey];
      } else if (typeof counter[restKey] === 'number') {
        counter.value = Math.min(counter.max, counter.value + counter[restKey]);
      }
    });
    saveData();

    const characterStateStore = useCharacterStateStore();
    characterStateStore.resetStatesOnRest();
  }

  return {
    counters,
    loadData,
    addCounter,
    updateCounterValue,
    setCounterToMax,
    removeCounter,
    regenerateCountersByRest,
  };
});
