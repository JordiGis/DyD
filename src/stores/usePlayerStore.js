// src/stores/usePlayerStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

// Lista de contadores por defecto
const defaultCountersList = [
  "Acrobacias", "Arcanos", "Atletismo", "Engaño", "Historia",
  "Interpretación", "Intimidación", "Investigación", "Juego de Manos",
  "Medicina", "Naturaleza", "Percepción", "Perspicacia", "Persuasión",
  "Religión", "Sigilo", "Supervivencia", "Trato con Animales"
];

// Función para generar la estructura completa de contadores por defecto
const createDefaultCounters = () => {
  return defaultCountersList.map(name => ({
    id: uuidv4(),
    name: name,
    value: 0,
    step: 1, // Valor por defecto para sumar/restar
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
    loadFromLocalStorage() {
      const savedData = localStorage.getItem('dnd-player-data');
      if (savedData) {
        try {
          const loadedPlayers = JSON.parse(savedData);
          // Migración: asegurar que los jugadores viejos tengan el sistema de contadores
          this.players = loadedPlayers.map(player => {
            if (!player.counters) {
              player.counters = createDefaultCounters();
            }
            return player;
          });
        } catch (e) {
          console.error("Error loading player data from localStorage:", e);
          this.players = [];
        }
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('dnd-player-data', JSON.stringify(this.players));
    },

    addPlayer(name) {
      if (!name || !name.trim()) return;

      const newPlayer = {
        id: uuidv4(),
        name: name.trim(),
        sessionXp: 0,
        xpHistory: [],
        notes: '',
        counters: createDefaultCounters(), // Añadir contadores por defecto
      };

      this.players.push(newPlayer);
      this.saveToLocalStorage();
    },

    deletePlayer(playerId) {
      this.players = this.players.filter(p => p.id !== playerId);
      this.saveToLocalStorage();
    },

    addXpToPlayer(playerId, amount) {
      const player = this.players.find(p => p.id === playerId);
      if (player && amount > 0) {
        const xpAmount = parseInt(amount);
        player.sessionXp += xpAmount;
        player.xpHistory.push({
          amount: xpAmount,
          timestamp: new Date().toISOString(),
        });
        this.saveToLocalStorage();
      }
    },

    addXpToAllPlayers(amount) {
      if (amount > 0) {
        this.players.forEach(player => {
          this.addXpToPlayer(player.id, amount);
        });
      }
    },

    startNewSession() {
      this.players.forEach(player => {
        player.sessionXp = 0;
        player.xpHistory = [];
      });
      this.saveToLocalStorage();
    },

    removeXpFromPlayer(playerId, amount) {
      const player = this.players.find(p => p.id === playerId);
      if (player && amount > 0) {
        const xpAmount = parseInt(amount);
        player.sessionXp -= xpAmount;
        player.xpHistory.push({
          amount: -xpAmount,
          timestamp: new Date().toISOString(),
        });
        this.saveToLocalStorage();
      }
    },

    editPlayer(playerId, updates) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        Object.assign(player, updates);
        this.saveToLocalStorage();
      }
    },

    // --- Acciones para Contadores ---

    addCounter(playerId, counterData) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        const newCounter = {
          id: uuidv4(),
          name: counterData.name || 'Nuevo Contador',
          value: counterData.value || 0,
          step: counterData.step || 1,
          isVisible: true,
        };
        player.counters.push(newCounter);
        this.saveToLocalStorage();
      }
    },

    editCounter(playerId, counterId, updates) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        const counter = player.counters.find(c => c.id === counterId);
        if (counter) {
          Object.assign(counter, updates);
          this.saveToLocalStorage();
        }
      }
    },

    deleteCounter(playerId, counterId) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        player.counters = player.counters.filter(c => c.id !== counterId);
        this.saveToLocalStorage();
      }
    },

    updateCounterValue(playerId, counterId, change) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        const counter = player.counters.find(c => c.id === counterId);
        if (counter) {
          counter.value += change;
          this.saveToLocalStorage();
        }
      }
    },
  },
});
