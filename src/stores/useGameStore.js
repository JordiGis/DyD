// src/stores/useGameStore.js
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
    state: () => ({
        // Estado del personaje
        character: {
            name: 'Escanor',
            currentHp: 246,
            maxHp: 246,
            furyCount: 0,
            maxFury: 3,
            isFuryActive: false,
            currentState: 'noche', // noche, amanecer, dia, cenit
        },
        
        // Resistencias cuando tiene furia activa
        furyResistances: [
            'bludgeoning',
            'piercing', 
            'slashing'
        ],
        
        // Estados del personaje y sus modificadores
        characterStates: {
            noche: {
                name: 'Noche',
                description: 'Estado más débil',
                color: '#1a1a2e',
                image: 'EscanorNoche.png'
            },
            amanecer: {
                name: 'Amanecer',
                description: 'Despertar del poder',
                color: '#ff6b35',
                image: 'Escanor.png'
            },
            dia: {
                name: 'Día',
                description: 'Poder creciente',
                color: '#ffd700',
                image: 'EscanorFinaly.png'
            },
            cenit: {
                name: 'El Cenit (The One)',
                description: 'Poder absoluto',
                color: '#ff0000',
                image: 'TheOne.png'
            }
        }
    }),
    
    getters: {
        // Getters calculados
        hpPercentage: (state) => (state.character.currentHp / state.character.maxHp) * 100,
        canActivateFury: (state) => state.character.furyCount > 0 && !state.character.isFuryActive,
        furyCountDisplay: (state) => `${state.character.furyCount}/${state.character.maxFury}`,
        currentStateData: (state) => state.characterStates[state.character.currentState],
        isAlive: (state) => state.character.currentHp > 0,
        hpBarColor: (state) => {
            const percentage = (state.character.currentHp / state.character.maxHp) * 100
            if (percentage > 75) return 'success'
            if (percentage > 50) return 'warning'
            if (percentage > 25) return 'danger'
            return 'dark'
        }
    },
    
    actions: {
        // Gestión de vida
        takeDamage(amount) {
            this.character.currentHp = Math.max(0, this.character.currentHp - amount)
        },
        
        heal(amount) {
            this.character.currentHp = Math.min(this.character.maxHp, this.character.currentHp + amount)
        },
        
        setHp(value) {
            this.character.currentHp = Math.max(0, Math.min(this.character.maxHp, value))
        },
        
        // Gestión de furia
        addFury() {
            if (this.character.furyCount < this.character.maxFury) {
                this.character.furyCount++
            }
        },
        
        removeFury() {
            if (this.character.furyCount > 0) {
                this.character.furyCount--
                if (this.character.furyCount === 0) {
                    this.character.isFuryActive = false
                }
            }
        },
        
        resetFury() {
            this.character.furyCount = this.character.maxFury
        },
        
        activateFury() {
            if (this.canActivateFury) {
                this.character.isFuryActive = true
            }
        },
        
        deactivateFury() {
            this.character.isFuryActive = false
        },
        
        // Gestión de estados
        changeState(newState) {
            if (this.characterStates[newState]) {
                this.character.currentState = newState
            }
        },
        
        // Resetear todo
        resetCharacter() {
            this.character.currentHp = this.character.maxHp
            this.character.furyCount = this.character.maxFury
            this.character.isFuryActive = false
            this.character.currentState = 'noche'
        }
    }
})
