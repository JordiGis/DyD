import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore';

export const useCounterStore = defineStore('counter', () => {
  // --- State ---
  const counters = ref([]);
  const states = ref([]);

  // --- Data Persistence ---
  function saveData() {
    const accountStore = useAccountStore();
    accountStore.updateSection('counters', {
      counters: counters.value,
      states: states.value,
    });
  }

  function loadData() {
    const accountStore = useAccountStore();
    const data = accountStore.getSection('counters');
    if (data) {
      counters.value = Array.isArray(data.counters) ? data.counters : [];
      states.value = Array.isArray(data.states) ? data.states : [];
    }
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
      updateCounterValue(state.linkedCounterId, delta);
    } else {
      saveData();
    }
  }

  function activateState(id) {
    const state = states.value.find(s => s.id === id);
    if (state && state.linkedCounterId && state.discountOnActivate) {
      updateCounterValue(state.linkedCounterId, -state.discountOnActivate);
    }
  }

  function removeState(id) {
    states.value = states.value.filter(s => s.id !== id);
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

    states.value.forEach(state => {
      state.active = false;
    });

    saveData();
  }

  return {
    counters,
    states,
    loadData,
    addCounter,
    updateCounterValue,
    setCounterToMax,
    removeCounter,
    addState,
    activateState,
    removeState,
    toggleStateActive,
    regenerateCountersByRest,
  };
});
