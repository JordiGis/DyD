// src/stores/useAccountStore.js
import { defineStore } from 'pinia';

export const useAccountStore = defineStore('account', {
  state: () => ({
    accountData: {
      version: 1,
      character: null,
      dm: null,
      players: null,
      attacks: null,
      passiveDamages: null,
      counters: null,
      // a_very_long_list_of_items_that_is_used_now_in_the_new_version: null,
      characterFolds: null,
      diceHistory: null,
      dmTodoItems: null,
      dmCollapsedCharacters: null,
    },

    // Indica si los datos han sido migrados
    migrationCompleted: false,
  }),

  actions: {
    // --- Lógica de unificación y migración ---

    /**
     * Carga los datos iniciales, priorizando el nuevo formato unificado.
     * Si no existe, intenta migrar los datos antiguos desde localStorage.
     */
    loadInitialData() {
      const unifiedData = localStorage.getItem('dnd-account-data');

      if (unifiedData) {
        // Si ya existen datos unificados, los cargamos
        this.accountData = JSON.parse(unifiedData);
        this.migrationCompleted = true;
      } else {
        // Si no, iniciamos el proceso de migración
        this.migrateDataFromLocalStorage();
      }
    },

    /**
     * Reúne todos los datos de los antiguos keys de localStorage,
     * los unifica en el nuevo `accountData` y limpia los datos antiguos.
     */
    migrateDataFromLocalStorage() {
      let migrationPerformed = false;

      // Función auxiliar para parsear JSON de forma segura
      const parseLocalStorage = (key) => {
        const data = localStorage.getItem(key);
        try {
          return data ? JSON.parse(data) : null;
        } catch (e) {
          console.error(`Error parsing ${key} from localStorage:`, e);
          return null;
        }
      };

      // Leemos todos los datos antiguos
      const oldCharacterData = parseLocalStorage('dnd-character-data');
      const oldDmData = parseLocalStorage('dnd-dm-data');
      const oldPlayersData = parseLocalStorage('dnd-player-data');
      const oldAttacksData = parseLocalStorage('dnd-attacks-data');
      const oldPassiveDamagesData = parseLocalStorage('dnd-passive-damages-data');
      const oldCountersData = parseLocalStorage('dnd-counters');
      const oldStatesData = parseLocalStorage('dnd-states'); // Parte de useCounterStore
      // const oldTodoListData = parseLocalStorage('a_very_long_list_of_items_that_is_used_now_in_the_new_version');
      const oldCharacterFolds = parseLocalStorage('dnd-character-folds');
      const oldDiceHistory = parseLocalStorage('dice-roller-history');
      const oldDmTodoItems = parseLocalStorage('dnd-todo-items');
      const oldDmCollapsedCharacters = parseLocalStorage('collapsedCharacters');

      // Si encontramos al menos un dato antiguo, procedemos a migrar
      if (oldCharacterData || oldDmData || oldPlayersData || oldAttacksData || oldPassiveDamagesData || oldCountersData) {
        this.accountData.character = oldCharacterData;
        this.accountData.dm = oldDmData;
        this.accountData.players = oldPlayersData;
        this.accountData.attacks = oldAttacksData;
        this.accountData.passiveDamages = oldPassiveDamagesData;

        // Combinamos counters y states como se hacía en el store original
        if (oldCountersData || oldStatesData) {
          this.accountData.counters = {
            counters: oldCountersData,
            states: oldStatesData
          };
        }

        // this.accountData.a_very_long_list_of_items_that_is_used_now_in_the_new_version = oldTodoListData;
        this.accountData.characterFolds = oldCharacterFolds;
        this.accountData.diceHistory = oldDiceHistory;
        this.accountData.dmTodoItems = oldDmTodoItems;
        this.accountData.dmCollapsedCharacters = oldDmCollapsedCharacters;

        migrationPerformed = true;
      }

      if (migrationPerformed) {
        this.saveDataToLocalStorage();
        this.clearOldLocalStorageData();
        console.log('Migración de datos a la nueva estructura completada.');
      }

      this.migrationCompleted = true;
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
