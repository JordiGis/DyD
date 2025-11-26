// src/stores/usePlayerStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore'; // Importar el store de la cuenta

// Lista de contadores por defecto
const defaultCountersList = [
  "Acrobacias", "Arcanos", "Atletismo", "Engaño", "Historia",
  "Interpretación", "Intimidación", "Investigación", "Juego de Manos",
  "Medicina", "Naturaleza", "Percepción", "Perspicacia", "Persuasión",
  "Religión", "Sigilo", "Supervivencia", "Trato con Animales"
];

const createDefaultCounters = () => {
  return defaultCountersList.map(name => ({
    id: uuidv4(),
    name: name,
    value: 0,
    step: 1,
    isVisible: true,
  }));
};

export const usePlayerStore = defineStore('player', {
  state: () => ({
    players: [],
  }),

  getters: {
    mostUsedXpValues: (state) => {
      const xpCounts = state.players
        .flatMap(p => p.xpHistory || [])
        .reduce((acc, entry) => {
          acc[entry.amount] = (acc[entry.amount] || 0) + 1;
          return acc;
        }, {});

      return Object.entries(xpCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3)
        .map(([amount]) => parseInt(amount));
    },
  },

  actions: {
    loadData() {
      const accountStore = useAccountStore();
      const savedData = accountStore.getSection('players');
      if (savedData) {
        // Migración: asegurar que los jugadores viejos tengan el sistema de contadores y compañeros
        this.players = savedData.map(player => ({
          ...player,
          counters: player.counters || createDefaultCounters(),
          companions: player.companions || [],
        }));
      }
    },

    saveData() {
      const accountStore = useAccountStore();
      accountStore.updateSection('players', this.players);
    },

    addPlayer(name) {
      if (!name || !name.trim()) return;

      const newPlayer = {
        id: uuidv4(),
        name: name.trim(),
        sessionXp: 0,
        xpHistory: [],
        notes: '',
        counters: createDefaultCounters(),
        companions: [],
      };

      this.players.push(newPlayer);
      this.saveData();
    },

    deletePlayer(playerId) {
      this.players = this.players.filter(p => p.id !== playerId);
      this.saveData();
    },

    addXpToPlayer(playerId, amount) {
      const player = this.players.find(p => p.id === playerId);
      if (player && amount > 0) {
        player.sessionXp = (player.sessionXp || 0) + parseInt(amount);
        if (!player.xpHistory) player.xpHistory = [];
        player.xpHistory.push({
          amount: parseInt(amount),
          timestamp: new Date().toISOString(),
        });
        this.saveData();
      }
    },

    addXpToAllPlayers(amount) {
      if (amount > 0) {
        this.players.forEach(player => this.addXpToPlayer(player.id, amount));
      }
    },

    startNewSession() {
      this.players.forEach(player => {
        player.sessionXp = 0;
        player.xpHistory = [];
      });
      this.saveData();
    },

    removeXpFromPlayer(playerId, amount) {
      const player = this.players.find(p => p.id === playerId);
      if (player && amount > 0) {
        player.sessionXp -= parseInt(amount);
        player.xpHistory.push({
          amount: -parseInt(amount),
          timestamp: new Date().toISOString(),
        });
        this.saveData();
      }
    },

    editPlayer(playerId, updates) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        Object.assign(player, updates);
        this.saveData();
      }
    },

    // --- Acciones para Contadores ---

    _getPlayer(playerId) {
      return this.players.find(p => p.id === playerId);
    },

    addCounter(playerId, counterData) {
      const player = this._getPlayer(playerId);
      if (player) {
        player.counters.push({
          id: uuidv4(),
          name: counterData.name || 'Nuevo Contador',
          value: counterData.value || 0,
          step: counterData.step || 1,
          isVisible: true,
        });
        this.saveData();
      }
    },

    editCounter(playerId, counterId, updates) {
      const player = this._getPlayer(playerId);
      const counter = player?.counters.find(c => c.id === counterId);
      if (counter) {
        Object.assign(counter, updates);
        this.saveData();
      }
    },

    deleteCounter(playerId, counterId) {
      const player = this._getPlayer(playerId);
      if (player) {
        player.counters = player.counters.filter(c => c.id !== counterId);
        this.saveData();
      }
    },

    updateCounterValue(playerId, counterId, change) {
      const player = this._getPlayer(playerId);
      const counter = player?.counters.find(c => c.id === counterId);
      if (counter) {
        counter.value += change;
        this.saveData();
      }
    },

    // --- Acciones para Compañeros ---

    addCompanion(playerId, companionData) {
      const player = this._getPlayer(playerId);
      if (player) {
        if (!player.companions) {
          player.companions = [];
        }
        const newCompanion = {
          id: uuidv4(),
          name: companionData.name || 'New Companion',
          notes: companionData.notes || '',
          image: companionData.image || null,
        };
        player.companions.push(newCompanion);
        this.saveData();
      }
    },

    editCompanion(playerId, companionId, updates) {
      const player = this._getPlayer(playerId);
      if (player && player.companions) {
        const companion = player.companions.find(c => c.id === companionId);
        if (companion) {
          Object.assign(companion, updates);
          this.saveData();
        }
      }
    },

    deleteCompanion(playerId, companionId) {
      const player = this._getPlayer(playerId);
      if (player && player.companions) {
        player.companions = player.companions.filter(c => c.id !== companionId);
        this.saveData();
      }
    },
  },
});
