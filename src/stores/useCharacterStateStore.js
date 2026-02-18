// src/stores/useCharacterStateStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore';
import { useCounterStore } from './useCounterStore';
import localforage from '../utils/localforage';

export const useCharacterStateStore = defineStore('characterState', () => {
  // --- State ---
  const states = ref([]);
  const selectedStateId = ref(null);
  const isLoading = ref(false);
  const counterStore = useCounterStore();

  // --- Computed ---
  const selectedState = computed(() => {
    return states.value.find(s => s.id === selectedStateId.value) || null;
  });

  // --- Data Persistence ---
  function saveData() {
    const accountStore = useAccountStore();
    const activeCharacterId = accountStore.accountData.activeCharacterId;
    if (!activeCharacterId) return;

    const characterIndex = accountStore.accountData.characters.findIndex(c => c.id === activeCharacterId);
    if (characterIndex !== -1) {
      accountStore.accountData.characters[characterIndex].characterState = states.value;
      accountStore.accountData.characters[characterIndex].selectedCharacterStateId = selectedStateId.value;
      accountStore.saveDataToLocalStorage();
    }
  }

  function loadData() {
    const accountStore = useAccountStore();
    const activeCharacterId = accountStore.accountData.activeCharacterId;
    if (!activeCharacterId) {
      states.value = [];
      selectedStateId.value = null;
      return;
    }

    const activeCharacter = accountStore.accountData.characters.find(c => c.id === activeCharacterId);
    let loadedStates = (activeCharacter && Array.isArray(activeCharacter.characterState)) ? activeCharacter.characterState : [];
    
    // Asegurar que todos los estados tengan la propiedad title (para compatibilidad)
    loadedStates = loadedStates.map(state => ({
      ...state,
      title: state.title || state.name || 'Sin título',
    }));
    
    states.value = loadedStates;
    selectedStateId.value = activeCharacter?.selectedCharacterStateId || (loadedStates.length > 0 ? loadedStates[0].id : null);
  }

  // --- Actions: States ---
  async function addState(name, imageFile) {
    isLoading.value = true;
    try {
      const stateId = uuidv4();

      // Si es un objeto con propiedades (API antigua), usarlo
      if (typeof name === 'object' && name !== null) {
        const stateObj = name;
        states.value.push({
          id: uuidv4(),
          name: stateObj.name,
          linkedCounterId: stateObj.linkedCounterId || null,
          discountOnActivate: stateObj.discountOnActivate || 0,
          discountType: stateObj.discountType || 'resta',
          active: false,
          image: null,
        });
      } else if (imageFile instanceof File) {
        // Convertir File a Blob
        const blob = new Blob([await imageFile.arrayBuffer()], { type: imageFile.type });

        // Guardar en localforage
        const storageKey = `state_${stateId}`;
        await localforage.setItem(storageKey, blob);

        states.value.push({
          id: stateId,
          name,
          title: name,
          linkedCounterId: null,
          discountOnActivate: 0,
          discountType: 'resta',
          active: false,
          image: stateId,
        });
      } else {
        states.value.push({
          id: stateId,
          name,
          title: name,
          linkedCounterId: null,
          discountOnActivate: 0,
          discountType: 'resta',
          active: false,
          image: null,
        });
      }

      if (!selectedStateId.value && states.value.length > 0) {
        selectedStateId.value = states.value[0].id;
      }
      saveData();
    } finally {
      isLoading.value = false;
    }
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

  async function deleteState(id) {
    const state = states.value.find(s => s.id === id);
    if (state && state.image) {
      try {
        const storageKey = `state_${state.image}`;
        await localforage.removeItem(storageKey);
      } catch (error) {
        console.error('Error deleting state image:', error);
      }
    }
    states.value = states.value.filter(s => s.id !== id);
    if (selectedStateId.value === id) {
      selectedStateId.value = states.value.length > 0 ? states.value[0].id : null;
    }
    saveData();
  }

  function setSelectedState(stateId) {
    selectedStateId.value = stateId;
    saveData();
  }

  function resetStatesOnRest() {
    states.value.forEach(state => {
      state.active = false;
    });
    saveData();
  }

  async function getStateImage(stateId) {
    try {
      const storageKey = `state_${stateId}`;
      const imageBlob = await localforage.getItem(storageKey);
      return imageBlob;
    } catch (error) {
      console.error('Error retrieving state image:', error);
      return null;
    }
  }

  return {
    states,
    selectedStateId,
    selectedState,
    isLoading,
    loadData,
    addState,
    removeState,
    deleteState,
    setSelectedState,
    toggleStateActive,
    resetStatesOnRest,
    getStateImage,
  };
});
