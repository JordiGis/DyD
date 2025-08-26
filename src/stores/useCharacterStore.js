// src/stores/useCharacterStore.js
import { defineStore } from 'pinia'

export const useCharacterStore = defineStore('character', {
    state: () => ({
        // Configuración del personaje
        character: {
            name: '',
            maxHp: 0,
            currentHp: 0,
            tempHp: 0,
            regeneration: 0, // Regeneración pasiva por turno
            isConfigured: false
        },
        
        // Estado del turno
        turn: {
            current: 0,
            isActive: false
        }
    }),
    
    getters: {
        // Porcentaje de vida actual
        hpPercentage: (state) => {
            if (state.character.maxHp === 0) return 0
            return (state.character.currentHp / state.character.maxHp) * 100
        },
        
        // Porcentaje de vida temporal
        tempHpPercentage: (state) => {
            if (state.character.maxHp === 0) return 0
            return (state.character.tempHp / state.character.maxHp) * 100
        },
        
        // Color de la barra de vida basado en el porcentaje
        hpBarColor: (state) => {
            const percentage = (state.character.currentHp / state.character.maxHp) * 100
            if (percentage > 75) return 'success'
            if (percentage > 50) return 'warning'
            if (percentage > 25) return 'danger'
            return 'dark'
        },
        
        // Verificar si el personaje está vivo
        isAlive: (state) => state.character.currentHp > 0,
        
        // Verificar si tiene vida temporal
        hasTempHp: (state) => state.character.tempHp > 0,
        
        // Vida total (actual + temporal)
        totalHp: (state) => state.character.currentHp + state.character.tempHp
    },
    
    actions: {
        // Configurar el personaje
        configureCharacter(name, maxHp, regeneration = 0) {
            this.character.name = name
            this.character.maxHp = maxHp
            this.character.currentHp = maxHp
            this.character.tempHp = 0
            this.character.regeneration = regeneration
            this.character.isConfigured = true
            
            // Guardar en localStorage
            this.saveToLocalStorage()
        },
        
        // Iniciar turno
        startTurn() {
            this.turn.current++
            this.turn.isActive = true
            
            // Aplicar regeneración pasiva si existe
            if (this.character.regeneration > 0) {
                this.heal(this.character.regeneration)
            }
            
            // Guardar en localStorage
            this.saveToLocalStorage()
        },
        
        // Finalizar turno
        endTurn() {
            this.turn.isActive = false
            this.saveToLocalStorage()
        },
        
        // Curar al personaje
        heal(amount) {
            const oldHp = this.character.currentHp
            this.character.currentHp = Math.min(
                this.character.maxHp, 
                this.character.currentHp + amount
            )
            
            // Solo guardar si hubo cambio
            if (oldHp !== this.character.currentHp) {
                this.saveToLocalStorage()
            }
            
            return this.character.currentHp - oldHp // Retornar cantidad curada real
        },
        
        // Agregar vida temporal
        addTempHp(amount) {
            this.character.tempHp += amount
            this.saveToLocalStorage()
        },
        
        // Recibir daño
        takeDamage(amount) {
            let remainingDamage = amount
            
            // Primero se reduce la vida temporal
            if (this.character.tempHp > 0) {
                if (this.character.tempHp >= remainingDamage) {
                    this.character.tempHp -= remainingDamage
                    remainingDamage = 0
                } else {
                    remainingDamage -= this.character.tempHp
                    this.character.tempHp = 0
                }
            }
            
            // Si aún hay daño, se reduce la vida actual
            if (remainingDamage > 0) {
                this.character.currentHp = Math.max(0, this.character.currentHp - remainingDamage)
            }
            
            this.saveToLocalStorage()
        },
        
        // Resetear personaje a vida máxima
        resetToMaxHp() {
            this.character.currentHp = this.character.maxHp
            this.character.tempHp = 0
            this.saveToLocalStorage()
        },
        
        // Resetear turno
        resetTurn() {
            this.turn.current = 0
            this.turn.isActive = false
            this.saveToLocalStorage()
        },
        
        // Guardar en localStorage
        saveToLocalStorage() {
            const data = {
                character: this.character,
                turn: this.turn
            }
            localStorage.setItem('dnd-character-data', JSON.stringify(data))
        },
        
        // Cargar desde localStorage
        loadFromLocalStorage() {
            const data = localStorage.getItem('dnd-character-data')
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    this.character = { ...this.character, ...parsed.character }
                    this.turn = { ...this.turn, ...parsed.turn }
                } catch (error) {
                    console.error('Error loading from localStorage:', error)
                }
            }
        },
        
        // Limpiar datos
        clearData() {
            this.character = {
                name: '',
                maxHp: 0,
                currentHp: 0,
                tempHp: 0,
                regeneration: 0,
                isConfigured: false
            }
            this.turn = {
                current: 0,
                isActive: false
            }
            localStorage.removeItem('dnd-character-data')
        }
    }
})
