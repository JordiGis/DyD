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
          const parsedAttacks = JSON.parse(data);

          // Migración de datos para el nuevo formato de lifeSteal
          const migratedAttacks = parsedAttacks.map(attack => {
            let needsSave = false;
            // Si existe un lifeSteal a nivel de ataque, es el formato antiguo
            if (attack.lifeSteal && attack.lifeSteal.percentage > 0) {
              attack.damageRolls.forEach(roll => {
                // Solo añadir si no existe ya para no sobrescribir
                if (!roll.lifeSteal) {
                  roll.lifeSteal = { percentage: attack.lifeSteal.percentage };
                }
              });
              delete attack.lifeSteal; // Eliminar el obsoleto
              needsSave = true;
            }

            // Asegurarse de que todos los rollos tengan la propiedad lifeSteal
            attack.damageRolls.forEach(roll => {
              if (!roll.lifeSteal) {
                roll.lifeSteal = { percentage: 0 };
                needsSave = true;
              }
            });

            return attack;
          });

          this.attacks = migratedAttacks;

          // Si se hizo alguna migración, guardar de nuevo para actualizar el formato en localStorage
          if (migratedAttacks.some(attack => !parsedAttacks.includes(attack))) {
              this.saveAttacks();
          }

        } catch (error) {
          console.error('Error loading or migrating attacks from localStorage:', error);
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
      const index = this.attacks.findIndex(a => a.id === attackId);
      if (index !== -1) {
        this.attacks.splice(index, 1);
        this.saveAttacks();
      }
    },

    // Obtener un ataque por su ID
    getAttackById(attackId) {
      return this.attacks.find(a => a.id === attackId);
    },
  },
});
