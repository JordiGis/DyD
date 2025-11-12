// src/stores/usePlayerStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    players: [],
  }),

  getters: {
    /**
     * Calcula los 3 valores de XP más usados en todas las sesiones de los jugadores.
     * Devuelve un array de números ordenados por frecuencia.
     */
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
    /**
     * Carga los jugadores desde el localStorage.
     */
    loadFromLocalStorage() {
      const savedData = localStorage.getItem('dnd-player-data');
      if (savedData) {
        try {
          this.players = JSON.parse(savedData);
        } catch (e) {
          console.error("Error loading player data from localStorage:", e);
          this.players = [];
        }
      }
    },

    /**
     * Guarda el estado actual de los jugadores en el localStorage.
     */
    saveToLocalStorage() {
      localStorage.setItem('dnd-player-data', JSON.stringify(this.players));
    },

    /**
     * Añade un nuevo jugador a la lista.
     * @param {string} name - El nombre del jugador.
     */
    addPlayer(name) {
      if (!name || !name.trim()) return;

      const newPlayer = {
        id: uuidv4(),
        name: name.trim(),
        sessionXp: 0,
        xpHistory: [], // [{ amount: 5, timestamp: '...' }, ...]
      };

      this.players.push(newPlayer);
      this.saveToLocalStorage();
    },

    /**
     * Elimina un jugador por su ID.
     * @param {string} playerId - El ID del jugador a eliminar.
     */
    deletePlayer(playerId) {
      this.players = this.players.filter(p => p.id !== playerId);
      this.saveToLocalStorage();
    },

    /**
     * Añade una cantidad de XP a un jugador específico.
     * @param {string} playerId - El ID del jugador.
     * @param {number} amount - La cantidad de XP a añadir.
     */
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

    /**
     * Añade una cantidad de XP a todos los jugadores.
     * @param {number} amount - La cantidad de XP a añadir.
     */
    addXpToAllPlayers(amount) {
      if (amount > 0) {
        this.players.forEach(player => {
          this.addXpToPlayer(player.id, amount);
        });
      }
    },

    /**
     * Resetea la XP de la sesión de todos los jugadores.
     */
    startNewSession() {
      this.players.forEach(player => {
        player.sessionXp = 0;
        player.xpHistory = [];
      });
      this.saveToLocalStorage();
    },

    /**
     * Resta una cantidad de XP a un jugador específico.
     * @param {string} playerId - El ID del jugador.
     * @param {number} amount - La cantidad de XP a restar.
     */
    removeXpFromPlayer(playerId, amount) {
      const player = this.players.find(p => p.id === playerId);
      if (player && amount > 0) {
        const xpAmount = parseInt(amount);
        player.sessionXp -= xpAmount;
        // Opcional: registrar la resta en el historial
        player.xpHistory.push({
          amount: -xpAmount,
          timestamp: new Date().toISOString(),
        });
        this.saveToLocalStorage();
      }
    },

    /**
     * Edita los datos de un jugador.
     * @param {string} playerId - El ID del jugador a editar.
     * @param {object} updates - Un objeto con los campos a actualizar.
     */
    editPlayer(playerId, updates) {
      const player = this.players.find(p => p.id === playerId);
      if (player) {
        Object.assign(player, updates);
        this.saveToLocalStorage();
      }
    },
  },
});
