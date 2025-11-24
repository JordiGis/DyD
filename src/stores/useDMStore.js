// src/stores/useDMStore.js
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid';

export const useDMStore = defineStore('dm', {
    state: () => ({
        characters: [],
        currentTurn: 0,
        isTurnActive: false,
        criticalHit: {
            rule: 'default', // 'default' o 'dad'
            characterLevel: 1,
        },
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
        createCharacter(name, maxHp, regeneration = 0, xp = '', resistencias = '', inmunidades = '', fuerza = '', destreza = '', constitucion = '', inteligencia = '', sabiduria = '', carisma = '', notas = '', ca = '') {
            const character = {
                id: Date.now() + Math.random(),
                name: name.trim(),
                maxHp: parseInt(maxHp),
                originalMaxHp: parseInt(maxHp), // Guardar el HP máximo original
                currentHp: parseInt(maxHp),
                tempHp: 0,
                regeneration: parseInt(regeneration) || 0,
                xp: xp,
                resistencias: resistencias,
                inmunidades: inmunidades,
                fuerza: fuerza,
                destreza: destreza,
                constitucion: constitucion,
                inteligencia: inteligencia,
                sabiduria: sabiduria,
                carisma: carisma,
                notas: notas,
                ca: ca,
                isConfigured: true,
                createdAt: new Date().toISOString(),
                logs: [],
                defeatedBy: null, // Nombre del héroe que lo derrotó
                attacks: [] // Array para almacenar los ataques del personaje
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
                    const newMaxHp = parseInt(updates.maxHp)
                    const oldMaxHp = character.maxHp
                    character.maxHp = newMaxHp
                    
                    // Si se reduce el HP máximo, ajustar el HP actual
                    if (character.currentHp > character.maxHp) {
                        character.currentHp = character.maxHp
                    }
                    
                    // Si se aumenta el HP máximo, también actualizar originalMaxHp para mantener la referencia
                    if (newMaxHp > character.originalMaxHp) {
                        character.originalMaxHp = newMaxHp
                    }
                }
                if (updates.currentHp !== undefined) {
                    character.currentHp = Math.min(parseInt(updates.currentHp), character.maxHp)
                }
                if (updates.regeneration !== undefined) {
                    character.regeneration = parseInt(updates.regeneration) || 0
                }
                if (updates.xp !== undefined) {
                    character.xp = updates.xp
                }
                if (updates.resistencias !== undefined) {
                    character.resistencias = updates.resistencias
                }
                if (updates.inmunidades !== undefined) {
                    character.inmunidades = updates.inmunidades
                }
                if (updates.bonoTiradasSalvacion !== undefined) {
                    character.bonoTiradasSalvacion = updates.bonoTiradasSalvacion
                }
                if (updates.notas !== undefined) {
                    character.notas = updates.notas
                }
                if (updates.fuerza !== undefined) {
                    character.fuerza = updates.fuerza
                }
                if (updates.destreza !== undefined) {
                    character.destreza = updates.destreza
                }
                if (updates.constitucion !== undefined) {
                    character.constitucion = updates.constitucion
                }
                if (updates.inteligencia !== undefined) {
                    character.inteligencia = updates.inteligencia
                }
                if (updates.sabiduria !== undefined) {
                    character.sabiduria = updates.sabiduria
                }
                if (updates.carisma !== undefined) {
                    character.carisma = updates.carisma
                }
                if (updates.ca !== undefined) {
                    character.ca = updates.ca
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
        damageCharacter(characterId, amount, isNecroDamage = false) {
            const character = this.getCharacterById(characterId)
            if (character) {
                let remainingDamage = parseInt(amount)
                const oldHp = character.currentHp
                const oldTempHp = character.tempHp
                const oldMaxHp = character.maxHp
                
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
                    
                    // Si es daño necro, también reduce la vida máxima
                    if (isNecroDamage) {
                        character.maxHp = Math.max(1, character.maxHp - remainingDamage)
                    }
                }
                
                // Agregar log de daño
                let damageDetails = `-${amount} HP`
                if (isNecroDamage) {
                    damageDetails += ' (Necro)'
                }
                if (oldTempHp > 0) {
                    damageDetails += ` | Vida temporal: ${oldTempHp} → ${character.tempHp}`
                }
                damageDetails += ` | HP actual: ${oldHp} → ${character.currentHp}`
                if (isNecroDamage && oldMaxHp !== character.maxHp) {
                    damageDetails += ` | HP máximo: ${oldMaxHp} → ${character.maxHp}`
                }
                
                this.addLogToCharacter(characterId, 'Daño Recibido', damageDetails)
                this.saveToLocalStorage()
                
                return {
                    damageDealt: amount,
                    remainingHp: character.currentHp,
                    remainingTempHp: character.tempHp,
                    maxHpReduced: isNecroDamage ? oldMaxHp - character.maxHp : 0
                }
            }
            return null
        },
        
        // Registrar el héroe que derrotó a un personaje
        setDefeatedBy(characterId, heroName) {
            const character = this.getCharacterById(characterId)
            if (character) {
                character.defeatedBy = heroName
                this.saveToLocalStorage()
                return true
            }
            return false
        },
        
        // Resetear personaje a vida máxima
        resetCharacterToMaxHp(characterId) {
            const character = this.getCharacterById(characterId)
            if (character) {
                const oldHp = character.currentHp
                const oldTempHp = character.tempHp
                const oldMaxHp = character.maxHp
                const oldDefeatedBy = character.defeatedBy
                
                character.currentHp = character.originalMaxHp
                character.maxHp = character.originalMaxHp
                character.tempHp = 0
                character.defeatedBy = null // Eliminar el nombre del héroe al resetear
                
                this.addLogToCharacter(characterId, 'Reset HP', `HP restaurado al máximo original (${oldHp} → ${character.originalMaxHp}) | HP máximo restaurado (${oldMaxHp} → ${character.originalMaxHp}) | Vida temporal eliminada (${oldTempHp} → 0)${oldDefeatedBy ? ` | Héroe eliminado: ${oldDefeatedBy}` : ''}`)
                this.saveToLocalStorage()
                
                return true
            }
            return false
        },
        
        // Revivir a un personaje muerto (puede elegir HP)
        reviveCharacter(characterId, hp = 1) {
            const character = this.getCharacterById(characterId)
            if (character && character.currentHp <= 0) {
                const oldHp = character.currentHp
                const oldDefeatedBy = character.defeatedBy
                // No puede revivir con más de su vida máxima
                const reviveHp = Math.min(parseInt(hp) || 1, character.maxHp)
                character.currentHp = reviveHp
                character.tempHp = 0
                character.defeatedBy = null // Eliminar el nombre del héroe al revivir
                
                this.addLogToCharacter(characterId, 'Revivir', `Personaje revivido de la muerte (${oldHp} → ${reviveHp} HP)${oldDefeatedBy ? ` | Héroe anterior: ${oldDefeatedBy}` : ''}`)
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
                    const oldMaxHp = character.maxHp
                    let maxHpRestored = 0
                    
                    // Si hay daño necro (maxHp < originalMaxHp), usar regeneración para restaurar maxHp
                    if (character.maxHp < character.originalMaxHp) {
                        const maxHpNeeded = character.originalMaxHp - character.maxHp
                        const maxHpToRestore = Math.min(character.regeneration, maxHpNeeded)
                        
                        if (maxHpToRestore > 0) {
                            character.maxHp = Math.min(character.originalMaxHp, character.maxHp + maxHpToRestore)
                            maxHpRestored = character.maxHp - oldMaxHp
                        }
                    }
                    
                    // SIEMPRE curar HP actual con TODA la regeneración (incluyendo la que se usó para max HP)
                    character.currentHp = Math.min(
                        character.maxHp,
                        character.currentHp + character.regeneration
                    )
                    
                    const actualHealed = character.currentHp - oldHp
                    
                    // Crear mensaje de log detallado
                    let logMessage = ''
                    if (maxHpRestored > 0 && actualHealed > 0) {
                        logMessage = `+${actualHealed} HP (${oldHp} → ${character.currentHp}) | HP máximo restaurado: +${maxHpRestored} (${oldMaxHp} → ${character.maxHp})`
                    } else if (maxHpRestored > 0) {
                        logMessage = `HP máximo restaurado: +${maxHpRestored} (${oldMaxHp} → ${character.maxHp})`
                    } else if (actualHealed > 0) {
                        logMessage = `+${actualHealed} HP (${oldHp} → ${character.currentHp})`
                    }
                    
                    if (logMessage) {
                        this.addLogToCharacter(character.id, 'Regeneración Automática', logMessage)
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
            this.loadCriticalHitConfig();
            const data = localStorage.getItem('dnd-dm-data')
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    this.characters = parsed.characters || []
                    this.currentTurn = parsed.currentTurn || 0
                    this.isTurnActive = parsed.isTurnActive || false

                    // Migración para asegurar que cada personaje tenga un array de ataques
                    this.characters.forEach(character => {
                        if (!character.attacks) {
                            character.attacks = [];
                        }
                    });

                } catch (error) {
                    console.error('Error loading DM data from localStorage:', error)
                }
            }
        },
        
        duplicateCharacter(characterId) {
            const originalCharacter = this.getCharacterById(characterId);
            if (originalCharacter) {
                const duplicatedCharacter = JSON.parse(JSON.stringify(originalCharacter));

                duplicatedCharacter.id = uuidv4();
                duplicatedCharacter.createdAt = new Date().toISOString();

                let duplicatedName = `${originalCharacter.name} (Copia)`;
                let finalName = duplicatedName;
                let counter = 1;
                while (this.getCharacterByName(finalName)) {
                    finalName = `${originalCharacter.name} (Copia ${counter})`;
                    counter++;
                }
                duplicatedCharacter.name = finalName;

                this.characters.push(duplicatedCharacter);
                this.saveToLocalStorage();

                this.addLogToCharacter(duplicatedCharacter.id, 'Clonación', `Personaje clonado de ${originalCharacter.name}`);
            }
        },

        // Limpiar todos los datos
        clearAllData() {
            this.characters = []
            this.currentTurn = 0
            this.isTurnActive = false
            localStorage.removeItem('dnd-dm-data')
        },

        // --- Gestión de Configuración de Críticos ---

        loadCriticalHitConfig() {
            const data = localStorage.getItem('dnd-dm-critical-hit-config');
            if (data) {
                try {
                    const config = JSON.parse(data);
                    if (config && typeof config === 'object') {
                        this.criticalHit.rule = config.rule || 'default';
                        this.criticalHit.characterLevel = config.characterLevel || 1;
                    }
                } catch (error) {
                    console.error('Error loading critical hit config from localStorage:', error);
                }
            }
        },

        saveCriticalHitConfig() {
            localStorage.setItem('dnd-dm-critical-hit-config', JSON.stringify(this.criticalHit));
        },

        updateCriticalHitConfig(config) {
            this.criticalHit = { ...this.criticalHit, ...config };
            this.saveCriticalHitConfig();
        },

        // --- Gestión de Ataques por Personaje ---

        addAttackToCharacter(characterId, attackData) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const newAttack = {
                    ...attackData,
                    id: uuidv4(),
                };
                character.attacks.push(newAttack);
                this.saveToLocalStorage();
            }
        },

        updateAttackInCharacter(characterId, updatedAttack) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const index = character.attacks.findIndex(a => a.id === updatedAttack.id);
                if (index !== -1) {
                    character.attacks[index] = updatedAttack;
                    this.saveToLocalStorage();
                }
            }
        },

        deleteAttackFromCharacter(characterId, attackId) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const index = character.attacks.findIndex(a => a.id === attackId);
                if (index !== -1) {
                    character.attacks.splice(index, 1);
                    this.saveToLocalStorage();
                }
            }
        },

        duplicateAttackInCharacter(characterId, attackId) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const originalAttack = character.attacks.find(a => a.id === attackId);
                if (originalAttack) {
                    const duplicatedAttack = JSON.parse(JSON.stringify(originalAttack));
                    duplicatedAttack.id = uuidv4();
                    duplicatedAttack.name = `${originalAttack.name} (Copia)`;

                    const originalIndex = character.attacks.findIndex(a => a.id === attackId);
                    character.attacks.splice(originalIndex + 1, 0, duplicatedAttack);

                    this.saveToLocalStorage();
                }
            }
        },

        updateCharacterAttackOrder(characterId, newOrder) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const orderedAttacks = newOrder.map(id => character.attacks.find(a => a.id === id));
                character.attacks = orderedAttacks.filter(a => a);
                this.saveToLocalStorage();
            }
        }
    }
})
