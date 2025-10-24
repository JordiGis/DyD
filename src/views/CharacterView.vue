<template>
  <div class="character-view-container fade-in">
    <div class="character-header">
      <div v-if="stateStore.selectedState" class="character-state-display">
        <img v-if="selectedStateImageUrl" :src="selectedStateImageUrl" alt="Estado del personaje" class="state-image-display"/>
        <h1 class="character-name">{{ characterStore.character.name }} <span class="state-title-display">({{ stateStore.selectedState.title }})</span></h1>
        <div class="state-selector-wrapper">
          <select @change="handleStateChange($event.target.value)" class="state-selector">
            <option :value="state.id" v-for="state in stateStore.states" :key="state.id" :selected="state.id === stateStore.selectedStateId">
              {{ state.title }}
            </option>
            <option value="">Quitar estado</option>
          </select>
        </div>
      </div>
      <h1 v-else class="character-name">{{ characterStore.character.name }}</h1>
      <div class="turn-info">
        <span class="turn-label">Turno:</span>
        <span class="turn-number">{{ characterStore.turn.current }}</span>
      </div>
    </div>

    <!-- Barra de vida principal -->
    <div class="health-section">
      <div class="health-header">
        <h2>Puntos de Vida</h2>
        <div class="health-stats">
          <span class="current-hp">{{ characterStore.character.currentHp }}</span>
          <span class="separator">/</span>
          <span class="max-hp">{{ characterStore.character.maxHp }}</span>
          <!-- Indicador de daño necro -->
          <span v-if="characterStore.character.maxHp < characterStore.character.originalMaxHp" class="necro-indicator" title="HP máximo reducido por daño necro">
            ⚠️
          </span>
        </div>
      </div>
      
      <div class="health-bar-container">
        <div class="health-bar">
          <div 
            class="health-fill" 
            :class="characterStore.hasTempHp ? 'temp-hp' : characterStore.hpBarColor"
            :style="{ width: `${characterStore.hpPercentage}%` }"
          ></div>
          <!-- Indicador de daño necro en la barra -->
          <div
            v-if="characterStore.character.maxHp < characterStore.character.originalMaxHp"
            class="necro-bar-indicator"
            :style="{
              left: `${(characterStore.character.maxHp / characterStore.character.originalMaxHp) * 100}%`
            }"
            title="HP máximo reducido por daño necro"
          ></div>
        </div>
        <div class="health-percentage">{{ Math.round(characterStore.hpPercentage) }}%</div>
      </div>
      
      <!-- Información de daño necro -->
      <div v-if="characterStore.character.maxHp < characterStore.character.originalMaxHp" class="necro-info">
        <span class="necro-icon">💀</span>
        <span class="necro-text">HP máximo reducido por daño necro: {{ characterStore.character.maxHp }} / {{ characterStore.character.originalMaxHp }}</span>
      </div>
    </div>

    <!-- Barra de vida temporal -->
    <div v-if="characterStore.hasTempHp" class="temp-health-section">
      <div class="temp-health-header">
        <h3>Vida Temporal</h3>
        <span class="temp-hp-value">{{ characterStore.character.tempHp }}</span>
      </div>
      
      <div class="temp-health-bar-container">
        <div class="temp-health-bar">
          <div 
            class="temp-health-fill" 
            :style="{ width: `${characterStore.tempHpPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Información de regeneración -->
    <div v-if="characterStore.character.regeneration > 0" class="regeneration-info">
      <span class="regeneration-icon">🔄</span>
      <span class="regeneration-text">Regeneración: +{{ characterStore.character.regeneration }} HP/turno</span>
    </div>

    <!-- Contadores y Estados personalizados -->
  <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-2 custom-fold-row">
      <div>
        <button @click="toggleCounters" class="fold-btn">
          <span v-if="countersFolded">▶️ Mostrar Contadores</span>
          <span v-else>🔽 Ocultar Contadores</span>
        </button>
        <div v-show="!countersFolded">
          <CounterManager />
        </div>
      </div>
      <div>
        <button @click="toggleStates" class="fold-btn">
          <span v-if="statesFolded">▶️ Mostrar Estados</span>
          <span v-else>🔽 Ocultar Estados</span>
        </button>
        <div v-show="!statesFolded">
          <StateManager />
        </div>
      </div>
    </div>
    
    <!-- Estado del turno -->
    <!-- Botón de turno: solo uno visible según el estado -->
    <div class="action-buttons">
      <button 
      v-if="!characterStore.turn.isActive"
      @click="startTurn" 
      class="action-btn btn-start-turn"
      >
      <span class="btn-icon">🎲</span>
      <span class="btn-text">Iniciar Turno</span>
      </button>
      <button 
      v-else
      @click="endTurn" 
      class="action-btn btn-end-turn"
      >
      <span class="btn-icon">⏳</span>
      <span class="btn-text">Finalizar Turno</span>
      </button>

      <button 
        @click="showHealDialog" 
        class="action-btn btn-heal"
        :disabled="!characterStore.isAlive || characterStore.character.currentHp >= characterStore.character.maxHp"
      >
        <span class="btn-icon">💚</span>
        <span class="btn-text">Curar</span>
      </button>

      <button 
        @click="showTempHpDialog" 
        class="action-btn btn-temp-hp"
        :disabled="!characterStore.isAlive"
      >
        <span class="btn-icon">🛡️</span>
        <span class="btn-text">Vida Temporal</span>
      </button>

      <button 
        @click="showDamageDialog" 
        class="action-btn btn-damage"
        :disabled="!characterStore.isAlive"
      >
        <span class="btn-icon">⚔️</span>
        <span class="btn-text">Recibir Daño</span>
      </button>
      <button 
        @click="showResistantDamageDialog" 
        class="action-btn btn-resistant-damage"
        :disabled="!characterStore.isAlive"
      >
        <span class="btn-icon"><i data-v-6dd7d5c6="" class="bi bi-shield-slash"></i></span>
        <span class="btn-text">Daño Resistente</span>
      </button>
      
      <!-- Botón para curar daño necro (solo si hay daño necro) -->
      <button 
        v-if="characterStore.character.maxHp < characterStore.character.originalMaxHp"
        @click="showHealNecroDialog" 
        class="action-btn btn-restore-max"
        title="Curar una cantidad específica de daño necro"
      >
        <span class="btn-icon">💖</span>
        <span class="btn-text">Curar Daño Necro</span>
      </button>

      <button @click="isAttackManagerVisible = true" class="action-btn btn-attack-manager" :disabled="!characterStore.isAlive">
        <span class="btn-icon">⚔️</span>
        <span class="btn-text">Gestor de Ataques</span>
      </button>
      </div>

    <AttackManager v-if="isAttackManagerVisible" @close="isAttackManagerVisible = false" />


    <!-- Botones adicionales -->
    <div class="secondary-actions">
      
      <!-- Botón Descanso Largo -->
      <button @click="longRest" class="secondary-btn btn-long-rest">
        <span class="btn-icon">🛌</span>
        <span class="btn-text">Descanso Largo</span>
      </button>

      <!-- Botón Descanso Corto -->
      <button @click="shortRest" class="secondary-btn btn-short-rest">
        <span class="btn-icon">💤</span>
        <span class="btn-text">Descanso Corto</span>
      </button>
      
      <button @click="resetToMaxHp" class="secondary-btn btn-reset">
        <span class="btn-icon">🔄</span>
        <span class="btn-text">Resetear HP</span>
      </button>
      
      <button 
        v-if="!characterStore.isAlive" 
        @click="reviveCharacter" 
        class="secondary-btn btn-revive"
      >
        <span class="btn-icon">💖</span>
        <span class="btn-text">Revivir</span>
      </button>
      
      <button @click="resetTurn" class="secondary-btn btn-reset-turn">
        <span class="btn-icon">⏮️</span>
        <span class="btn-text">Resetear Turno</span>
      </button>

      <button @click="goToLogs" class="secondary-btn btn-logs">
        <span class="btn-icon">📋</span>
        <span class="btn-text">Ver Historial</span>
      </button>
      
      <button @click="goToConfig" class="secondary-btn btn-config">
        <span class="btn-icon">⚙️</span>
        <span class="btn-text">Configuración</span>
      </button>
    </div>

    
  </div>
</template>

<script setup>
import CounterManager from '../components/CounterManager.vue';
import StateManager from '../components/StateManager.vue';
import AttackManager from '../components/AttackManager.vue';
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'
import { useCounterStore } from '../stores/useCounterStore'
import { useCharacterStateStore } from '../stores/useCharacterStateStore'
import Swal from 'sweetalert2'

const router = useRouter()
const characterStore = useCharacterStore()
const counterStore = useCounterStore()
const stateStore = useCharacterStateStore()

const selectedStateImageUrl = computed(() => {
  if (stateStore.selectedState && stateStore.selectedState.image) {
    return URL.createObjectURL(stateStore.selectedState.image);
  }
  return null;
});

const handleStateChange = (stateId) => {
  stateStore.setSelectedState(stateId || null);
};

const isAttackManagerVisible = ref(false);

// Estado de plegado para contadores y estados
const countersFolded = ref(false)
const statesFolded = ref(false)

// Cargar estado de plegado desde localStorage
function loadFoldState() {
  try {
    const data = localStorage.getItem('dnd-character-folds')
    if (data) {
      const parsed = JSON.parse(data)
      countersFolded.value = !!parsed.countersFolded
      statesFolded.value = !!parsed.statesFolded
    }
  } catch (e) {}
}

function saveFoldState() {
  localStorage.setItem('dnd-character-folds', JSON.stringify({
    countersFolded: countersFolded.value,
    statesFolded: statesFolded.value
  }))
}

function toggleCounters() {
  countersFolded.value = !countersFolded.value
  saveFoldState()
}

function toggleStates() {
  statesFolded.value = !statesFolded.value
  saveFoldState()
}

onMounted(async () => {
  // Cargar datos del localStorage
  characterStore.loadFromLocalStorage()
  await stateStore.loadStates();
  loadFoldState()
  // Si no hay personaje configurado, redirigir a configuración
  if (!characterStore.character.isConfigured) {
    router.push('/config')
  }
})

const startTurn = () => {
  characterStore.startTurn()
}

const endTurn = () => {
  characterStore.endTurn()
}

const showHealDialog = () => {
  Swal.fire({
    title: 'Curar Personaje',
    input: 'number',
    inputLabel: 'Cantidad de HP a curar',
    inputPlaceholder: 'Ej: 10',
    inputAttributes: {
      min: '1',
      max: characterStore.character.maxHp - characterStore.character.currentHp
    },
    showCancelButton: true,
    confirmButtonText: 'Curar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value || value <= 0) {
        return 'Debes ingresar un número válido'
      }
      if (value > characterStore.character.maxHp - characterStore.character.currentHp) {
        return `No puedes curar más allá del máximo (${characterStore.character.maxHp - characterStore.character.currentHp} HP)`
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const amount = parseInt(result.value)
      const healed = characterStore.heal(amount)
      

    }
  })
}

const showTempHpDialog = () => {
  Swal.fire({
    title: 'Agregar Vida Temporal',
    input: 'number',
    inputLabel: 'Cantidad de HP temporal',
    inputPlaceholder: 'Ej: 15',
    inputAttributes: {
      min: '1',
      max: '999'
    },
    showCancelButton: true,
    confirmButtonText: 'Agregar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value || value <= 0) {
        return 'Debes ingresar un número válido'
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const amount = parseInt(result.value)
      characterStore.addTempHp(amount)
      

    }
  })
}

const showDamageDialog = () => {
  Swal.fire({
    title: 'Recibir Daño',
    html: `
      <div style="margin-bottom: 20px;display: flex;flex-direction: column;align-items: center;">
        <input id="damage-amount" type="number" placeholder="Ej: 25" min="1" max="999" class="swal2-input" style="width: 100%; margin-bottom: 15px;">
        <div style="text-align: left;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
            <input id="necro-damage" type="checkbox" style="width: 16px; height: 16px; accent-color: #e74c3c;">
            <span style="color: #e74c3c; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Daño Necro</span>
            <span style="color: #7f8c8d; font-size: 0.8rem; cursor: help;" title="El daño necro reduce permanentemente el HP máximo hasta que se restaure. Afecta tanto a la vida temporal como a la vida actual.">ⓘ</span>
          </label>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Recibir Daño',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const amount = document.getElementById('damage-amount').value
      const isNecroDamage = document.getElementById('necro-damage').checked
      
      if (!amount || amount <= 0) {
        Swal.showValidationMessage('Debes ingresar un número válido')
        return false
      }
      
      return { amount: parseInt(amount), isNecroDamage }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { amount, isNecroDamage } = result.value
      characterStore.takeDamage(amount, isNecroDamage)
    }
  })
}

const showResistantDamageDialog = () => {
  Swal.fire({
    title: 'Daño Resistente',
    html: `
      <div style="margin-bottom: 20px;display: flex;flex-direction: column;align-items: center;">
        <input id="resistant-damage-amount" type="number" placeholder="Ej: 20" min="1" max="999" class="swal2-input" style="width: 100%; margin-bottom: 15px;">
        <div style="text-align: left;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
            <input id="necro-resistant-damage" type="checkbox" style="width: 16px; height: 16px; accent-color: #e74c3c;">
            <span style="color: #e74c3c; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Daño Necro</span>
            <span style="color: #7f8c8d; font-size: 0.8rem; cursor: help;" title="El daño necro reduce permanentemente el HP máximo hasta que se restaure. Afecta tanto a la vida temporal como a la vida actual.">ⓘ</span>
          </label>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Aplicar Daño',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const amount = document.getElementById('resistant-damage-amount').value
      const isNecroDamage = document.getElementById('necro-resistant-damage').checked
      
      if (!amount || amount <= 0) {
        Swal.showValidationMessage('Debes ingresar un número válido')
        return false
      }
      
      return { amount: parseInt(amount), isNecroDamage }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { amount, isNecroDamage } = result.value
      const resistantDamage = Math.floor(amount / 2)
      characterStore.takeDamage(resistantDamage, isNecroDamage)
    }
  })
}

const resetToMaxHp = () => {
  Swal.fire({
    title: '¿Resetear HP?',
    text: '¿Quieres restaurar la vida al máximo y eliminar la vida temporal?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, resetear',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      characterStore.resetToMaxHp()
      

    }
  })
}

const restoreMaxHp = () => {
  Swal.fire({
    title: '¿Restaurar HP Máximo?',
    text: '¿Quieres restaurar solo el HP máximo reducido por daño necro?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const oldMaxHp = characterStore.character.maxHp
      characterStore.character.maxHp = characterStore.character.originalMaxHp
      
      // Agregar log de restauración
      characterStore.addLog('Restaurar HP Máximo', `HP máximo restaurado de ${oldMaxHp} a ${characterStore.character.originalMaxHp} (daño necro revertido)`)
      
      // Guardar cambios
      characterStore.saveToLocalStorage()
      
      // Mostrar confirmación
      Swal.fire({
        icon: 'success',
        title: 'HP Máximo Restaurado',
        text: `Tu HP máximo ha sido restaurado de ${oldMaxHp} a ${characterStore.character.originalMaxHp}`,
        timer: 2000,
        showConfirmButton: false
      })
    }
  })
}

const reviveCharacter = async () => {
  // Si el personaje tiene daño necro, restaurar el HP máximo primero
  let maxHpRestaurado = false;
  if (characterStore.character.maxHp < characterStore.character.originalMaxHp) {
    const oldMaxHp = characterStore.character.maxHp;
    characterStore.character.maxHp = characterStore.character.originalMaxHp;
    maxHpRestaurado = true;
    characterStore.addLog('Restaurar HP Máximo', `HP máximo restaurado de ${oldMaxHp} a ${characterStore.character.originalMaxHp} (daño necro revertido)`);
    characterStore.saveToLocalStorage();
  }

  // Modal de opciones de resurrección estilizado
  const { value: reviveOption } = await Swal.fire({
    title: `
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;">
        <i class="bi bi-magic" style="color:#d4af37;font-size:1.4em;"></i>
        <span>Ritual de Resurrección</span>
        <i class="bi bi-magic" style="color:#d4af37;font-size:1.4em;"></i>
      </div>
    `,
    html: `
      <div style="background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%); 
                  border: 2px solid #d4af37; 
                  border-radius: 12px; 
                  padding: 20px; 
                  margin: 10px 0;
                  box-shadow: inset 0 0 20px rgba(212, 175, 55, 0.1);">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="color: #f39c12; font-size: 1.2em; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
            ${characterStore.character.name}
          </div>
          <div style="color: #bbb; font-size: 0.9em; margin-top: 4px;">
            Elige el método de resurrección
          </div>
        </div>
        <div style="text-align: left; font-size: 1.05em;">
          <!-- Opción 1: 1 HP -->
          <label style="display: block; background: linear-gradient(90deg, rgba(39, 174, 96, 0.15) 0%, rgba(39, 174, 96, 0.05) 100%); border: 1px solid rgba(39, 174, 96, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease; position: relative;"
                 onmouseover="this.style.borderColor='rgba(39, 174, 96, 0.6)'; this.style.background='linear-gradient(90deg, rgba(39, 174, 96, 0.25) 0%, rgba(39, 174, 96, 0.08) 100%)'"
                 onmouseout="this.style.borderColor='rgba(39, 174, 96, 0.3)'; this.style.background='linear-gradient(90deg, rgba(39, 174, 96, 0.15) 0%, rgba(39, 174, 96, 0.05) 100%)'">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="radio" name="reviveOption" value="1" checked style="accent-color: #27ae60; transform: scale(1.2);">
              <i class="bi bi-heart" style="color: #27ae60; font-size: 1.1em;"></i>
              <div>
                <div style="color: #27ae60; font-weight: 700; font-size: 1.05em;">Resurrección Básica</div>
                <div style="color: #aaa; font-size: 0.9em;">Revive con 1 punto de vida</div>
              </div>
            </div>
          </label>
          <!-- Opción 2: Media vida -->
          <label style="display: block; background: linear-gradient(90deg, rgba(243, 156, 18, 0.15) 0%, rgba(243, 156, 18, 0.05) 100%); border: 1px solid rgba(243, 156, 18, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='rgba(243, 156, 18, 0.6)'; this.style.background='linear-gradient(90deg, rgba(243, 156, 18, 0.25) 0%, rgba(243, 156, 18, 0.08) 100%)'"
                 onmouseout="this.style.borderColor='rgba(243, 156, 18, 0.3)'; this.style.background='linear-gradient(90deg, rgba(243, 156, 18, 0.15) 0%, rgba(243, 156, 18, 0.05) 100%)'">
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="radio" name="reviveOption" value="half" style="accent-color: #f39c12; transform: scale(1.2);">
              <i class="bi bi-heart-half" style="color: #f39c12; font-size: 1.1em;"></i>
              <div>
                <div style="color: #f39c12; font-weight: 700; font-size: 1.05em;">Resurrección Mejorada</div>
                <div style="color: #aaa; font-size: 0.9em;">Revive con ${Math.floor(characterStore.character.maxHp / 2)} HP (50% vida máxima)</div>
              </div>
            </div>
          </label>
          <!-- Opción 3: Personalizada -->
          <label style="display: block; background: linear-gradient(90deg, rgba(155, 89, 182, 0.15) 0%, rgba(155, 89, 182, 0.05) 100%); border: 1px solid rgba(155, 89, 182, 0.3); border-radius: 8px; padding: 14px; margin-bottom: 16px; cursor: pointer; transition: all 0.3s ease;"
                 onmouseover="this.style.borderColor='rgba(155, 89, 182, 0.6)'; this.style.background='linear-gradient(90deg, rgba(155, 89, 182, 0.25) 0%, rgba(155, 89, 182, 0.08) 100%)'"
                 onmouseout="this.style.borderColor='rgba(155, 89, 182, 0.3)'; this.style.background='linear-gradient(90deg, rgba(155, 89, 182, 0.15) 0%, rgba(155, 89, 182, 0.05) 100%)'">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <input type="radio" name="reviveOption" value="custom" style="accent-color: #9b59b6; transform: scale(1.2); margin-top: 2px;">
              <i class="bi bi-gear-fill" style="color: #9b59b6; font-size: 1.1em; margin-top: 2px;"></i>
              <div style="flex: 1;">
                <div style="color: #9b59b6; font-weight: 700; font-size: 1.05em; margin-bottom: 8px;">Resurrección Personalizada</div>
                <input id="customHpInput" type="number" min="1" max="${characterStore.character.maxHp}" placeholder="Cantidad de HP" disabled style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 0.95em; transition: all 0.3s ease;" onfocus="this.style.borderColor='#9b59b6'; this.style.boxShadow='0 0 8px rgba(155, 89, 182, 0.3)'" onblur="this.style.borderColor='rgba(155, 89, 182, 0.4)'; this.style.boxShadow='none'">
                <div style="color: #aaa; font-size: 0.85em; margin-top: 4px;">Especifica la cantidad exacta de HP</div>
              </div>
            </div>
          </label>
        </div>
        <div style="background: rgba(52, 152, 219, 0.1); border: 1px solid rgba(52, 152, 219, 0.3); border-radius: 6px; padding: 12px; text-align: center;">
          <i class="bi bi-info-circle-fill" style="color: #3498db; margin-right: 8px;"></i>
          <span style="color: #bbb; font-size: 0.9em;">Vida máxima actual: <strong style="color: #3498db;">${characterStore.character.maxHp} HP</strong></span>
        </div>
      </div>
    `,
    customClass: {
      popup: 'dnd-modal-popup',
      title: 'dnd-modal-title',
      htmlContainer: 'dnd-modal-content',
      confirmButton: 'dnd-confirm-btn',
      cancelButton: 'dnd-cancel-btn'
    },
    showCancelButton: true,
    confirmButtonText: `
      <i class="bi bi-magic" style="margin-right: 8px; color: #d4af37;"></i>
      Realizar Ritual
    `,
    cancelButtonText: `
      <i class="bi bi-x-circle" style="margin-right: 6px;"></i>
      Cancelar
    `,
    background: '#1a1a1a',
    color: '#ffffff',
    preConfirm: () => {
      const selected = document.querySelector('input[name="reviveOption"]:checked').value;
      if (selected === 'custom') {
        const customValue = parseInt(document.getElementById('customHpInput').value);
        if (isNaN(customValue) || customValue < 1 || customValue > characterStore.character.maxHp) {
          Swal.showValidationMessage(`Introduce un valor entre 1 y ${characterStore.character.maxHp}`);
          return false;
        }
        return customValue;
      }
      if (selected === 'half') {
        return Math.floor(characterStore.character.maxHp / 2);
      }
      return 1;
    },
    didOpen: () => {
      // Aplicar estilos CSS adicionales
      const style = document.createElement('style');
      style.textContent = `
        .dnd-modal-popup {
          background: linear-gradient(145deg, #2c2c2c 0%, #1a1a1a 100%) !important;
          border: 2px solid #d4af37 !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.2) !important;
        }
        .dnd-modal-title {
          color: #d4af37 !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8) !important;
          font-weight: 700 !important;
          font-size: 1.4em !important;
        }
        .dnd-confirm-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%) !important;
          color: #1a1a1a !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 1.05em !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3) !important;
        }
        .dnd-confirm-btn:hover {
          background: linear-gradient(135deg, #e6c451 0%, #d4af37 100%) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4) !important;
        }
        .dnd-cancel-btn {
          background: linear-gradient(135deg, #555 0%, #333 100%) !important;
          color: #fff !important;
          border: 1px solid #666 !important;
          padding: 12px 24px !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
        }
        .dnd-cancel-btn:hover {
          background: linear-gradient(135deg, #666 0%, #444 100%) !important;
          border-color: #777 !important;
          transform: translateY(-1px) !important;
        }
        .swal2-actions {
          gap: 16px !important;
          margin-top: 24px !important;
        }
      `;
      document.head.appendChild(style);
      // Manejo de los radio buttons y el input personalizado
      const radios = Swal.getHtmlContainer().querySelectorAll('input[name="reviveOption"]');
      const customInput = Swal.getHtmlContainer().querySelector('#customHpInput');
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (radio.value === 'custom') {
            customInput.disabled = false;
            customInput.focus();
          } else {
            customInput.disabled = true;
          }
        });
      });
    }
  });

  if (reviveOption && reviveOption > 0) {
    characterStore.revive(reviveOption);
  }
}

const resetTurn = () => {
  Swal.fire({
    title: '¿Resetear Turno?',
    text: '¿Quieres volver al turno 0?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, resetear',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      characterStore.resetTurn()
    }
  })
}

const goToConfig = () => {
  router.push('/config')
}

const goToLogs = () => {
  router.push('/logs')
}

// Descanso Largo: resetea turno, HP y recarga contadores
const longRest = () => {
  Swal.fire({
    title: 'Descanso Largo',
    text: '¿Quieres restaurar la vida al máximo, reiniciar el turno y recargar contadores?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, descansar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      characterStore.resetToMaxHp();
      characterStore.resetTurn();
      counterStore.regenerateCountersByRest('long');
    }
  });
}

// Descanso Corto: resetea turnos y recarga contadores
const shortRest = () => {
  Swal.fire({
    title: 'Descanso Corto',
    text: '¿Quieres reiniciar el contador de turnos y recargar contadores? (La vida no se restaura)',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, reiniciar turnos',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      characterStore.resetTurn();
      counterStore.regenerateCountersByRest('short');
    }
  });
}

const showHealNecroDialog = () => {
  // Calcular cuánto daño necro se puede curar
  const necroDamage = characterStore.character.originalMaxHp - characterStore.character.maxHp;
  
  Swal.fire({
    title: 'Curar Daño Necro',
    html: `
      <div style="margin-bottom: 20px;">
        <p style="margin-bottom: 15px; color: #ecf0f1;">Daño necro acumulado: <strong style="color: #e74c3c;">${necroDamage} HP</strong></p>
        <input id="heal-necro-amount" type="number" placeholder="Cantidad a curar" min="1" max="${necroDamage}" value="1" class="swal2-input" style="width: 100%; margin-bottom: 15px;">
        <div style="text-align: left; background: rgba(231, 76, 60, 0.2); padding: 12px; border-radius: 8px; border: 1px solid rgba(231, 76, 60, 0.3);">
          <p style="margin: 0; color: #e74c3c; font-size: 0.9rem;">
            <strong>¿Qué hace esta acción?</strong><br>
            - Aumenta tu HP máximo en la cantidad especificada<br>
            - Cura tu HP actual en la misma cantidad
          </p>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Curar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const amount = document.getElementById('heal-necro-amount').value
      
      if (!amount || amount <= 0) {
        Swal.showValidationMessage('Debes ingresar un número válido')
        return false
      }
      
      const healAmount = parseInt(amount);
      if (healAmount > necroDamage) {
        Swal.showValidationMessage(`No puedes curar más daño necro del acumulado (${necroDamage} HP)`)
        return false
      }
      
      return { amount: healAmount }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { amount } = result.value
      healNecroDamage(amount)
    }
  })
}

const healNecroDamage = (amount) => {
  const oldMaxHp = characterStore.character.maxHp
  const oldCurrentHp = characterStore.character.currentHp
  
  // Aumentar el HP máximo
  characterStore.character.maxHp = Math.min(
    characterStore.character.originalMaxHp,
    characterStore.character.maxHp + amount
  )
  
  // Curar al personaje en la misma cantidad
  characterStore.character.currentHp = Math.min(
    characterStore.character.maxHp,
    characterStore.character.currentHp + amount
  )
  
  // Agregar log de curación de daño necro
  characterStore.addLog('Curar Daño Necro', `HP máximo restaurado: +${characterStore.character.maxHp - oldMaxHp} (${oldMaxHp} → ${characterStore.character.maxHp}) | HP actual curado: +${characterStore.character.currentHp - oldCurrentHp} (${oldCurrentHp} → ${characterStore.character.currentHp})`)
  
  // Guardar cambios
  characterStore.saveToLocalStorage()
  
  // Mostrar confirmación
  Swal.fire({
    icon: 'success',
    title: 'Daño Necro Curado',
    text: `Has curado ${amount} puntos de daño necro`,
    timer: 2000,
    showConfirmButton: false
  })
}
</script>

<style scoped>
.character-state-display {
  text-align: center;
  margin-bottom: 20px;
}
.state-image-display {
  max-width: 150px;
  max-height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f39c12;
  margin-bottom: 10px;
}
.state-title-display {
  color: #f39c12;
  font-style: italic;
}
.state-selector-wrapper {
  margin-top: 15px;
}
.state-selector {
  background-color: rgba(0, 0, 0, 0.3);
  color: #f39c12;
  border: 1px solid #f39c12;
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 1rem;
}
/* Margen inferior para la fila de contadores y estados */
.custom-fold-row {
  margin-bottom: 10px;
}
/* Botón de plegado */
.fold-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  color: #f39c12;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  margin-top: 10px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}
.fold-btn:hover {
  background: rgba(255,255,255,0.18);
}
.character-view-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.character-header {
  text-align: center;
  margin-bottom: 30px;
}

.character-name {
  color: #f39c12;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.turn-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

.turn-label {
  color: #ecf0f1;
  font-weight: 600;
}

.turn-number {
  color: #f39c12;
  font-size: 1.5rem;
  font-weight: bold;
}

.health-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.health-header h2 {
  color: #ecf0f1;
  margin: 0;
  font-size: 1.5rem;
}

.health-stats {
  display: flex;
  align-items: center;
  gap: 5px;
}

.current-hp {
  color: #2ecc71;
  font-size: 1.8rem;
  font-weight: bold;
}

.separator {
  color: #ecf0f1;
  font-size: 1.5rem;
}

.max-hp {
  color: #ecf0f1;
  font-size: 1.8rem;
  font-weight: bold;
}

/* Indicador de daño necro */
.necro-indicator {
  margin-left: 8px;
  font-size: 1.2rem;
  animation: pulse-warning 2s infinite;
}

@keyframes pulse-warning {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.health-bar-container {
  position: relative;
}

.health-bar {
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.health-fill {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 13px;
}

.health-fill.success { background: linear-gradient(90deg, #2ecc71, #27ae60); }
.health-fill.warning { background: linear-gradient(90deg, #f39c12, #e67e22); }
.health-fill.danger { background: linear-gradient(90deg, #e74c3c, #c0392b); }
.health-fill.dark { background: linear-gradient(90deg, #34495e, #2c3e50); }
.health-fill.temp-hp { background: linear-gradient(90deg, #9b59b6, #8e44ad); }

/* Indicador de daño necro en la barra */
.necro-bar-indicator {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: #e74c3c;
  box-shadow: 0 0 4px rgba(231, 76, 60, 0.8);
  z-index: 2;
}

.health-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Información de daño necro */
.necro-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(231, 76, 60, 0.2);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
  margin-top: 15px;
}

.necro-icon {
  font-size: 1.2rem;
}

.necro-text {
  color: #e74c3c;
  font-weight: 500;
  font-size: 0.9rem;
}

.temp-health-section {
  background: rgba(52, 152, 219, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.temp-health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.temp-health-header h3 {
  color: #3498db;
  margin: 0;
  font-size: 1.3rem;
}

.temp-hp-value {
  color: #3498db;
  font-size: 1.5rem;
  font-weight: bold;
}

.temp-health-bar-container {
  position: relative;
}

.temp-health-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.temp-health-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.5s ease;
  border-radius: 9px;
}

.regeneration-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(46, 204, 113, 0.2);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 25px;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.regeneration-icon {
  font-size: 1.5rem;
}

.regeneration-text {
  color: #2ecc71;
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 25px 20px;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-height: 120px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-start-turn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.btn-heal {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-temp-hp {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-damage {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-resistant-damage {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-attack-manager {
  background: linear-gradient(135deg, #ff5252, #c62828);
  color: white;
}

.btn-icon {
  font-size: 2rem;
}

.btn-text {
  font-size: 1rem;
}

.secondary-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.secondary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-restore-max {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: 1px solid rgba(233, 30, 99, 0.3);
}

.btn-restore-max:hover {
  background: linear-gradient(135deg, #c2185b, #ad1457);
  transform: translateY(-2px);
}

.btn-revive {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: 1px solid rgba(233, 30, 99, 0.3);
}

.btn-revive:hover {
  background: linear-gradient(135deg, #c2185b, #ad1457);
  transform: translateY(-2px);
}

.turn-status {
  background: rgba(243, 156, 18, 0.2);
  border: 1px solid rgba(243, 156, 18, 0.3);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.turn-status-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.turn-status-icon {
  font-size: 1.5rem;
}

.turn-status-text {
  color: #f39c12;
  font-weight: 600;
  font-size: 1.1rem;
}

.btn-end-turn {
  background: #f39c12;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-end-turn:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .character-view-container {
    padding: 15px;
    min-height: calc(100vh - 65px);
  }
  
  .character-header {
    margin-bottom: 20px;
    padding: 20px 15px;
  }
  
  .character-name {
    font-size: 2rem;
    margin-bottom: 15px;
  }
  
  .turn-info {
    padding: 12px 20px;
    border-radius: 12px;
  }
  
  .turn-label {
    font-size: 0.9rem;
  }
  
  .turn-number {
    font-size: 1.3rem;
  }
  
  .health-section,
  .temp-health-section {
    margin-bottom: 20px;
    padding: 20px 15px;
    border-radius: 15px;
  }
  
  .health-header h2 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .health-stats {
    gap: 8px;
  }
  
  .current-hp,
  .max-hp {
    font-size: 1.8rem;
  }
  
  .separator {
    font-size: 1.5rem;
  }
  
  .health-bar-container {
    margin-top: 15px;
  }
  
  .health-bar {
    height: 20px;
    border-radius: 10px;
  }
  
  .health-percentage {
    font-size: 0.9rem;
    margin-top: 8px;
  }
  
  .temp-health-header h3 {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }
  
  .temp-hp-value {
    font-size: 1.5rem;
  }
  
  .temp-health-bar {
    height: 16px;
    border-radius: 8px;
  }
  
  .regeneration-info {
    margin: 20px 15px;
    padding: 15px;
    border-radius: 12px;
    gap: 10px;
  }
  
  .regeneration-icon {
    font-size: 1.2rem;
  }
  
  .regeneration-text {
    font-size: 0.95rem;
  }
  
  .action-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin: 25px 15px;
  }
  
  .action-btn {
    padding: 20px 16px;
    min-height: 65px;
    font-size: 1.1rem;
    border-radius: 15px;
  }
  
  .btn-icon {
    font-size: 1.8rem;
  }
  
  .btn-text {
    font-size: 1.05rem;
  }
  
  .secondary-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 12px;
    margin: 20px 15px 25px;
  }
  
  .secondary-btn {
    width: 100%;
    padding: 16px 20px;
    min-height: 55px;
    font-size: 1rem;
    border-radius: 12px;
  }
  
  .turn-status {
    margin: 20px 15px;
    padding: 20px 15px;
    border-radius: 15px;
  }
  
  .turn-status-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .turn-status-icon {
    font-size: 1.8rem;
  }
  
  .turn-status-text {
    font-size: 1.1rem;
  }
  
  .btn-end-turn {
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 10px;
    min-height: 45px;
  }
}

@media (max-width: 480px) {
  .character-view-container {
    padding: 10px;
  }
  
  .character-header {
    padding: 15px 12px;
    margin-bottom: 15px;
  }
  
  .character-name {
    font-size: 1.8rem;
  }
  
  .turn-info {
    padding: 10px 16px;
  }
  
  .turn-number {
    font-size: 1.2rem;
  }
  
  .health-section,
  .temp-health-section {
    padding: 15px 12px;
    margin-bottom: 15px;
  }
  
  .health-header h2 {
    font-size: 1.2rem;
  }
  
  .current-hp,
  .max-hp {
    font-size: 1.6rem;
  }
  
  .health-bar {
    height: 18px;
  }
  
  .temp-health-header h3 {
    font-size: 1rem;
  }
  
  .temp-hp-value {
    font-size: 1.3rem;
  }
  
  .temp-health-bar {
    height: 14px;
  }
  
  .regeneration-info {
    margin: 15px 10px;
    padding: 12px;
  }
  
  .action-buttons {
    margin: 20px 10px;
    gap: 12px;
  }
  
  .action-btn {
    padding: 18px 14px;
    min-height: 60px;
  }
  
  .btn-icon {
    font-size: 1.6rem;
  }
  
  .secondary-actions {
    margin: 15px 10px 20px;
    gap: 10px;
  }
  
  .secondary-btn {
    padding: 14px 16px;
    min-height: 50px;
  }
  
  .turn-status {
    margin: 15px 10px;
    padding: 15px 12px;
  }
  
  .btn-end-turn {
    padding: 10px 20px;
    min-height: 40px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .action-btn:hover,
  .secondary-btn:hover {
    transform: none;
  }
  
  .action-btn:active,
  .secondary-btn:active {
    transform: scale(0.98);
  }
  
  .btn-end-turn:hover {
    transform: none;
  }
  
  .btn-end-turn:active {
    transform: scale(0.95);
  }
}
</style>
