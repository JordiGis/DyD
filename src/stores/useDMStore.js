// src/stores/useDMStore.js
import { defineStore } from 'pinia'

export const useDMStore = defineStore('dm', {
    state: () => ({
        characters: [],
        currentTurn: 0,
        isTurnActive: false
    }),
    
    getters: {
        // Obtener personajes vivos
        aliveCharacters: (state) => state.characters.filter(char => char.currentHp > 0),
        
        // Obtener personajes muertos
        deadCharacters: (state) => state.characters.filter(char => char.currentHp <= 0),
        
        // Contar personajes vivos
        aliveCount: (state) => state.aliveCharacters.length,
        
        // Contar personajes muertos
        deadCount: (state) => state.deadCharacters.length,
        
        // Obtener personaje por ID
        getCharacterById: (state) => (id) => state.characters.find(char => char.id === id),
        
        // Obtener personaje por nombre
        getCharacterByName: (state) => (name) => state.characters.find(char => char.name === name),
        
        // Personajes ordenados por HP (de menor a mayor)
        charactersByHp: (state) => [...state.characters].sort((a, b) => {
            const aHp = a.currentHp + a.tempHp
            const bHp = b.currentHp + b.tempHp
            return aHp - bHp
        }),
        
        // Personajes ordenados por nombre
        charactersByName: (state) => [...state.characters].sort((a, b) => a.name.localeCompare(b.name))
    },
    
    actions: {
        // Crear un nuevo personaje
        createCharacter(name, maxHp, regeneration = 0) {
            const character = {
                id: Date.now() + Math.random(),
                name: name.trim(),
                maxHp: parseInt(maxHp),
                currentHp: parseInt(maxHp),
                tempHp: 0,
                regeneration: parseInt(regeneration) || 0,
                isConfigured: true,
                createdAt: new Date().toISOString(),
                logs: []
            }
            
            this.characters.push(character)
            this.saveToLocalStorage()
            
            // Agregar log inicial
            this.addLogToCharacter(character.id, 'Creación', `${name} creado con ${maxHp} HP máximo${regeneration > 0 ? ` y regeneración de ${regeneration} HP/turno` : ''}`)
            
            return character
        },
        
        // Eliminar un personaje
        deleteCharacter(id) {
            const index = this.characters.findIndex(char => char.id === id)
            if (index !== -1) {
                this.characters.splice(index, 1)
                this.saveToLocalStorage()
                return true
            }
            return false
        },
        
        // Editar un personaje
        editCharacter(id, updates) {
            const character = this.getCharacterById(id)
            if (character) {
                Object.assign(character, updates)
                
                // Asegurar que los valores sean números
                if (updates.maxHp !== undefined) {
                    character.maxHp = parseInt(updates.maxHp)
                    // Si se reduce el HP máximo, ajustar el HP actual
                    if (character.currentHp > character.maxHp) {
                        character.currentHp = character.maxHp
                    }
                }
                if (updates.currentHp !== undefined) {
                    character.currentHp = Math.min(parseInt(updates.currentHp), character.maxHp)
                }
                if (updates.regeneration !== undefined) {
                    character.regeneration = parseInt(updates.regeneration) || 0
                }
                
                this.saveToLocalStorage()
                this.addLogToCharacter(id, 'Edición', 'Personaje editado')
                return true
            }
            return false
        },
        
        // Agregar log a un personaje específico
        addLogToCharacter(characterId, action, details) {
            const character = this.getCharacterById(characterId)
            if (character) {
                const logEntry = {
                    id: Date.now() + Math.random(),
                    timestamp: new Date().toLocaleTimeString(),
                    turn: this.currentTurn,
                    action,
                    details,
                    hpBefore: character.currentHp,
                    hpAfter: character.currentHp,
                    tempHpBefore: character.tempHp,
                    tempHpAfter: character.tempHp
                }
                
                character.logs.unshift(logEntry)
                
                // Mantener solo los últimos 50 logs por personaje
                if (character.logs.length > 50) {
                    character.logs = character.logs.slice(0, 50)
                }
                
                this.saveToLocalStorage()
            }
        },
        
        // Curar a un personaje
        healCharacter(characterId, amount) {
            const character = this.getCharacterById(characterId)
            if (character) {
                const oldHp = character.currentHp
                character.currentHp = Math.min(
                    character.maxHp, 
                    character.currentHp + parseInt(amount)
                )
                
                const actualHealed = character.currentHp - oldHp
                
                if (actualHealed > 0) {
                    this.addLogToCharacter(characterId, 'Curación', `+${actualHealed} HP (${oldHp} → ${character.currentHp})`)
                }
                
                this.saveToLocalStorage()
                return actualHealed
            }
            return 0
        },
        
        // Agregar vida temporal a un personaje
        addTempHpToCharacter(characterId, amount) {
            const character = this.getCharacterById(characterId)
            if (character) {
                const oldTempHp = character.tempHp
                character.tempHp += parseInt(amount)
                
                this.addLogToCharacter(characterId, 'Vida Temporal', `+${amount} HP temporal (${oldTempHp} → ${character.tempHp})`)
                this.saveToLocalStorage()
                
                return character.tempHp
            }
            return 0
        },
        
        // Hacer daño a un personaje
        damageCharacter(characterId, amount) {
            const character = this.getCharacterById(characterId)
            if (character) {
                let remainingDamage = parseInt(amount)
                const oldHp = character.currentHp
                const oldTempHp = character.tempHp
                
                // Primero se reduce la vida temporal
                if (character.tempHp > 0) {
                    if (character.tempHp >= remainingDamage) {
                        character.tempHp -= remainingDamage
                        remainingDamage = 0
                    } else {
                        remainingDamage -= character.tempHp
                        character.tempHp = 0
                    }
                }
                
                // Si aún hay daño, se reduce la vida actual
                if (remainingDamage > 0) {
                    character.currentHp = Math.max(0, character.currentHp - remainingDamage)
                }
                
                // Agregar log de daño
                let damageDetails = `-${amount} HP`
                if (oldTempHp > 0) {
                    damageDetails += ` | Vida temporal: ${oldTempHp} → ${character.tempHp}`
                }
                damageDetails += ` | HP actual: ${oldHp} → ${character.currentHp}`
                
                this.addLogToCharacter(characterId, 'Daño Recibido', damageDetails)
                this.saveToLocalStorage()
                
                return {
                    damageDealt: amount,
                    remainingHp: character.currentHp,
                    remainingTempHp: character.tempHp
                }
            }
            return null
        },
        
        // Resetear personaje a vida máxima
        resetCharacterToMaxHp(characterId) {
            const character = this.getCharacterById(characterId)
            if (character) {
                const oldHp = character.currentHp
                const oldTempHp = character.tempHp
                
                character.currentHp = character.maxHp
                character.tempHp = 0
                
                this.addLogToCharacter(characterId, 'Reset HP', `HP restaurado al máximo (${oldHp} → ${character.maxHp}) | Vida temporal eliminada (${oldTempHp} → 0)`)
                this.saveToLocalStorage()
                
                return true
            }
            return false
        },
        
        // Iniciar turno (afecta a todos los personajes)
        startTurn() {
            this.currentTurn++
            this.isTurnActive = true
            
            // Aplicar regeneración a todos los personajes
            this.characters.forEach(character => {
                if (character.regeneration > 0 && character.currentHp > 0) {
                    const oldHp = character.currentHp
                    character.currentHp = Math.min(
                        character.maxHp,
                        character.currentHp + character.regeneration
                    )
                    
                    const actualHealed = character.currentHp - oldHp
                    if (actualHealed > 0) {
                        this.addLogToCharacter(character.id, 'Regeneración Automática', `+${actualHealed} HP (${oldHp} → ${character.currentHp})`)
                    }
                }
                
                // Agregar log de inicio de turno
                this.addLogToCharacter(character.id, 'Inicio de Turno', `Turno ${this.currentTurn} iniciado`)
            })
            
            this.saveToLocalStorage()
        },
        
        // Finalizar turno
        endTurn() {
            this.isTurnActive = false
            
            // Agregar log de fin de turno a todos los personajes
            this.characters.forEach(character => {
                this.addLogToCharacter(character.id, 'Fin de Turno', `Turno ${this.currentTurn} finalizado`)
            })
            
            this.saveToLocalStorage()
        },
        
        // Resetear todos los turnos
        resetAllTurns() {
            const oldTurn = this.currentTurn
            this.currentTurn = 0
            this.isTurnActive = false
            
            // Agregar log de reset a todos los personajes
            this.characters.forEach(character => {
                this.addLogToCharacter(character.id, 'Reset Turno', `Contador de turnos reiniciado (${oldTurn} → 0)`)
            })
            
            this.saveToLocalStorage()
        },
        
        // Resetear todos los personajes a vida máxima
        resetAllCharacters() {
            this.characters.forEach(character => {
                this.resetCharacterToMaxHp(character.id)
            })
        },
        
        // Limpiar todos los logs
        clearAllLogs() {
            this.characters.forEach(character => {
                character.logs = []
            })
            this.saveToLocalStorage()
        },
        
        // Importar personajes desde JSON
        importCharacters(jsonData) {
            try {
                const data = JSON.parse(jsonData)
                if (Array.isArray(data.characters)) {
                    this.characters = data.characters
                    this.currentTurn = data.currentTurn || 0
                    this.isTurnActive = data.isTurnActive || false
                    this.saveToLocalStorage()
                    return true
                }
                return false
            } catch (error) {
                console.error('Error importing characters:', error)
                return false
            }
        },
        
        // Exportar personajes a JSON
        exportCharacters() {
            const data = {
                characters: this.characters,
                currentTurn: this.currentTurn,
                isTurnActive: this.isTurnActive,
                exportedAt: new Date().toISOString()
            }
            return JSON.stringify(data, null, 2)
        },
        
        // Guardar en localStorage
        saveToLocalStorage() {
            const data = {
                characters: this.characters,
                currentTurn: this.currentTurn,
                isTurnActive: this.isTurnActive
            }
            localStorage.setItem('dnd-dm-data', JSON.stringify(data))
        },
        
        // Cargar desde localStorage
        loadFromLocalStorage() {
            const data = localStorage.getItem('dnd-dm-data')
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    this.characters = parsed.characters || []
                    this.currentTurn = parsed.currentTurn || 0
                    this.isTurnActive = parsed.isTurnActive || false
                } catch (error) {
                    console.error('Error loading DM data from localStorage:', error)
                }
            }
        },
        
        // Limpiar todos los datos
        clearAllData() {
            this.characters = []
            this.currentTurn = 0
            this.isTurnActive = false
            localStorage.removeItem('dnd-dm-data')
        }
    }
})
