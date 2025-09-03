// src/stores/useCharacterStore.js
import { defineStore } from 'pinia'

export const useCharacterStore = defineStore('character', {
    state: () => ({
        // Configuración del personaje
        character: {
            name: '',
            maxHp: 0,
            originalMaxHp: 0, // HP máximo original para daño necro
            currentHp: 0,
            tempHp: 0,
            regeneration: 0, // Regeneración pasiva por turno
            isConfigured: false
        },
        
        // Estado del turno
        turn: {
            current: 0,
            isActive: false
        },
        
        // Sistema de logs
        logs: []
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
        totalHp: (state) => state.character.currentHp + state.character.tempHp,
        
        // Logs agrupados por turno
        logsByTurn: (state) => {
            const grouped = {}
            state.logs.forEach(log => {
                if (!grouped[log.turn]) {
                    grouped[log.turn] = []
                }
                grouped[log.turn].push(log)
            })
            return grouped
        },
        
        // Logs del turno actual
        currentTurnLogs: (state) => {
            return state.logs.filter(log => log.turn === state.turn.current)
        }
    },
    
    actions: {
        // Agregar log
        addLog(action, details, turn = null) {
            const logEntry = {
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                turn: turn !== null ? turn : this.turn.current,
                action,
                details,
                hpBefore: this.character.currentHp,
                hpAfter: this.character.currentHp,
                tempHpBefore: this.character.tempHp,
                tempHpAfter: this.character.tempHp
            }
            
            this.logs.unshift(logEntry)
            
            // Mantener solo los últimos 100 logs para evitar sobrecarga
            if (this.logs.length > 100) {
                this.logs = this.logs.slice(0, 100)
            }
        },
        
        // Configurar el personaje
        configureCharacter(name, maxHp, regeneration = 0) {
            this.character.name = name
            this.character.maxHp = maxHp
            this.character.originalMaxHp = maxHp // Guardar el HP máximo original
            this.character.currentHp = maxHp
            this.character.tempHp = 0
            this.character.regeneration = regeneration
            this.character.isConfigured = true
            
            // Agregar log de configuración
            this.addLog('Configuración', `${name} configurado con ${maxHp} HP máximo${regeneration > 0 ? ` y regeneración de ${regeneration} HP/turno` : ''}`, 0)
            
            // Guardar en localStorage
            this.saveToLocalStorage()
        },
        
        // Iniciar turno
        startTurn() {
            this.turn.current++
            this.turn.isActive = true
            
            // Agregar log de inicio de turno
            this.addLog('Inicio de Turno', `Turno ${this.turn.current} iniciado`, this.turn.current)
            
            // Aplicar regeneración pasiva si existe
            if (this.character.regeneration > 0) {
                const oldHp = this.character.currentHp
                const oldMaxHp = this.character.maxHp
                let maxHpRestored = 0
                
                // Si hay daño necro (maxHp < originalMaxHp), usar regeneración para restaurar maxHp
                if (this.character.maxHp < this.character.originalMaxHp) {
                    const maxHpNeeded = this.character.originalMaxHp - this.character.maxHp
                    const maxHpToRestore = Math.min(this.character.regeneration, maxHpNeeded)
                    
                    if (maxHpToRestore > 0) {
                        this.character.maxHp = Math.min(this.character.originalMaxHp, this.character.maxHp + maxHpToRestore)
                        maxHpRestored = this.character.maxHp - oldMaxHp
                    }
                }
                
                // SIEMPRE curar HP actual con TODA la regeneración (incluyendo la que se usó para max HP)
                this.character.currentHp = Math.min(
                    this.character.maxHp,
                    this.character.currentHp + this.character.regeneration
                )
                
                const actualHealed = this.character.currentHp - oldHp
                
                // Crear mensaje de log detallado
                let logMessage = ''
                if (maxHpRestored > 0 && actualHealed > 0) {
                    logMessage = `+${actualHealed} HP (${oldHp} → ${this.character.currentHp}) | HP máximo restaurado: +${maxHpRestored} (${oldMaxHp} → ${this.character.maxHp})`
                } else if (maxHpRestored > 0) {
                    logMessage = `HP máximo restaurado: +${maxHpRestored} (${oldMaxHp} → ${this.character.maxHp})`
                } else if (actualHealed > 0) {
                    logMessage = `+${actualHealed} HP (${oldHp} → ${this.character.currentHp})`
                }
                
                if (logMessage) {
                    this.addLog('Regeneración Automática', logMessage)
                }
            }
            
            // Guardar en localStorage
            this.saveToLocalStorage()
        },
        
        // Finalizar turno
        endTurn() {
            this.turn.isActive = false
            
            // Agregar log de fin de turno
            this.addLog('Fin de Turno', `Turno ${this.turn.current} finalizado`, this.turn.current)
            
            this.saveToLocalStorage()
        },
        
        // Curar al personaje
        heal(amount, isAutoRegeneration = false) {
            const oldHp = this.character.currentHp
            this.character.currentHp = Math.min(
                this.character.maxHp, 
                this.character.currentHp + amount
            )
            
            const actualHealed = this.character.currentHp - oldHp
            
            // Agregar log de curación
            if (actualHealed > 0) {
                const actionType = isAutoRegeneration ? 'Regeneración Automática' : 'Curación'
                this.addLog(actionType, `+${actualHealed} HP (${oldHp} → ${this.character.currentHp})`)
            }
            
            // Solo guardar si hubo cambio
            if (oldHp !== this.character.currentHp) {
                this.saveToLocalStorage()
            }
            
            return actualHealed
        },
        
        // Agregar vida temporal
        addTempHp(amount) {
            const oldTempHp = this.character.tempHp
            this.character.tempHp += amount
            
            // Agregar log de vida temporal
            this.addLog('Vida Temporal', `+${amount} HP temporal (${oldTempHp} → ${this.character.tempHp})`)
            
            this.saveToLocalStorage()
        },
        
        // Recibir daño
        takeDamage(amount, isNecroDamage = false) {
            let remainingDamage = amount
            const oldHp = this.character.currentHp
            const oldTempHp = this.character.tempHp
            const oldMaxHp = this.character.maxHp
            
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
                
                // Si es daño necro, también reduce la vida máxima
                if (isNecroDamage) {
                    this.character.maxHp = Math.max(1, this.character.maxHp - remainingDamage)
                }
            }
            
            // Agregar log de daño
            let damageDetails = `-${amount} HP`
            if (isNecroDamage) {
                damageDetails += ' (Necro)'
            }
            if (oldTempHp > 0) {
                damageDetails += ` | Vida temporal: ${oldTempHp} → ${this.character.tempHp}`
            }
            damageDetails += ` | HP actual: ${oldHp} → ${this.character.currentHp}`
            if (isNecroDamage && oldMaxHp !== this.character.maxHp) {
                damageDetails += ` | HP máximo: ${oldMaxHp} → ${this.character.maxHp}`
            }
            
            this.addLog('Daño Recibido', damageDetails)
            
            this.saveToLocalStorage()
        },
        
        // Resetear personaje a vida máxima
        resetToMaxHp() {
            const oldHp = this.character.currentHp
            const oldTempHp = this.character.tempHp
            const oldMaxHp = this.character.maxHp
            
            // Restaurar HP actual y máximo al valor original
            this.character.currentHp = this.character.originalMaxHp
            this.character.maxHp = this.character.originalMaxHp
            this.character.tempHp = 0
            
            // Agregar log de reset
            this.addLog('Reset HP', `HP restaurado al máximo original (${oldHp} → ${this.character.originalMaxHp}) | HP máximo restaurado (${oldMaxHp} → ${this.character.originalMaxHp}) | Vida temporal eliminada (${oldTempHp} → 0)`)
            
            this.saveToLocalStorage()
        },
        
        // Revivir al personaje muerto (puede elegir HP)
        revive(hp = 1) {
            if (this.character.currentHp <= 0) {
                const oldHp = this.character.currentHp
                // No puede revivir con más de su vida máxima
                const reviveHp = Math.min(parseInt(hp) || 1, this.character.maxHp)
                this.character.currentHp = reviveHp
                this.character.tempHp = 0
                // Agregar log de revivir
                this.addLog('Revivir', `Personaje revivido de la muerte (${oldHp} → ${reviveHp} HP)`)
                this.saveToLocalStorage()
                return true
            }
            return false
        },
        
        // Resetear turno
        resetTurn() {
            const oldTurn = this.turn.current
            
            this.turn.current = 0
            this.turn.isActive = false
            
            // Agregar log de reset de turno
            this.addLog('Reset Turno', `Contador de turnos reiniciado (${oldTurn} → 0)`)
            
            this.saveToLocalStorage()
        },
        
        // Limpiar logs (solo al resetear todo)
        clearLogs() {
            this.logs = []
        },
        
        // Limpiar todos los logs y guardar en localStorage
        clearAllLogs() {
            this.logs = []
            this.saveToLocalStorage()
        },
        
        // Guardar en localStorage
        saveToLocalStorage() {
            const data = {
                character: this.character,
                turn: this.turn,
                logs: this.logs
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
                    
                    // Si no existe originalMaxHp, establecerlo igual a maxHp (para compatibilidad con datos existentes)
                    if (this.character.originalMaxHp === undefined) {
                        this.character.originalMaxHp = this.character.maxHp
                    }
                    
                    this.turn = { ...this.turn, ...parsed.turn }
                    this.logs = parsed.logs || []
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
                originalMaxHp: 0,
                currentHp: 0,
                tempHp: 0,
                regeneration: 0,
                isConfigured: false
            }
            this.turn = {
                current: 0,
                isActive: false
            }
            this.clearLogs()
            localStorage.removeItem('dnd-character-data')
        }
    }
})
