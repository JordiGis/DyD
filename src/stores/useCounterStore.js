
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { nanoid } from 'nanoid';

export const useCounterStore = defineStore('counter', () => {
  // Contadores
  const counters = ref([]);
  const states = ref([]);


  // Cargar de localStorage al iniciar (asegurando estructura y reactividad)
  try {
    const savedCounters = JSON.parse(localStorage.getItem('dnd-counters'));
    if (Array.isArray(savedCounters)) {
      counters.value = savedCounters.map(c => ({ ...c }));
    }
  } catch {}
  try {
    const savedStates = JSON.parse(localStorage.getItem('dnd-states'));
    if (Array.isArray(savedStates)) {
      states.value = savedStates.map(s => ({
        active: false, // por defecto
        ...s,
        active: typeof s.active === 'boolean' ? s.active : false,
      }));
    }
  } catch {}

  // Guardar automáticamente en localStorage cuando cambian
  watch(counters, val => {
    localStorage.setItem('dnd-counters', JSON.stringify(val));
  }, { deep: true });
  watch(states, val => {
    localStorage.setItem('dnd-states', JSON.stringify(val));
  }, { deep: true });

  // --- Contadores ---
  function addCounter({ name, initial, min, max, buttons, shortRest = 0, longRest = 0 }) {
    counters.value.push({
      id: nanoid() + '-' + Date.now() + '-' + Math.random().toString(36).slice(2),
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
  }

  function updateCounterValue(id, delta) {
    const counter = counters.value.find(c => c.id === id);
    if (!counter) return;
    let newValue = counter.value + delta;
    if (newValue > counter.max) newValue = counter.max;
    if (newValue < counter.min) newValue = counter.min;
    counter.value = newValue;
  }

  function setCounterToMax(id) {
    const counter = counters.value.find(c => c.id === id);
    if (counter) counter.value = counter.max;
  }

  function removeCounter(id) {
  // Forzar nueva referencia para asegurar reactividad
  const nuevaLista = counters.value.filter(c => c.id !== id);
  counters.value.splice(0, counters.value.length, ...nuevaLista);
  }

  // --- Estados ---

  function addState({ name, shortRest, longRest, linkedCounterId, discountOnActivate }) {
    states.value.push({
      id: nanoid(),
      name,
      linkedCounterId: linkedCounterId || null,
      discountOnActivate: discountOnActivate || 0,
      discountType: discountType || 'resta', // 'suma' o 'resta'
      active: false,
    });
  }

  function toggleStateActive(id) {
    const state = states.value.find(s => s.id === id);
    if (!state) return;
    state.active = !state.active;
    // Si se activa y está vinculado, suma o resta al contador según discountType
    if (state.active && state.linkedCounterId) {
      const amount = Math.abs(state.discountOnActivate || 1);
      const delta = state.discountType === 'suma' ? amount : -amount;
      updateCounterValue(state.linkedCounterId, delta);
    }
  }

  // Regenerar contadores según descanso corto/largo
  function regenerateCountersByRest(type = 'short') {
    // Recargar todos los contadores según el tipo de descanso
    counters.value.forEach(counter => {
      if (type === 'short') {
        if (counter.shortRestReset) {
          // Resetear al valor indicado
          counter.value = counter.shortRest;
        } else {
          const amount = counter.shortRest;
          if (amount && typeof amount === 'number') {
            counter.value = Math.min(counter.max, counter.value + amount);
          }
        }
      } else if (type === 'long') {
        if (counter.longRestReset) {
          counter.value = counter.longRest;
        } else {
          const amount = counter.longRest;
          if (amount && typeof amount === 'number') {
            counter.value = Math.min(counter.max, counter.value + amount);
          }
        }
      }
    });
    // Desactivar todos los estados
    states.value.forEach(state => {
      state.active = false;
    });
  }

  function activateState(id) {
    const state = states.value.find(s => s.id === id);
    if (!state) return;
    if (state.linkedCounterId && state.discountOnActivate) {
      updateCounterValue(state.linkedCounterId, -state.discountOnActivate);
    }
  }

  function removeState(id) {
    states.value = states.value.filter(s => s.id !== id);
  }

  return {
    counters,
    states,
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
