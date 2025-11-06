// src/stores/usePassiveDamageStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const usePassiveDamageStore = defineStore('passiveDamage', {
  state: () => ({
    passiveDamages: [],
  }),

  actions: {
    // Cargar daños pasivos desde localStorage
    loadPassiveDamages() {
      const data = localStorage.getItem('dnd-passive-damages-data');
      if (data) {
        try {
          const parsedDamages = JSON.parse(data);
          // Asegurar que cada entrada tenga un ID
          this.passiveDamages = parsedDamages.map(damage => ({
            ...damage,
            id: damage.id || uuidv4(),
          }));
        } catch (error) {
          console.error('Error loading passive damages from localStorage:', error);
          this.passiveDamages = [];
        }
      }
    },

    // Guardar daños pasivos en localStorage
    savePassiveDamages() {
      localStorage.setItem('dnd-passive-damages-data', JSON.stringify(this.passiveDamages));
    },

    // Crear un nuevo daño pasivo
    addPassiveDamage(damageData) {
      const newDamage = {
        ...damageData,
        id: uuidv4(),
      };
      this.passiveDamages.push(newDamage);
      this.savePassiveDamages();
    },

    // Actualizar un daño pasivo existente
    updatePassiveDamage(updatedDamage) {
      const index = this.passiveDamages.findIndex(d => d.id === updatedDamage.id);
      if (index !== -1) {
        this.passiveDamages[index] = updatedDamage;
        this.savePassiveDamages();
      }
    },

    // Eliminar un daño pasivo
    deletePassiveDamage(damageId) {
      this.passiveDamages = this.passiveDamages.filter(d => d.id !== damageId);
      this.savePassiveDamages();
    },
  },
});
