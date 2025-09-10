// src/stores/useAttackStore.js
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';

export const useAttackStore = defineStore('attack', {
  state: () => ({
    attacks: [],
  }),

  actions: {
    // Cargar ataques desde localStorage
    loadAttacks() {
      const data = localStorage.getItem('dnd-attacks-data');
      if (data) {
        try {
          this.attacks = JSON.parse(data);
        } catch (error) {
          console.error('Error loading attacks from localStorage:', error);
          this.attacks = [];
        }
      }
    },

    // Guardar ataques en localStorage
    saveAttacks() {
      localStorage.setItem('dnd-attacks-data', JSON.stringify(this.attacks));
    },

    // Crear un nuevo ataque
    addAttack(attackData) {
      const newAttack = {
        id: uuidv4(),
        ...attackData,
      };
      this.attacks.push(newAttack);
      this.saveAttacks();
    },

    // Actualizar un ataque existente
    updateAttack(updatedAttack) {
      const index = this.attacks.findIndex(a => a.id === updatedAttack.id);
      if (index !== -1) {
        this.attacks[index] = updatedAttack;
        this.saveAttacks();
      }
    },

    // Eliminar un ataque
    deleteAttack(attackId) {
      this.attacks = this.attacks.filter(a => a.id !== attackId);
      this.saveAttacks();
    },

    // Obtener un ataque por su ID
    getAttackById(attackId) {
      return this.attacks.find(a => a.id === attackId);
    },
  },
});
