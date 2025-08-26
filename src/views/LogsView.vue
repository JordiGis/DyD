<template>
  <div class="logs-view-container fade-in">
    <div class="logs-header">
      <h1 class="logs-title">📋 Historial de Acciones</h1>
      <div class="logs-stats">
        <span class="stats-item">
          <span class="stats-label">Total de Acciones:</span>
          <span class="stats-value">{{ characterStore.logs.length }}</span>
        </span>
        <span class="stats-item">
          <span class="stats-label">Turnos Registrados:</span>
          <span class="stats-value">{{ Object.keys(characterStore.logsByTurn).length }}</span>
        </span>
      </div>
    </div>

    <!-- Filtros -->
    <div class="logs-filters">
      <div class="filter-group">
        <label for="actionFilter" class="filter-label">Filtrar por Acción:</label>
        <select id="actionFilter" v-model="selectedAction" class="filter-select">
          <option value="">Todas las acciones</option>
          <option value="Inicio de Turno">Inicio de Turno</option>
          <option value="Fin de Turno">Fin de Turno</option>
          <option value="Curación">Curación</option>
          <option value="Regeneración Automática">Regeneración Automática</option>
          <option value="Vida Temporal">Vida Temporal</option>
          <option value="Daño Recibido">Daño Recibido</option>
          <option value="Reset HP">Reset HP</option>
          <option value="Reset Turno">Reset Turno</option>
          <option value="Configuración">Configuración</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="turnFilter" class="filter-label">Filtrar por Turno:</label>
        <select id="turnFilter" v-model="selectedTurn" class="filter-select">
          <option value="">Todos los turnos</option>
          <option v-for="turn in availableTurns" :key="turn" :value="turn">
            Turno {{ turn }}
          </option>
        </select>
      </div>
      
      <button @click="clearFilters" class="clear-filters-btn">
        <span class="btn-icon">🔄</span>
        <span class="btn-text">Limpiar Filtros</span>
      </button>
    </div>

    <!-- Logs -->
    <div class="logs-content">
      <div v-if="filteredLogs.length === 0" class="no-logs">
        <div class="no-logs-icon">📝</div>
        <h3>No hay logs para mostrar</h3>
        <p>Los logs aparecerán aquí cuando realices acciones con tu personaje</p>
      </div>
      
      <div v-else class="logs-list">
        <!-- Agrupación por turnos -->
        <div v-for="(turnLogs, turn) in groupedFilteredLogs" :key="turn" class="turn-group">
          <div class="turn-header">
            <h2 class="turn-title">
              <span class="turn-icon">🎲</span>
              Turno {{ turn }}
            </h2>
            <span class="turn-count">{{ turnLogs.length }} acciones</span>
          </div>
          
          <div class="turn-logs">
            <div 
              v-for="log in turnLogs" 
              :key="log.id" 
              class="log-entry"
              :class="getLogEntryClass(log.action)"
            >
              <div class="log-header">
                <div class="log-action">
                  <span class="action-icon">{{ getActionIcon(log.action) }}</span>
                  <span class="action-name">{{ log.action }}</span>
                </div>
                <div class="log-time">{{ log.timestamp }}</div>
              </div>
              
              <div class="log-details">
                <p class="log-description">{{ log.details }}</p>
                
                <!-- Cambios de HP si aplica -->
                <div v-if="log.hpBefore !== log.hpAfter || log.tempHpBefore !== log.tempHpAfter" class="hp-changes">
                  <div v-if="log.hpBefore !== log.hpAfter" class="hp-change">
                    <span class="change-label">HP:</span>
                    <span class="change-value" :class="getHpChangeClass(log.hpBefore, log.hpAfter)">
                      {{ log.hpBefore }} → {{ log.hpAfter }}
                    </span>
                  </div>
                  
                  <div v-if="log.tempHpBefore !== log.tempHpAfter" class="hp-change">
                    <span class="change-label">HP Temporal:</span>
                    <span class="change-value" :class="getHpChangeClass(log.tempHpBefore, log.tempHpAfter)">
                      {{ log.tempHpBefore }} → {{ log.tempHpAfter }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="logs-actions">
      <button @click="exportLogs" class="action-btn btn-export">
        <span class="btn-icon">📤</span>
        <span class="btn-text">Exportar Logs</span>
      </button>
      
      <button @click="goToCharacter" class="action-btn btn-character">
        <span class="btn-icon">👤</span>
        <span class="btn-text">Volver al Personaje</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'
import Swal from 'sweetalert2'

const router = useRouter()
const characterStore = useCharacterStore()

const selectedAction = ref('')
const selectedTurn = ref('')

onMounted(() => {
  // Cargar datos del localStorage
  characterStore.loadFromLocalStorage()
  
  // Si no hay personaje configurado, redirigir a configuración
  if (!characterStore.character.isConfigured) {
    router.push('/config')
  }
})

// Turnos disponibles para el filtro
const availableTurns = computed(() => {
  const turns = Object.keys(characterStore.logsByTurn).map(Number)
  return turns.sort((a, b) => b - a) // Orden descendente
})

// Logs filtrados
const filteredLogs = computed(() => {
  let logs = characterStore.logs
  
  if (selectedAction.value) {
    logs = logs.filter(log => log.action === selectedAction.value)
  }
  
  if (selectedTurn.value !== '') {
    logs = logs.filter(log => log.turn === selectedTurn.value)
  }
  
  return logs
})

// Logs agrupados por turno (filtrados)
const groupedFilteredLogs = computed(() => {
  const grouped = {}
  filteredLogs.value.forEach(log => {
    if (!grouped[log.turn]) {
      grouped[log.turn] = []
    }
    grouped[log.turn].push(log)
  })
  
  // Ordenar por turno descendente
  return Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a))
  )
})

// Limpiar filtros
const clearFilters = () => {
  selectedAction.value = ''
  selectedTurn.value = ''
}

// Obtener clase CSS para el log entry
const getLogEntryClass = (action) => {
  const actionClasses = {
    'Inicio de Turno': 'log-turn-start',
    'Fin de Turno': 'log-turn-end',
    'Curación': 'log-heal',
    'Regeneración Automática': 'log-regen',
    'Vida Temporal': 'log-temp',
    'Daño Recibido': 'log-damage',
    'Reset HP': 'log-reset',
    'Reset Turno': 'log-reset-turn',
    'Configuración': 'log-config'
  }
  return actionClasses[action] || 'log-default'
}

// Obtener icono para la acción
const getActionIcon = (action) => {
  const actionIcons = {
    'Inicio de Turno': '🎲',
    'Fin de Turno': '⏹️',
    'Curación': '💚',
    'Regeneración Automática': '🔄',
    'Vida Temporal': '🛡️',
    'Daño Recibido': '⚔️',
    'Reset HP': '🔄',
    'Reset Turno': '⏮️',
    'Configuración': '⚙️'
  }
  return actionIcons[action] || '📝'
}

// Obtener clase CSS para cambios de HP
const getHpChangeClass = (before, after) => {
  if (after > before) return 'hp-increase'
  if (after < before) return 'hp-decrease'
  return 'hp-no-change'
}

// Exportar logs
const exportLogs = () => {
  const logsText = characterStore.logs.map(log => {
    return `[${log.timestamp}] Turno ${log.turn} - ${log.action}: ${log.details}`
  }).join('\n')
  
  const blob = new Blob([logsText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dnd-logs-${characterStore.character.name}-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  Swal.fire({
    icon: 'success',
    title: 'Logs Exportados',
    text: 'Los logs se han descargado correctamente',
    timer: 2000,
    showConfirmButton: false
  })
}

// Ir al personaje
const goToCharacter = () => {
  router.push('/character')
}
</script>

<style scoped>
.logs-view-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.logs-header {
  text-align: center;
  margin-bottom: 30px;
}

.logs-title {
  color: #f39c12;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.logs-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stats-label {
  color: #ecf0f1;
  font-size: 0.9rem;
  opacity: 0.8;
}

.stats-value {
  color: #f39c12;
  font-size: 1.5rem;
  font-weight: bold;
}

.logs-filters {
  display: flex;
  gap: 20px;
  align-items: end;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  color: #ecf0f1;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
  font-size: 0.9rem;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #f39c12;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #ecf0f1;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.clear-filters-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.logs-content {
  margin-bottom: 30px;
}

.no-logs {
  text-align: center;
  padding: 60px 20px;
  color: #ecf0f1;
}

.no-logs-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-logs h3 {
  margin-bottom: 10px;
  color: #f39c12;
}

.no-logs p {
  opacity: 0.7;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.turn-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.turn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(243, 156, 18, 0.2);
  border-bottom: 1px solid rgba(243, 156, 18, 0.3);
}

.turn-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f39c12;
  margin: 0;
  font-size: 1.3rem;
}

.turn-icon {
  font-size: 1.5rem;
}

.turn-count {
  color: #ecf0f1;
  font-size: 0.9rem;
  opacity: 0.8;
}

.turn-logs {
  padding: 20px;
}

.log-entry {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.log-entry:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.log-entry:last-child {
  margin-bottom: 0;
}

/* Clases de log por tipo de acción */
.log-turn-start { border-left-color: #9b59b6; }
.log-turn-end { border-left-color: #95a5a6; }
.log-heal { border-left-color: #2ecc71; }
.log-regen { border-left-color: #27ae60; }
.log-temp { border-left-color: #3498db; }
.log-damage { border-left-color: #e74c3c; }
.log-reset { border-left-color: #f39c12; }
.log-reset-turn { border-left-color: #e67e22; }
.log-config { border-left-color: #34495e; }

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.log-action {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-icon {
  font-size: 1.2rem;
}

.action-name {
  color: #ecf0f1;
  font-weight: 600;
  font-size: 1rem;
}

.log-time {
  color: rgba(236, 240, 241, 0.7);
  font-size: 0.8rem;
}

.log-details {
  color: #ecf0f1;
}

.log-description {
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.hp-changes {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
}

.hp-change {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change-label {
  color: rgba(236, 240, 241, 0.8);
}

.change-value {
  font-weight: 600;
}

.hp-increase { color: #2ecc71; }
.hp-decrease { color: #e74c3c; }
.hp-no-change { color: #95a5a6; }

.logs-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.btn-export {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-character {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-text {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .logs-container {
    padding: 15px;
    min-height: calc(100vh - 65px);
  }
  
  .logs-header {
    margin-bottom: 20px;
    padding: 20px 15px;
  }
  
  .logs-title {
    font-size: 2rem;
    margin-bottom: 15px;
  }
  
  .logs-subtitle {
    font-size: 1rem;
  }
  
  .logs-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    margin-bottom: 20px;
    padding: 20px 15px;
  }
  
  .filter-group {
    margin-bottom: 0;
  }
  
  .filter-label {
    font-size: 0.95rem;
    margin-bottom: 6px;
  }
  
  .filter-select {
    min-width: auto;
    padding: 12px 16px;
    font-size: 1rem;
    min-height: 48px;
  }
  
  .logs-stats {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
    padding: 0 15px;
  }
  
  .stat-item {
    padding: 15px;
    border-radius: 12px;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
  }
  
  .logs-list {
    gap: 15px;
    padding: 0 15px;
  }
  
  .turn-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
    padding: 15px;
  }
  
  .turn-number {
    font-size: 1.4rem;
  }
  
  .turn-date {
    font-size: 0.9rem;
  }
  
  .log-item {
    padding: 15px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
  
  .log-action {
    font-size: 1rem;
    margin-bottom: 10px;
  }
  
  .log-details {
    gap: 8px;
  }
  
  .log-detail {
    font-size: 0.9rem;
    padding: 6px 10px;
  }
  
  .hp-change {
    margin-top: 10px;
  }
  
  .logs-actions {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: 25px;
    padding: 0 15px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
    padding: 18px 20px;
    min-height: 60px;
    font-size: 1.1rem;
  }
  
  .btn-icon {
    font-size: 1.3rem;
  }
  
  .btn-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .logs-container {
    padding: 10px;
  }
  
  .logs-header {
    padding: 15px 12px;
    margin-bottom: 15px;
  }
  
  .logs-title {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }
  
  .logs-subtitle {
    font-size: 0.95rem;
  }
  
  .logs-filters {
    padding: 15px 12px;
    margin-bottom: 15px;
  }
  
  .filter-select {
    padding: 14px 14px;
    min-height: 52px;
  }
  
  .logs-stats {
    padding: 0 10px;
    margin-bottom: 15px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.6rem;
  }
  
  .logs-list {
    padding: 0 10px;
    gap: 12px;
  }
  
  .turn-header {
    padding: 12px;
  }
  
  .turn-number {
    font-size: 1.3rem;
  }
  
  .log-item {
    padding: 12px;
    margin-bottom: 10px;
  }
  
  .log-action {
    font-size: 0.95rem;
  }
  
  .log-detail {
    font-size: 0.85rem;
    padding: 5px 8px;
  }
  
  .logs-actions {
    margin-top: 20px;
    padding: 0 10px;
    gap: 12px;
  }
  
  .action-btn {
    padding: 20px 16px;
    min-height: 65px;
    font-size: 1.15rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .action-btn:hover {
    transform: none;
  }
  
  .action-btn:active {
    transform: scale(0.98);
  }
  
  .filter-select:focus {
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.3);
  }
}
</style>
