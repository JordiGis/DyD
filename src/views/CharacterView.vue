<template>
  <div class="character-view-container fade-in">
    <div class="character-header">
      <h1 class="character-name">{{ characterStore.character.name }}</h1>
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
        </div>
      </div>
      
      <div class="health-bar-container">
        <div class="health-bar">
          <div 
            class="health-fill" 
            :class="characterStore.hpBarColor"
            :style="{ width: `${characterStore.hpPercentage}%` }"
          ></div>
        </div>
        <div class="health-percentage">{{ Math.round(characterStore.hpPercentage) }}%</div>
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

    <!-- Botones principales -->
    <div class="action-buttons">
      <button 
        @click="startTurn" 
        class="action-btn btn-start-turn"
        :disabled="characterStore.turn.isActive"
      >
        <span class="btn-icon">🎲</span>
        <span class="btn-text">Iniciar Turno</span>
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
    </div>

    <!-- Botones adicionales -->
    <div class="secondary-actions">
      <button @click="resetToMaxHp" class="secondary-btn btn-reset">
        <span class="btn-icon">🔄</span>
        <span class="btn-text">Resetear HP</span>
      </button>
      
      <button @click="resetTurn" class="secondary-btn btn-reset-turn">
        <span class="btn-icon">⏮️</span>
        <span class="btn-text">Resetear Turno</span>
      </button>
      
      <button @click="goToConfig" class="secondary-btn btn-config">
        <span class="btn-icon">⚙️</span>
        <span class="btn-text">Configuración</span>
      </button>
    </div>

    <!-- Estado del turno -->
    <div v-if="characterStore.turn.isActive" class="turn-status">
      <div class="turn-status-content">
        <span class="turn-status-icon">⏳</span>
        <span class="turn-status-text">Turno {{ characterStore.turn.current }} en progreso</span>
        <button @click="endTurn" class="btn-end-turn">Finalizar Turno</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'
import Swal from 'sweetalert2'

const router = useRouter()
const characterStore = useCharacterStore()

onMounted(() => {
  // Cargar datos del localStorage
  characterStore.loadFromLocalStorage()
  
  // Si no hay personaje configurado, redirigir a configuración
  if (!characterStore.character.isConfigured) {
    router.push('/config')
  }
})

const startTurn = () => {
  characterStore.startTurn()
  
  Swal.fire({
    icon: 'success',
    title: '¡Turno Iniciado!',
    text: `Turno ${characterStore.turn.current} comenzado`,
    timer: 1500,
    showConfirmButton: false
  })
}

const endTurn = () => {
  characterStore.endTurn()
  
  Swal.fire({
    icon: 'info',
    title: 'Turno Finalizado',
    text: `Turno ${characterStore.turn.current} completado`,
    timer: 1500,
    showConfirmButton: false
  })
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
        return 'No puedes curar más allá del máximo'
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const amount = parseInt(result.value)
      const healed = characterStore.heal(amount)
      
      Swal.fire({
        icon: 'success',
        title: '¡Curado!',
        text: `${characterStore.character.name} recuperó ${healed} HP`
      })
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
      
      Swal.fire({
        icon: 'success',
        title: 'Vida Temporal Agregada',
        text: `Se agregaron ${amount} HP temporales`
      })
    }
  })
}

const showDamageDialog = () => {
  Swal.fire({
    title: 'Recibir Daño',
    input: 'number',
    inputLabel: 'Cantidad de daño',
    inputPlaceholder: 'Ej: 25',
    inputAttributes: {
      min: '1',
      max: '999'
    },
    showCancelButton: true,
    confirmButtonText: 'Recibir Daño',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value || value <= 0) {
        return 'Debes ingresar un número válido'
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const amount = parseInt(result.value)
      characterStore.takeDamage(amount)
      
      Swal.fire({
        icon: 'warning',
        title: '¡Daño Recibido!',
        text: `${characterStore.character.name} recibió ${amount} de daño`
      })
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
      
      Swal.fire({
        icon: 'success',
        title: 'HP Reseteado',
        text: 'Vida restaurada al máximo'
      })
    }
  })
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
      
      Swal.fire({
        icon: 'success',
        title: 'Turno Reseteado',
        text: 'Contador de turnos reiniciado'
      })
    }
  })
}

const goToConfig = () => {
  router.push('/config')
}
</script>

<style scoped>
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

.turn-status {
  background: rgba(243, 156, 18, 0.2);
  border: 1px solid rgba(243, 156, 18, 0.3);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
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
  .character-name {
    font-size: 2rem;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .secondary-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .turn-status-content {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
