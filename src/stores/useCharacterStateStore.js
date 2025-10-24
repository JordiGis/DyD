import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import localforage from '../utils/localforage';
import imageCompression from 'browser-image-compression';

export const useCharacterStateStore = defineStore('characterState', () => {
  const states = ref([]);
  const selectedStateId = ref(null);
  const isLoading = ref(false);

  const selectedState = computed(() => {
    return states.value.find(s => s.id === selectedStateId.value) || null;
  });

  async function loadStates() {
    isLoading.value = true;
    try {
      const storedStates = await localforage.getItem('characterStates');
      const storedSelectedId = await localforage.getItem('selectedCharacterStateId');

      if (storedStates && Array.isArray(storedStates)) {
        states.value = storedStates;
      }
      if (storedSelectedId) {
        selectedStateId.value = storedSelectedId;
      } else if (states.value.length > 0) {
        setSelectedState(states.value[0].id);
      }
    } catch (error) {
      console.error('Error loading character states:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function addState(title, imageFile) {
    isLoading.value = true;
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(imageFile, options);

      const newState = {
        id: uuidv4(),
        title,
        image: compressedFile,
      };

      states.value.push(newState);

      const statesToStore = states.value.map(state => ({
        id: state.id,
        title: state.title,
        image: toRaw(state.image)
      }));

      await localforage.setItem('characterStates', statesToStore);

      if (states.value.length === 1) {
        setSelectedState(newState.id);
      }
    } catch (error) {
      console.error('Error adding character state:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function setSelectedState(stateId) {
    selectedStateId.value = stateId;
    await localforage.setItem('selectedCharacterStateId', stateId);
  }

  async function deleteState(stateId) {
    const newStates = states.value.filter(s => s.id !== stateId);
    states.value = newStates;

    if (selectedStateId.value === stateId) {
      const newSelectedId = newStates.length > 0 ? newStates[0].id : null;
      setSelectedState(newSelectedId);
    }

    const statesToStore = newStates.map(state => ({
      id: state.id,
      title: state.title,
      image: toRaw(state.image)
    }));

    await localforage.setItem('characterStates', statesToStore);
  }

  async function getStorageUsage() {
    try {
      const keys = await localforage.keys();
      let totalBytes = 0;

      for (const key of keys) {
        const value = await localforage.getItem(key);
        if (typeof value === 'string') {
          totalBytes += new Blob([value]).size;
        } else if (value instanceof Blob) {
          totalBytes += value.size;
        } else if (Array.isArray(value)) {
          // Handle array of states with blobs
          for(const item of value) {
            if(item.image) {
              totalBytes += item.image.size;
            }
            totalBytes += new Blob([JSON.stringify(item)]).size;
          }
        }
      }

      return totalBytes;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }

  return {
    states,
    selectedStateId,
    isLoading,
    selectedState,
    loadStates,
    addState,
    setSelectedState,
    deleteState,
    getStorageUsage,
  };
});
