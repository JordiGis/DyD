// src/stores/useCharacterStore.js
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { usePassiveDamageStore } from './usePassiveDamageStore';
import { rollDice } from '../utils/diceParser';
import { useAccountStore } from './useAccountStore'; // Importar el store de la cuenta

export const useCharacterStore = defineStore('character', {
    state: () => ({
        // Configuración del personaje
        character: {
            name: '',
            maxHp: 0,
            originalMaxHp: 0,
            currentHp: 0,
            tempHp: 0,
            regeneration: 0,
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
        hpPercentage: (state) => (state.character.maxHp === 0 ? 0 : (state.character.currentHp / state.character.maxHp) * 100),
        tempHpPercentage: (state) => (state.character.maxHp === 0 ? 0 : (state.character.tempHp / state.character.maxHp) * 100),
        hpBarColor: (state) => {
            const percentage = (state.character.currentHp / state.character.maxHp) * 100;
            if (percentage > 75) return 'success';
            if (percentage > 50) return 'warning';
            if (percentage > 25) return 'danger';
            return 'dark';
        },
        isAlive: (state) => state.character.currentHp > 0,
        hasTempHp: (state) => state.character.tempHp > 0,
        totalHp: (state) => state.character.currentHp + state.character.tempHp,
        logsByTurn: (state) => {
            const grouped = {};
            state.logs.forEach(log => {
                if (!grouped[log.turn]) {
                    grouped[log.turn] = [];
                }
                grouped[log.turn].push(log);
            });
            return grouped;
        },
        currentTurnLogs: (state) => state.logs.filter(log => log.turn === state.turn.current)
    },
    
    actions: {
        addLog(action, details, turn = null) {
            const logEntry = {
                id: uuidv4(),
                timestamp: new Date().toLocaleTimeString(),
                turn: turn !== null ? turn : this.turn.current,
                action,
                details,
                hpBefore: this.character.currentHp,
                hpAfter: this.character.currentHp,
                tempHpBefore: this.character.tempHp,
                tempHpAfter: this.character.tempHp
            };
            this.logs.unshift(logEntry);
            if (this.logs.length > 100) {
                this.logs.length = 100;
            }
        },
        
        configureCharacter(name, maxHp, regeneration = 0) {
            this.character.name = name;
            this.character.maxHp = maxHp;
            this.character.originalMaxHp = maxHp;
            this.character.currentHp = maxHp;
            this.character.tempHp = 0;
            this.character.regeneration = regeneration;
            this.character.isConfigured = true;
            this.addLog('Configuración', `${name} configurado con ${maxHp} HP máximo${regeneration > 0 ? ` y regeneración de ${regeneration} HP/turno` : ''}`, 0);
            this.saveData();
        },
        
        startTurn() {
            this.turn.current++;
            this.turn.isActive = true;
            this.addLog('Inicio de Turno', `Turno ${this.turn.current} iniciado`, this.turn.current);
            
            if (this.character.regeneration > 0) {
                const oldHp = this.character.currentHp;
                const oldMaxHp = this.character.maxHp;
                let maxHpRestored = 0;
                
                if (this.character.maxHp < this.character.originalMaxHp) {
                    const maxHpNeeded = this.character.originalMaxHp - this.character.maxHp;
                    const maxHpToRestore = Math.min(this.character.regeneration, maxHpNeeded);
                    if (maxHpToRestore > 0) {
                        this.character.maxHp = Math.min(this.character.originalMaxHp, this.character.maxHp + maxHpToRestore);
                        maxHpRestored = this.character.maxHp - oldMaxHp;
                    }
                }
                
                this.character.currentHp = Math.min(this.character.maxHp, this.character.currentHp + this.character.regeneration);
                const actualHealed = this.character.currentHp - oldHp;
                
                let logMessage = '';
                if (maxHpRestored > 0 && actualHealed > 0) {
                    logMessage = `+${actualHealed} HP (${oldHp} → ${this.character.currentHp}) | HP máximo restaurado: +${maxHpRestored} (${oldMaxHp} → ${this.character.maxHp})`;
                } else if (maxHpRestored > 0) {
                    logMessage = `HP máximo restaurado: +${maxHpRestored} (${oldMaxHp} → ${this.character.maxHp})`;
                } else if (actualHealed > 0) {
                    logMessage = `+${actualHealed} HP (${oldHp} → ${this.character.currentHp})`;
                }
                
                if (logMessage) {
                    this.addLog('Regeneración Automática', logMessage);
                }
            }

            const passiveDamageStore = usePassiveDamageStore();
            passiveDamageStore.loadData();
            let totalPassiveDamage = 0;
            const passiveDamageDetails = [];

            passiveDamageStore.passiveDamages.forEach(effect => {
                if (effect.duration === 0 || effect.duration > 0) {
                    let totalEffectDamage = 0;
                    effect.damageRolls.forEach(roll => {
                        totalEffectDamage += rollDice(roll.numDice, roll.diceType, roll.bonus);
                    });
                    if (totalEffectDamage > 0) {
                        totalPassiveDamage += totalEffectDamage;
                        passiveDamageDetails.push({ name: effect.name, damage: totalEffectDamage });
                    }
                }
            });

            this.saveData();
            
            if (totalPassiveDamage > 0) {
                return { totalDamage: totalPassiveDamage, damageDetails: passiveDamageDetails };
            }
            return null;
        },
        
        applyPassiveDamage(totalDamage, damageDetails) {
            this.takeDamage(totalDamage, false);
            const detailsText = damageDetails.map(d => `${d.damage} por ${d.name}`).join('; ');
            this.addLog('Daño Pasivo', `-${totalDamage} HP en total. Desglose: ${detailsText}`);
        },

        endTurn() {
            this.turn.isActive = false;
            const passiveDamageStore = usePassiveDamageStore();
            passiveDamageStore.decrementDurations();
            this.addLog('Fin de Turno', `Turno ${this.turn.current} finalizado`, this.turn.current);
            this.saveData();
        },
        
        heal(amount, isAutoRegeneration = false) {
            const oldHp = this.character.currentHp;
            this.character.currentHp = Math.min(this.character.maxHp, this.character.currentHp + amount);
            const actualHealed = this.character.currentHp - oldHp;
            if (actualHealed > 0) {
                const actionType = isAutoRegeneration ? 'Regeneración Automática' : 'Curación';
                this.addLog(actionType, `+${actualHealed} HP (${oldHp} → ${this.character.currentHp})`);
            }
            if (oldHp !== this.character.currentHp) {
                this.saveData();
            }
            return actualHealed;
        },
        
        addTempHp(amount) {
            const oldTempHp = this.character.tempHp;
            this.character.tempHp += amount;
            this.addLog('Vida Temporal', `+${amount} HP temporal (${oldTempHp} → ${this.character.tempHp})`);
            this.saveData();
        },
        
        takeDamage(amount, isNecroDamage = false) {
            let remainingDamage = amount;
            const oldHp = this.character.currentHp;
            const oldTempHp = this.character.tempHp;
            const oldMaxHp = this.character.maxHp;
            
            if (this.character.tempHp > 0) {
                const damageToTemp = Math.min(remainingDamage, this.character.tempHp);
                this.character.tempHp -= damageToTemp;
                remainingDamage -= damageToTemp;
            }
            
            if (remainingDamage > 0) {
                this.character.currentHp = Math.max(0, this.character.currentHp - remainingDamage);
                if (isNecroDamage) {
                    this.character.maxHp = Math.max(1, this.character.maxHp - remainingDamage);
                }
            }
            
            let logDetails = `-${amount} HP${isNecroDamage ? ' (Necro)' : ''}`;
            if (oldTempHp > 0) logDetails += ` | Temp HP: ${oldTempHp} → ${this.character.tempHp}`;
            logDetails += ` | HP: ${oldHp} → ${this.character.currentHp}`;
            if (isNecroDamage && oldMaxHp !== this.character.maxHp) logDetails += ` | Max HP: ${oldMaxHp} → ${this.character.maxHp}`;
            this.addLog('Daño Recibido', logDetails);
            
            this.saveData();
        },
        
        resetToMaxHp() {
            const oldHp = this.character.currentHp;
            const oldTempHp = this.character.tempHp;
            const oldMaxHp = this.character.maxHp;
            this.character.currentHp = this.character.originalMaxHp;
            this.character.maxHp = this.character.originalMaxHp;
            this.character.tempHp = 0;
            this.addLog('Reset HP', `HP restaurado (${oldHp} → ${this.character.originalMaxHp}), Max HP restaurado (${oldMaxHp} → ${this.character.originalMaxHp}), Temp HP eliminado (${oldTempHp} → 0)`);
            this.saveData();
        },
        
        revive(hp = 1) {
            if (this.character.currentHp <= 0) {
                const oldHp = this.character.currentHp;
                this.character.currentHp = Math.min(parseInt(hp) || 1, this.character.maxHp);
                this.character.tempHp = 0;
                this.addLog('Revivir', `Personaje revivido (${oldHp} → ${this.character.currentHp} HP)`);
                this.saveData();
                return true;
            }
            return false;
        },
        
        resetTurn() {
            const oldTurn = this.turn.current;
            this.turn.current = 0;
            this.turn.isActive = false;
            this.addLog('Reset Turno', `Contador de turnos reiniciado (${oldTurn} → 0)`);
            this.saveData();
        },
        
        clearLogs() {
            this.logs = [];
        },
        
        clearAllLogs() {
            this.logs = [];
            this.saveData();
        },
        
        saveData() {
            const accountStore = useAccountStore();
            const data = {
                character: this.character,
                turn: this.turn,
                logs: this.logs
            };
            accountStore.updateSection('character', data);
        },
        
        loadData() {
            const accountStore = useAccountStore();
            const data = accountStore.getSection('character');
            if (data) {
                this.character = { ...this.character, ...data.character };
                if (this.character.originalMaxHp === undefined) {
                    this.character.originalMaxHp = this.character.maxHp;
                }
                this.turn = { ...this.turn, ...data.turn };
                this.logs = data.logs || [];
            }
        },
        
        clearData() {
            this.character = {
                name: '', maxHp: 0, originalMaxHp: 0, currentHp: 0,
                tempHp: 0, regeneration: 0, isConfigured: false
            };
            this.turn = { current: 0, isActive: false };
            this.clearLogs();
            this.saveData(); // Guarda el estado limpio en el store de la cuenta
        }
    }
});
