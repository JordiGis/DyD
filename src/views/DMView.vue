<template>
  <div class="dm-view">
    <div class="dm-header">
      <h1 class="dm-title">
        <i class="bi bi-shield-fill"></i>
        Panel del Dungeon Master
      </h1>
      <div class="dm-controls">
        <div class="turn-controls">
          <span class="turn-label">Turno: {{ dmStore.currentTurn }}</span>
          <button @click="dmStore.startTurn()" class="btn btn-success" :disabled="dmStore.isTurnActive">
            <i class="bi bi-play-fill"></i>
            Iniciar Turno
          </button>
          <button @click="dmStore.endTurn()" class="btn btn-warning" :disabled="!dmStore.isTurnActive">
            <i class="bi bi-stop-fill"></i>
            Finalizar Turno
          </button>
          <button @click="dmStore.resetAllTurns()" class="btn btn-secondary">
            <i class="bi bi-arrow-clockwise"></i>
            Reset Turnos
          </button>
        </div>
        <div class="global-controls">
          <button @click="dmStore.resetAllCharacters()" class="btn btn-info">
            <i class="bi bi-heart-fill"></i>
            Reset Todos
          </button>
          <button @click="triggerFileImport" class="btn btn-outline-primary">
            <i class="bi bi-upload"></i>
            Importar
          </button>
          <button @click="exportData" class="btn btn-outline-success">
            <i class="bi bi-download"></i>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas generales -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ dmStore.characters.length }}</div>
          <div class="stat-label">Total Personajes</div>
        </div>
      </div>
      <div class="stat-card alive">
        <div class="stat-icon">❤️</div>
        <div class="stat-content">
          <div class="stat-value">{{ dmStore.aliveCount }}</div>
          <div class="stat-label">Vivos</div>
        </div>
      </div>
      <div class="stat-card dead">
        <div class="stat-icon">💀</div>
        <div class="stat-content">
          <div class="stat-value">{{ dmStore.deadCount }}</div>
          <div class="stat-label">Muertos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">{{ dmStore.currentTurn }}</div>
          <div class="stat-label">Turno Actual</div>
        </div>
      </div>
    </div>

    <!-- Botón para crear nuevo personaje -->
    <div class="create-character-section">
      <button @click="showCreateModal = true" class="btn btn-primary btn-lg">
        <i class="bi bi-plus-circle"></i>
        Crear Nuevo Personaje
      </button>
    </div>

    <!-- Lista de personajes -->
    <div class="characters-section">
      <div class="section-header">
        <h2>Personajes ({{ dmStore.characters.length }})</h2>
        <div class="sort-controls">
          <select v-model="sortBy" class="form-select">
            <option value="name">Ordenar por Nombre</option>
            <option value="hp">Ordenar por HP</option>
            <option value="created">Ordenar por Creación</option>
          </select>
        </div>
      </div>

      <div v-if="dmStore.characters.length === 0" class="no-characters">
        <div class="no-characters-icon">🎭</div>
        <h3>No hay personajes creados</h3>
        <p>Crea tu primer personaje para comenzar a gestionar la partida</p>
      </div>

      <div v-else class="characters-grid">
        <div v-for="character in sortedCharacters" :key="character.id" class="character-card" :class="{
          'dead': character.currentHp <= 0,
          'low-hp': character.currentHp > 0 && character.currentHp <= character.maxHp * 0.25
        }">
          <div class="character-header">
            <h3 class="character-name">{{ character.name }}</h3>
            <div class="character-actions">
              <button @click="editCharacter(character)" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-pencil"></i>
              </button>
              <button @click="deleteCharacter(character.id)" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <div class="character-stats">
            <div class="hp-section">
              <div class="hp-bar-container">
                <div class="hp-bar">
                  <div class="hp-fill" :style="{ width: `${(character.currentHp / character.maxHp) * 100}%` }"
                    :class="getHpBarColor(character)"></div>
                </div>
                <div class="hp-text">
                  {{ character.currentHp }} / {{ character.maxHp }} HP
                </div>
              </div>

              <div v-if="character.tempHp > 0" class="temp-hp">
                <span class="temp-hp-label">Temporal:</span>
                <span class="temp-hp-value">+{{ character.tempHp }}</span>
              </div>
            </div>

            <div class="character-details">
              <div class="detail-item">
                <span class="detail-label">Regeneración:</span>
                <span class="detail-value">{{ character.regeneration || 0 }} HP/turno</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span class="detail-value" :class="getStatusClass(character)">
                  {{ getStatusText(character) }}
                </span>
              </div>
            </div>
          </div>

          <div class="character-actions-panel">
            <div class="action-group">
              <label class="action-label">Daño:</label>
              <div class="action-inputs">
                <input v-model="character.damageInput" type="number" class="form-control form-control-sm"
                  placeholder="0" min="0">
                <button @click="applyDamage(character)" class="btn btn-sm btn-danger"
                  :disabled="!character.damageInput || character.damageInput <= 0">
                  <i class="bi bi-lightning"></i>
                </button>
              </div>
            </div>

            <div class="action-group">
              <label class="action-label">Curación:</label>
              <div class="action-inputs">
                <input v-model="character.healInput" type="number" class="form-control form-control-sm" placeholder="0"
                  min="0">
                <button @click="applyHeal(character)" class="btn btn-sm btn-success"
                  :disabled="!character.healInput || character.healInput <= 0">
                  <i class="bi bi-heart"></i>
                </button>
              </div>
            </div>

            <div class="action-group">
              <label class="action-label">Vida Temp:</label>
              <div class="action-inputs">
                <input v-model="character.tempHpInput" type="number" class="form-control form-control-sm"
                  placeholder="0" min="0">
                <button @click="applyTempHp(character)" class="btn btn-sm btn-info"
                  :disabled="!character.tempHpInput || character.tempHpInput <= 0">
                  <i class="bi bi-shield"></i>
                </button>
              </div>
            </div>

            <button @click="dmStore.resetCharacterToMaxHp(character.id)" class="btn btn-sm btn-outline-warning w-100">
              <i class="bi bi-arrow-clockwise"></i>
              Reset HP
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear personaje -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Crear Nuevo Personaje</h3>
          <button @click="showCreateModal = false" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createCharacter">
            <div class="form-group">
              <label for="characterName">Nombre del Personaje</label>
              <input id="characterName" v-model="newCharacter.name" type="text" class="form-control"
                placeholder="Ej: Gandalf" required>
            </div>
            <div class="form-group">
              <label for="characterMaxHp">HP Máximo</label>
              <input id="characterMaxHp" v-model="newCharacter.maxHp" type="number" class="form-control"
                placeholder="100" min="1" required>
            </div>
            <div class="form-group">
              <label for="characterRegeneration">Regeneración por Turno (opcional)</label>
              <input id="characterRegeneration" v-model="newCharacter.regeneration" type="number" class="form-control"
                placeholder="0" min="0">
            </div>
            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Crear Personaje
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal para editar personaje -->
    <div v-if="showEditModal && editingCharacter" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Personaje</h3>
          <button @click="showEditModal = false" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCharacterEdit">
            <div class="form-group">
              <label for="editCharacterName">Nombre del Personaje</label>
              <input id="editCharacterName" v-model="editingCharacter.name" type="text" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="editCharacterMaxHp">HP Máximo</label>
              <input id="editCharacterMaxHp" v-model="editingCharacter.maxHp" type="number" class="form-control" min="1"
                required>
            </div>
            <div class="form-group">
              <label for="editCharacterCurrentHp">HP Actual</label>
              <input id="editCharacterCurrentHp" v-model="editingCharacter.currentHp" type="number" class="form-control"
                min="0" :max="editingCharacter.maxHp" required>
            </div>
            <div class="form-group">
              <label for="editCharacterRegeneration">Regeneración por Turno</label>
              <input id="editCharacterRegeneration" v-model="editingCharacter.regeneration" type="number"
                class="form-control" min="0">
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Input de archivo oculto para importación -->
    <input ref="fileInput" type="file" accept=".json" @change="handleFileImport" style="display: none">

    <!-- Modal para importar -->
    <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Importar Personajes</h3>
          <button @click="showImportModal = false" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="import-options">
            <div class="import-option">
              <h4>Opción 1: Seleccionar Archivo</h4>
              <p>Selecciona un archivo JSON exportado previamente</p>
              <button @click="triggerFileImport" class="btn btn-primary">
                <i class="bi bi-folder2-open"></i>
                Seleccionar Archivo
              </button>
            </div>

            <div class="import-divider">
              <span>o</span>
            </div>

            <div class="import-option">
              <h4>Opción 2: Pegar JSON</h4>
              <p>Pega aquí el contenido JSON exportado</p>
              <textarea v-model="importData" class="form-control" rows="6"
                placeholder="Pega aquí el JSON exportado..."></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showImportModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="importCharacters" class="btn btn-primary" :disabled="!importData.trim()">
              Importar desde Texto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDMStore } from '../stores/useDMStore'

const dmStore = useDMStore()

// Estado local
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showImportModal = ref(false)
const editingCharacter = ref(null)
const sortBy = ref('name')
const importData = ref('')

// Referencias
const fileInput = ref(null)

// Nuevo personaje
const newCharacter = ref({
  name: '',
  maxHp: '',
  regeneration: ''
})

// Computed
const sortedCharacters = computed(() => {
  switch (sortBy.value) {
    case 'hp':
      return dmStore.charactersByHp
    case 'created':
      return [...dmStore.characters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default:
      return dmStore.charactersByName
  }
})

// Métodos
const createCharacter = () => {
  if (newCharacter.value.name && newCharacter.value.maxHp) {
    dmStore.createCharacter(
      newCharacter.value.name,
      newCharacter.value.maxHp,
      newCharacter.value.regeneration
    )

    // Reset form
    newCharacter.value = { name: '', maxHp: '', regeneration: '' }
    showCreateModal.value = false
  }
}

const editCharacter = (character) => {
  editingCharacter.value = { ...character }
  showEditModal.value = true
}

const saveCharacterEdit = () => {
  if (editingCharacter.value) {
    dmStore.editCharacter(editingCharacter.value.id, {
      name: editingCharacter.value.name,
      maxHp: editingCharacter.value.maxHp,
      currentHp: editingCharacter.value.currentHp,
      regeneration: editingCharacter.value.regeneration
    })
    showEditModal.value = false
    editingCharacter.value = null
  }
}

const deleteCharacter = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este personaje?')) {
    dmStore.deleteCharacter(id)
  }
}

const applyDamage = (character) => {
  if (character.damageInput && character.damageInput > 0) {
    dmStore.damageCharacter(character.id, character.damageInput)
    character.damageInput = ''
  }
}

const applyHeal = (character) => {
  if (character.healInput && character.healInput > 0) {
    dmStore.healCharacter(character.id, character.healInput)
    character.healInput = ''
  }
}

const applyTempHp = (character) => {
  if (character.tempHpInput && character.tempHpInput > 0) {
    dmStore.addTempHpToCharacter(character.id, character.tempHpInput)
    character.tempHpInput = ''
  }
}

const getHpBarColor = (character) => {
  const percentage = (character.currentHp / character.maxHp) * 100
  if (percentage > 75) return 'hp-high'
  if (percentage > 50) return 'hp-medium'
  if (percentage > 25) return 'hp-low'
  return 'hp-critical'
}

const getStatusClass = (character) => {
  if (character.currentHp <= 0) return 'status-dead'
  if (character.currentHp <= character.maxHp * 0.25) return 'status-critical'
  if (character.currentHp <= character.maxHp * 0.5) return 'status-wounded'
  return 'status-healthy'
}

const getStatusText = (character) => {
  if (character.currentHp <= 0) return 'Muerto'
  if (character.currentHp <= character.maxHp * 0.25) return 'Crítico'
  if (character.currentHp <= character.maxHp * 0.5) return 'Herido'
  return 'Saludable'
}

const exportData = () => {
  const data = dmStore.exportCharacters()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dnd-characters-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const triggerFileImport = () => {
  fileInput.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        if (dmStore.importCharacters(content)) {
          alert('Personajes importados correctamente desde el archivo')
          showImportModal.value = false
          // Limpiar el input de archivo
          event.target.value = ''
        } else {
          alert('Error al importar los personajes. Verifica que el archivo contenga datos válidos.')
        }
      } catch (error) {
        alert('Error al leer el archivo. Verifica que sea un archivo JSON válido.')
        console.error('Error importing file:', error)
      }
    }
    reader.onerror = () => {
      alert('Error al leer el archivo. Inténtalo de nuevo.')
    }
    reader.readAsText(file)
  }
}

const importCharacters = () => {
  if (importData.value.trim()) {
    if (dmStore.importCharacters(importData.value)) {
      alert('Personajes importados correctamente')
      importData.value = ''
      showImportModal.value = false
    } else {
      alert('Error al importar los personajes. Verifica el formato JSON.')
    }
  }
}

// Inicializar inputs para cada personaje
const initializeCharacterInputs = () => {
  dmStore.characters.forEach(character => {
    character.damageInput = ''
    character.healInput = ''
    character.tempHpInput = ''
  })
}

// Lifecycle
onMounted(() => {
  dmStore.loadFromLocalStorage()
  initializeCharacterInputs()
})
</script>

<style scoped>
.dm-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dm-header {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dm-title {
  color: #f39c12;
  font-size: 2.5rem;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.dm-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.turn-controls,
.global-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.turn-label {
  color: #ecf0f1;
  font-size: 1.2rem;
  font-weight: bold;
  background: rgba(243, 156, 18, 0.2);
  padding: 8px 15px;
  border-radius: 8px;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(243, 156, 18, 0.3);
}

.stat-card.alive {
  border-color: rgba(46, 204, 113, 0.3);
}

.stat-card.dead {
  border-color: rgba(231, 76, 60, 0.3);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #f39c12;
  line-height: 1;
}

.stat-label {
  color: #bdc3c7;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.create-character-section {
  text-align: center;
  margin-bottom: 30px;
}

.characters-section {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h2 {
  color: #ecf0f1;
  margin: 0;
  font-size: 1.8rem;
}

.sort-controls {
  min-width: 200px;
}

.no-characters {
  text-align: center;
  padding: 60px 20px;
  color: #bdc3c7;
}

.no-characters-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 25px;
}

.character-card {
  background: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.character-card:hover {
  transform: translateY(-2px);
  border-color: rgba(243, 156, 18, 0.3);
}

.character-card.dead {
  border-color: rgba(231, 76, 60, 0.5);
  opacity: 0.7;
}

.character-card.low-hp {
  border-color: rgba(230, 126, 34, 0.5);
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.character-name {
  color: #ecf0f1;
  margin: 0;
  font-size: 1.4rem;
}

.character-actions {
  display: flex;
  gap: 8px;
}

.hp-section {
  margin-bottom: 20px;
}

.hp-bar-container {
  margin-bottom: 10px;
}

.hp-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hp-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.hp-fill.hp-high {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
}

.hp-fill.hp-medium {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.hp-fill.hp-low {
  background: linear-gradient(90deg, #e67e22, #d35400);
}

.hp-fill.hp-critical {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.hp-text {
  text-align: center;
  color: #ecf0f1;
  font-weight: bold;
  font-size: 1.1rem;
}

.temp-hp {
  text-align: center;
  margin-top: 8px;
}

.temp-hp-label {
  color: #bdc3c7;
  font-size: 0.9rem;
  margin-right: 8px;
}

.temp-hp-value {
  color: #3498db;
  font-weight: bold;
  font-size: 1rem;
}

.character-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #bdc3c7;
  font-size: 0.9rem;
}

.detail-value {
  color: #ecf0f1;
  font-weight: 500;
}

.status-healthy {
  color: #27ae60;
}

.status-wounded {
  color: #f39c12;
}

.status-critical {
  color: #e67e22;
}

.status-dead {
  color: #e74c3c;
}

.character-actions-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-label {
  color: #bdc3c7;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-inputs {
  display: flex;
  gap: 8px;
}

.action-inputs input {
  flex: 1;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 15px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: #ecf0f1;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #bdc3c7;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: #ecf0f1;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #ecf0f1;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ecf0f1;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
}

.form-control::placeholder {
  color: #7f8c8d;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.import-options {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.import-option {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.import-option h4 {
  color: #f39c12;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.import-option p {
  color: #bdc3c7;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
}

.import-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 10px 0;
}

.import-divider::before,
.import-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.import-divider span {
  padding: 0 15px;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .dm-view {
    padding: 15px;
  }

  .dm-header {
    padding: 20px;
  }

  .dm-title {
    font-size: 2rem;
  }

  .dm-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .turn-controls,
  .global-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-controls {
    min-width: auto;
  }

  .modal-content {
    margin: 20px;
    max-height: calc(100vh - 40px);
  }

  .import-options {
    gap: 20px;
  }

  .import-option {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .character-card {
    padding: 15px;
  }

  .character-actions-panel {
    gap: 12px;
  }

  .action-inputs {
    flex-direction: column;
  }

  .import-option {
    padding: 12px;
  }

  .import-option h4 {
    font-size: 1rem;
  }

  .import-option p {
    font-size: 0.85rem;
  }
}
</style>
