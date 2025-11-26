// src/stores/useDMStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { useAccountStore } from './useAccountStore'; // Importar el store de la cuenta

export const useDMStore = defineStore('dm', {
    state: () => ({
        characters: [],
        currentTurn: 0,
        isTurnActive: false,
        criticalHit: {
            rule: 'default',
            characterLevel: 1,
        },
    }),
    
    getters: {
        aliveCharacters: (state) => state.characters.filter(char => char.currentHp > 0),
        deadCharacters: (state) => state.characters.filter(char => char.currentHp <= 0),
        aliveCount: (state) => state.aliveCharacters.length,
        deadCount: (state) => state.deadCharacters.length,
        getCharacterById: (state) => (id) => state.characters.find(char => char.id === id),
        getCharacterByName: (state) => (name) => state.characters.find(char => char.name === name),
        charactersByHp: (state) => [...state.characters].sort((a, b) => (a.currentHp + a.tempHp) - (b.currentHp + b.tempHp)),
        charactersByName: (state) => [...state.characters].sort((a, b) => a.name.localeCompare(b.name)),
    },
    
    actions: {
        createCharacter(name, maxHp, regeneration = 0, xp = '', resistencias = '', inmunidades = '', fuerza = '', destreza = '', constitucion = '', inteligencia = '', sabiduria = '', carisma = '', notas = '', ca = '', challengeRating = 0) {
            const character = {
                id: uuidv4(),
                name: name.trim(),
                challengeRating,
                maxHp: parseInt(maxHp),
                originalMaxHp: parseInt(maxHp),
                currentHp: parseInt(maxHp),
                tempHp: 0,
                regeneration: parseInt(regeneration) || 0,
                xp, resistencias, inmunidades, fuerza, destreza, constitucion, inteligencia, sabiduria, carisma, notas, ca,
                isConfigured: true,
                createdAt: new Date().toISOString(),
                logs: [],
                defeatedBy: null,
                attacks: [],
            };
            this.characters.push(character);
            this.addLogToCharacter(character.id, 'Creación', `${name} creado con ${maxHp} HP`);
            this.saveData();
            return character;
        },
        
        deleteCharacter(id) {
            const index = this.characters.findIndex(char => char.id === id);
            if (index !== -1) {
                this.characters.splice(index, 1);
                this.saveData();
                return true;
            }
            return false;
        },
        
        editCharacter(id, updates) {
            const character = this.getCharacterById(id);
            if (character) {
                Object.assign(character, updates);
                // Asegurar que valores numéricos clave sean números
                if (updates.maxHp !== undefined) character.maxHp = parseInt(updates.maxHp, 10);
                if (updates.currentHp !== undefined) character.currentHp = parseInt(updates.currentHp, 10);
                if (updates.regeneration !== undefined) character.regeneration = parseInt(updates.regeneration, 10) || 0;
                if (updates.challengeRating !== undefined) character.challengeRating = parseInt(updates.challengeRating, 10) || 0;
                
                this.addLogToCharacter(id, 'Edición', 'Personaje editado');
                this.saveData();
                return true;
            }
            return false;
        },
        
        addLogToCharacter(characterId, action, details) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const logEntry = {
                    id: uuidv4(),
                    timestamp: new Date().toLocaleTimeString(),
                    turn: this.currentTurn,
                    action,
                    details,
                };
                character.logs.unshift(logEntry);
                if (character.logs.length > 50) {
                    character.logs.length = 50;
                }
                // No guardamos aquí para evitar escrituras excesivas, se guarda en la acción principal
            }
        },
        
        healCharacter(characterId, amount) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const oldHp = character.currentHp;
                character.currentHp = Math.min(character.maxHp, character.currentHp + parseInt(amount));
                if (character.currentHp > oldHp) {
                    this.addLogToCharacter(characterId, 'Curación', `+${character.currentHp - oldHp} HP`);
                    this.saveData();
                }
                return character.currentHp - oldHp;
            }
            return 0;
        },
        
        addTempHpToCharacter(characterId, amount) {
            const character = this.getCharacterById(characterId);
            if (character) {
                character.tempHp += parseInt(amount);
                this.addLogToCharacter(characterId, 'Vida Temporal', `+${amount} HP temporal`);
                this.saveData();
                return character.tempHp;
            }
            return 0;
        },
        
        damageCharacter(characterId, amount, isNecroDamage = false) {
            const character = this.getCharacterById(characterId);
            if (character) {
                let damage = parseInt(amount);
                const damageToTemp = Math.min(damage, character.tempHp);
                character.tempHp -= damageToTemp;
                damage -= damageToTemp;
                
                character.currentHp = Math.max(0, character.currentHp - damage);
                if (isNecroDamage) {
                    character.maxHp = Math.max(1, character.maxHp - damage);
                }
                
                this.addLogToCharacter(characterId, 'Daño Recibido', `-${amount} HP`);
                this.saveData();
                return { damageDealt: amount, remainingHp: character.currentHp };
            }
            return null;
        },
        
        setDefeatedBy(characterId, heroName) {
            const character = this.getCharacterById(characterId);
            if (character) {
                character.defeatedBy = heroName;
                this.saveData();
                return true;
            }
            return false;
        },
        
        resetCharacterToMaxHp(characterId) {
            const character = this.getCharacterById(characterId);
            if (character) {
                character.currentHp = character.originalMaxHp;
                character.maxHp = character.originalMaxHp;
                character.tempHp = 0;
                character.defeatedBy = null;
                this.addLogToCharacter(characterId, 'Reset HP', 'HP restaurado al máximo');
                this.saveData();
                return true;
            }
            return false;
        },
        
        reviveCharacter(characterId, hp = 1) {
            const character = this.getCharacterById(characterId);
            if (character && character.currentHp <= 0) {
                character.currentHp = Math.min(parseInt(hp) || 1, character.maxHp);
                character.tempHp = 0;
                character.defeatedBy = null;
                this.addLogToCharacter(characterId, 'Revivir', `Personaje revivido con ${character.currentHp} HP`);
                this.saveData();
                return true;
            }
            return false;
        },
        
        startTurn() {
            this.currentTurn++;
            this.isTurnActive = true;
            this.characters.forEach(char => {
                if (char.regeneration > 0 && char.currentHp > 0) {
                    this.healCharacter(char.id, char.regeneration);
                }
            });
            this.saveData();
        },
        
        endTurn() {
            this.isTurnActive = false;
            this.saveData();
        },
        
        resetAllTurns() {
            this.currentTurn = 0;
            this.isTurnActive = false;
            this.saveData();
        },
        
        resetAllCharacters() {
            this.characters.forEach(char => this.resetCharacterToMaxHp(char.id));
        },
        
        clearAllLogs() {
            this.characters.forEach(char => { char.logs = []; });
            this.saveData();
        },
        
        duplicateCharacter(characterId) {
            const original = this.getCharacterById(characterId);
            if (original) {
                const duplicate = JSON.parse(JSON.stringify(original));
                duplicate.id = uuidv4();
                duplicate.name = `${original.name} (Copia)`;
                this.characters.push(duplicate);
                this.addLogToCharacter(duplicate.id, 'Clonación', `Clonado de ${original.name}`);
                this.saveData();
            }
        },

        clearAllData() {
            this.characters = [];
            this.currentTurn = 0;
            this.isTurnActive = false;
            this.saveData();
        },

        updateCriticalHitConfig(config) {
            this.criticalHit = { ...this.criticalHit, ...config };
            this.saveData();
        },

        addAttackToCharacter(characterId, attackData) {
            const character = this.getCharacterById(characterId);
            if (character) {
                character.attacks.push({ ...attackData, id: uuidv4() });
                this.saveData();
            }
        },

        updateAttackInCharacter(characterId, updatedAttack) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const index = character.attacks.findIndex(a => a.id === updatedAttack.id);
                if (index !== -1) {
                    character.attacks[index] = updatedAttack;
                    this.saveData();
                }
            }
        },

        deleteAttackFromCharacter(characterId, attackId) {
            const character = this.getCharacterById(characterId);
            if (character) {
                character.attacks = character.attacks.filter(a => a.id !== attackId);
                this.saveData();
            }
        },

        duplicateAttackInCharacter(characterId, attackId) {
            const character = this.getCharacterById(characterId);
            if (character) {
                const original = character.attacks.find(a => a.id === attackId);
                if (original) {
                    const duplicate = { ...original, id: uuidv4(), name: `${original.name} (Copia)` };
                    const index = character.attacks.findIndex(a => a.id === attackId);
                    character.attacks.splice(index + 1, 0, duplicate);
                    this.saveData();
                }
            }
        },

        updateCharacterAttackOrder(characterId, newOrder) {
            const character = this.getCharacterById(characterId);
            if (character) {
                character.attacks = newOrder.map(id => character.attacks.find(a => a.id === id)).filter(Boolean);
                this.saveData();
            }
        },

        saveData() {
            const accountStore = useAccountStore();
            const data = {
                characters: this.characters,
                currentTurn: this.currentTurn,
                isTurnActive: this.isTurnActive,
                criticalHit: this.criticalHit,
            };
            accountStore.updateSection('dm', data);
        },

        loadData() {
            const accountStore = useAccountStore();
            const data = accountStore.getSection('dm');
            if (data) {
                this.characters = data.characters || [];
                this.currentTurn = data.currentTurn || 0;
                this.isTurnActive = data.isTurnActive || false;
                this.criticalHit = data.criticalHit || { rule: 'default', characterLevel: 1 };

                // Migración para asegurar que cada personaje tenga un array de ataques
                this.characters.forEach(character => {
                    if (!character.attacks) {
                        character.attacks = [];
                    }
                });
            }
        },
    }
});
