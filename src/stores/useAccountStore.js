// src/stores/useAccountStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useAccountStore = defineStore('account', {
  state: () => ({
    accountData: {
      version: 2, // Bump version for new structure
      characters: [],
      activeCharacterId: null,
      dm: null,
      players: null,
      // a_very_long_list_of_items_that_is_used_now_in_the_new_version: null,
      characterFolds: null,
      diceHistory: null,
      dmTodoItems: null,
      dmCollapsedCharacters: null,
    },

    // Indica si los datos han sido migrados
    migrationCompleted: false,
    isLoading: true,
  }),

  getters: {
    characters: (state) => state.accountData.characters,
    isDataLoading: (state) => state.isLoading,
  },

  actions: {
    // --- Lógica de unificación y migración ---

    /**
     * Carga los datos iniciales, priorizando el nuevo formato unificado.
     * Si no existe, intenta migrar los datos antiguos desde localStorage.
     */
    loadInitialData() {
      try {
        const unifiedDataString = localStorage.getItem('dnd-account-data');
        let dataToProcess;

        if (unifiedDataString) {
          dataToProcess = JSON.parse(unifiedDataString);
        } else {
          const legacyData = this._migrateDataFromLegacyLocalStorage();
          if (legacyData) {
            dataToProcess = legacyData;
            this.clearOldLocalStorageData(); // Limpiamos claves antiguas tras leerlas
            console.log('Datos antiguos de localStorage cargados para migración.');
          }
        }

        if (dataToProcess) {
          if (!dataToProcess.version || dataToProcess.version < 2) {
            this.accountData = this._migrateV1toV2(dataToProcess);
            console.log('Migración de V1 a V2 completada.');
            this.saveDataToLocalStorage(); // Guardamos la nueva estructura
          } else {
            this.accountData = dataToProcess;
          }
        }
      } catch (error) {
        console.error('Error al cargar o migrar los datos. Empezando con un estado limpio.', error);
        // Opcional: limpiar datos corruptos si se detecta un error
        localStorage.removeItem('dnd-account-data');
      } finally {
        this.migrationCompleted = true;
        this.isLoading = false;
      }
    },

    /**
     * Migra los datos de la estructura V1 (un solo personaje) a V2 (múltiples personajes).
     * @param {object} v1Data - Los datos en el formato antiguo.
     * @returns {object} - Los datos en el nuevo formato V2.
     */
    _migrateV1toV2(v1Data) {
      const v2Data = {
        version: 2,
        characters: [],
        activeCharacterId: null,
        dm: v1Data.dm || null,
        players: v1Data.players || null,
        characterFolds: v1Data.characterFolds || null,
        diceHistory: v1Data.diceHistory || null,
        dmTodoItems: v1Data.dmTodoItems || null,
        dmCollapsedCharacters: v1Data.dmCollapsedCharacters || null,
      };

      // Si existe un personaje, lo migramos
      if (v1Data.character) {
        const characterId = uuidv4();
        const newCharacter = {
          id: characterId,
          characterData: v1Data.character,
          attacks: v1Data.attacks ? (v1Data.attacks.attacks || []) : [],
          criticalHit: v1Data.attacks ? (v1Data.attacks.criticalHit || { rule: 'default', characterLevel: 1 }) : { rule: 'default', characterLevel: 1 },
          passiveDamages: v1Data.passiveDamages || [],
          counters: v1Data.counters ? v1Data.counters.counters : [],
          characterState: v1Data.counters ? v1Data.counters.states : [], // Basado en la estructura de v1
        };

        v2Data.characters.push(newCharacter);
        v2Data.activeCharacterId = characterId;
      }

      return v2Data;
    },


    /**
     * Reúne todos los datos de los antiguos keys de localStorage en un solo objeto v1.
     * No modifica el estado directamente, solo recolecta y devuelve.
     */
    _migrateDataFromLegacyLocalStorage() {
      const parseLocalStorage = (key) => {
        const data = localStorage.getItem(key);
        try {
          return data ? JSON.parse(data) : null;
        } catch (e) {
          console.error(`Error parsing ${key} from localStorage:`, e);
          return null;
        }
      };

      const oldCharacterData = parseLocalStorage('dnd-character-data');
      if (!oldCharacterData) return null; // Si no hay datos de personaje, no hay nada que migrar.

      const v1Data = {
        version: 1,
        character: oldCharacterData,
        dm: parseLocalStorage('dnd-dm-data'),
        players: parseLocalStorage('dnd-player-data'),
        attacks: parseLocalStorage('dnd-attacks-data'),
        passiveDamages: parseLocalStorage('dnd-passive-damages-data'),
        counters: {
          counters: parseLocalStorage('dnd-counters'),
          states: parseLocalStorage('dnd-states')
        },
        characterFolds: parseLocalStorage('dnd-character-folds'),
        diceHistory: parseLocalStorage('dice-roller-history'),
        dmTodoItems: parseLocalStorage('dnd-todo-items'),
        dmCollapsedCharacters: parseLocalStorage('collapsedCharacters'),
      };

      return v1Data;
    },

    /**
     * Elimina todos los keys antiguos de localStorage después de la migración.
     */
    clearOldLocalStorageData() {
      localStorage.removeItem('dnd-character-data');
      localStorage.removeItem('dnd-dm-data');
      localStorage.removeItem('dnd-player-data');
      localStorage.removeItem('dnd-attacks-data');
      localStorage.removeItem('dnd-passive-damages-data');
      localStorage.removeItem('dnd-counters');
      localStorage.removeItem('dnd-states');
      localStorage.removeItem('a_very_long_list_of_items_that_is_used_now_in_the_new_version');
      localStorage.removeItem('dnd-character-folds');
      localStorage.removeItem('dice-roller-history');
      localStorage.removeItem('dnd-todo-items');
      localStorage.removeItem('collapsedCharacters');
      localStorage.removeItem('dnd-critical-hit-config'); // Configuración de críticos
    },

    // --- Acciones de gestión de datos ---

    /**
     * Guarda el estado completo de `accountData` en localStorage.
     * Esta función se convertirá en el único punto de escritura a localStorage.
     */
    saveDataToLocalStorage() {
      localStorage.setItem('dnd-account-data', JSON.stringify(this.accountData));
    },

    /**
     * Actualiza una sección específica del estado de la cuenta y guarda.
     * @param {string} key - La clave principal en `accountData` (ej. 'character', 'dm').
     * @param {*} data - Los nuevos datos para esa clave.
     */
    updateSection(key, data) {
      if (this.accountData.hasOwnProperty(key)) {
        this.accountData[key] = data;
        this.saveDataToLocalStorage();
      } else {
        console.warn(`La clave '${key}' no existe en accountData.`);
      }
    },

    /**
     * Obtiene una sección específica de los datos de la cuenta.
     * @param {string} key - La clave de la sección a obtener.
     */
    getSection(key) {
      return this.accountData[key];
    },

    // --- Importación / Exportación ---

    /**
     * Genera un string JSON de los datos de la cuenta para exportar.
     */
    exportData() {
      return JSON.stringify(this.accountData, null, 2);
    },

    /**
     * Importa datos desde un string JSON, reemplazando los datos actuales.
     * @param {string} jsonString - Los datos de la cuenta en formato JSON.
     */
    importData(jsonString) {
      try {
        const newData = JSON.parse(jsonString);

        // Validación básica de la estructura
        if (newData && typeof newData === 'object' && 'version' in newData) {
          this.accountData = newData;
          this.saveDataToLocalStorage();

          // Forzar un refresco de la página para que todos los stores se recarguen
          window.location.reload();

          return { success: true };
        } else {
          return { success: false, error: 'El archivo no tiene el formato esperado.' };
        }
      } catch (error) {
        console.error('Error importando datos:', error);
        return { success: false, error: 'El archivo JSON no es válido.' };
      }
    },

    /**
     * Limpia todos los datos de la aplicación.
     */
    clearAllData() {
      // Reseteamos el estado a su valor inicial
      this.$reset();

      // Limpiamos el localStorage unificado
      localStorage.removeItem('dnd-account-data');

      // Por si acaso, limpiamos también los datos antiguos
      this.clearOldLocalStorageData();

      // Forzar recarga para un estado limpio
      window.location.reload();
    }
  }
});
