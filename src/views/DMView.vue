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
          <button
            @click="dmStore.startTurn()"
            class="btn btn-success"
            :disabled="dmStore.isTurnActive"
          >
            <i class="bi bi-play-fill"></i>
            Iniciar Turno
          </button>
          <button
            @click="dmStore.endTurn()"
            class="btn btn-warning"
            :disabled="!dmStore.isTurnActive"
          >
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
          <button @click="clearAllLogs" class="btn btn-warning">
            <i class="bi bi-trash"></i>
            Limpiar Logs
          </button>
          <button @click="viewAllLogs" class="btn btn-outline-info">
            <i class="bi bi-journal-text"></i>
            Ver Logs
          </button>
          <button @click="triggerFileImport" class="btn btn-outline-primary">
            <i class="bi bi-upload"></i>
            Importar
          </button>
          <button @click="exportData" class="btn btn-outline-success">
            <i class="bi bi-download"></i>
            Exportar
          </button>
          <button @click="toggleDraggableList" class="btn btn-outline-secondary">
            <i class="bi bi-list"></i>
            Lista Iniciativa
          </button>
          <button @click="showTodoModal = true" class="btn btn-outline-primary">
            <i class="bi bi-check-circle"></i>
            Todo List
          </button>
          <button @click="showDiceRoller = true" class="btn btn-outline-info">
            <i class="bi bi-dice-6"></i>
            Lanzar Dados
          </button>
          <button @click="showDMAttackManager = true" class="btn btn-outline-warning">
            <i class="bi bi-hammer"></i>
            Gestor de Ataques
          </button>
          <button @click="showPlayerManager = true" class="btn btn-outline-info">
            <i class="bi bi-person-badge"></i>
            Gestión de Jugadores
          </button>
        </div>
      </div>
    </div>
    <DiceRoller
      v-if="showDiceRoller"
      :characters="dmStore.characters"
      @close="showDiceRoller = false"
    />
    <DMAttackManager
      v-if="showDMAttackManager"
      @close="showDMAttackManager = false"
    />
    <PlayerManager
      v-if="showPlayerManager"
      @close="showPlayerManager = false"
    />

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
        <div
          v-for="character in sortedCharacters"
          :key="character.id"
          class="character-card"
          :class="{
            dead: character.currentHp <= 0,
            'low-hp':
              character.currentHp > 0 &&
              character.currentHp <= character.maxHp * 0.25
          }"
        >
          <div class="character-header">
            <h3 class="character-name">{{ character.name }}</h3>
            <div class="character-actions">
              <button
                @click="editCharacter(character)"
                class="btn btn-sm btn-outline-primary"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                @click="duplicateCharacter(character)"
                class="btn btn-sm btn-outline-info"
                title="Duplicar personaje"
              >
                <i class="bi bi-copy"></i>
              </button>
              <button
                @click="deleteCharacter(character.id)"
                class="btn btn-sm btn-outline-danger"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <div class="character-stats">
            <div class="hp-section">
                            <div class="hp-bar-container">
                <div class="hp-bar">
                  <div
                    class="hp-fill"
                    :style="{
                      width: `${(character.currentHp / character.maxHp) * 100}%`
                    }"
                    :class="
                      character.tempHp > 0
                        ? 'temp-hp'
                        : getHpBarColor(character)
                    "
                  ></div>
                  <!-- Indicador de daño necro en la barra -->
                  <div
                    v-if="character.maxHp < character.originalMaxHp"
                    class="necro-bar-indicator"
                    :style="{
                      left: `${(character.maxHp / character.originalMaxHp) * 100}%`
                    }"
                    title="HP máximo reducido por daño necro"
                  ></div>
                </div>
                <div class="hp-text">
                  {{ character.currentHp }} / {{ character.maxHp }} HP ({{
                    Math.round((character.currentHp / character.maxHp) * 100)
                  }}%)
                  <span v-if="character.maxHp < character.originalMaxHp" class="necro-indicator" title="HP máximo reducido por daño necro">
                    ⚠️
                  </span>
                </div>
              </div>

              <div v-if="character.tempHp > 0" class="temp-hp">
                <span class="temp-hp-label">Temporal:</span>
                <span class="temp-hp-value">+{{ character.tempHp }}</span>
              </div>

              <!-- Mostrar el héroe que derrotó al personaje -->
              <div v-if="character.defeatedBy" class="defeated-by">
                <span class="defeated-by-label">Derrotado por:</span>
                <span class="defeated-by-hero">{{ character.defeatedBy }}</span>
              </div>
            </div>

            <div class="character-details">
              <div class="detail-item">
                <span class="detail-label">Regeneración:</span>
                <span class="detail-value"
                  >{{ character.regeneration || 0 }} HP/turno</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">Estado:</span>
                <span class="detail-value" :class="getStatusClass(character)">
                  {{ getStatusText(character) }}
                </span>
              </div>
              <div v-if="character.xp" class="detail-item">
                <span class="detail-label">XP:</span>
                <span class="detail-value">{{ character.xp }}</span>
              </div>
              <div v-if="character.ca" class="detail-item">
                <span class="detail-label">CA:</span>
                <span class="detail-value">{{ character.ca }}</span>
              </div>
              <div v-if="character.resistencias" class="detail-item">
                <span class="detail-label">Resistencias:</span>
                <span class="detail-value">{{ character.resistencias }}</span>
              </div>
              <div v-if="character.inmunidades" class="detail-item">
                <span class="detail-label">Inmunidades:</span>
                <span class="detail-value">{{ character.inmunidades }}</span>
              </div>
              <div v-if="character.bonoTiradasSalvacion" class="detail-item">
                <span class="detail-label">Bono Tiradas de Salvacion:</span>
                <span class="detail-value">{{ character.bonoTiradasSalvacion }}</span>
              </div>
              
              <!-- Atributos con colores -->
              <div v-if="hasAnyAttribute(character)" class="attributes-display">
                <div class="attributes-header">Tiradas de Salvación</div>
                <div class="attributes-list">
                  <div v-if="character.fuerza" class="attribute-item fuerza">
                    <span class="attribute-label">FUE:</span>
                    <span class="attribute-value">{{ formatModifier(character.fuerza) }}</span>
                  </div>
                  <div v-if="character.inteligencia" class="attribute-item inteligencia">
                    <span class="attribute-label">INT:</span>
                    <span class="attribute-value">{{ formatModifier(character.inteligencia) }}</span>
                  </div>
                  <div v-if="character.destreza" class="attribute-item destreza">
                    <span class="attribute-label">DES:</span>
                    <span class="attribute-value">{{ formatModifier(character.destreza) }}</span>
                  </div>
                  <div v-if="character.sabiduria" class="attribute-item sabiduria">
                    <span class="attribute-label">SAB:</span>
                    <span class="attribute-value">{{ formatModifier(character.sabiduria) }}</span>
                  </div>
                  <div v-if="character.constitucion" class="attribute-item constitucion">
                    <span class="attribute-label">CON:</span>
                    <span class="attribute-value">{{ formatModifier(character.constitucion) }}</span>
                  </div>
                  <div v-if="character.carisma" class="attribute-item carisma">
                    <span class="attribute-label">CAR:</span>
                    <span class="attribute-value">{{ formatModifier(character.carisma) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="character.notas" class="detail-item notas">
                <span class="detail-label">Notas:</span>
                <span class="detail-value">{{ character.notas }}</span>
              </div>
            </div>
          </div>

          <div class="actions-toggle">
  <button
    @click="toggleCharacterActions(character.id)"
    class="toggle-actions-btn"
    :class="{ collapsed: isCharacterCollapsed(character.id) }"
  >
    <i class="bi bi-chevron-up"></i>
    {{ isCharacterCollapsed(character.id) ? 'Mostrar Acciones' : 'Ocultar Acciones' }}
  </button>
</div>

<!-- Panel de acciones (ahora con capacidad de plegado) -->
<div 
  class="character-actions-panel"
  :class="{ collapsed: isCharacterCollapsed(character.id) }"
>
  <div class="action-group">
    <label class="action-label">Daño:</label>
    <div class="action-inputs">
      <input
        v-model="character.damageInput"
        type="number"
        class="form-control form-control-sm"
        placeholder="0"
        min="0"
        @keyup.enter="applyDamage(character)"
      />
      <button
        @click="applyDamage(character)"
        class="btn btn-sm btn-danger"
        :disabled="
          !character.damageInput || character.damageInput <= 0
        "
      >
        <i class="bi bi-lightning"></i>
      </button>
    </div>
    <div class="necro-checkbox">
      <label class="necro-label">
        <input
          v-model="character.necroDamage"
          type="checkbox"
          class="necro-input"
        />
        <span class="necro-text">Daño Necro</span>
        <i 
          class="bi bi-info-circle necro-info-icon" 
          title="El daño necro reduce permanentemente el HP máximo hasta que se restaure. Afecta tanto a la vida temporal como a la vida actual."
        ></i>
      </label>
    </div>
  </div>

  <div class="action-group">
    <label class="action-label">Daño Resistente:</label>
    <div class="action-inputs">
      <input
        v-model="character.resistantDamageInput"
        type="number"
        class="form-control form-control-sm"
        placeholder="0"
        min="0"
        @keyup.enter="applyResistantDamage(character)"
      />
      <button
        @click="applyResistantDamage(character)"
        class="btn btn-sm btn-danger"
        :disabled="
          !character.resistantDamageInput ||
          character.resistantDamageInput <= 0
        "
      >
        <i class="bi bi-shield-slash"></i>
      </button>
    </div>
    <div class="necro-checkbox">
      <label class="necro-label">
        <input
          v-model="character.necroResistantDamage"
          type="checkbox"
          class="necro-input"
        />
        <span class="necro-text">Daño Necro</span>
        <i 
          class="bi bi-info-circle necro-info-icon" 
          title="El daño necro reduce permanentemente el HP máximo hasta que se restaure. Afecta tanto a la vida temporal como a la vida actual."
        ></i>
      </label>
    </div>
  </div>

    <div class="action-group">
      <label class="action-label">Curación:</label>
      <div class="action-inputs">
        <input
          v-model="character.healInput"
          type="number"
          class="form-control form-control-sm"
          placeholder="0"
          min="0"
          @keyup.enter="applyHeal(character)"
        />
        <button
          @click="applyHeal(character)"
          class="btn btn-sm btn-success"
          :disabled="!character.healInput || character.healInput <= 0"
        >
          <i class="bi bi-heart"></i>
        </button>
      </div>
    </div>

    <div class="action-group">
      <label class="action-label">Vida Temp:</label>
      <div class="action-inputs">
        <input
          v-model="character.tempHpInput"
          type="number"
          class="form-control form-control-sm"
          placeholder="0"
          min="0"
          @keyup.enter="applyTempHp(character)"
        />
        <button
          @click="applyTempHp(character)"
          class="btn btn-sm btn-info"
          :disabled="
            !character.tempHpInput || character.tempHpInput <= 0"
        >
          <i class="bi bi-shield"></i>
        </button>
      </div>
    </div>

    <div class="reset-buttons">
      <button
        @click="dmStore.resetCharacterToMaxHp(character.id)"
        class="btn btn-sm btn-outline-warning"
        :class="{ 'w-100': character.maxHp >= character.originalMaxHp }"
      >
        <i class="bi bi-arrow-clockwise"></i>
        Reset HP
      </button>
      <button
        v-if="character.maxHp < character.originalMaxHp"
        @click="restoreMaxHp(character.id)"
        class="btn btn-sm btn-outline-danger"
        title="Restaurar solo el HP máximo (daño necro)"
      >
        <i class="bi bi-heart-pulse"></i>
        Restaurar HP Máx
      </button>
    </div>

    <button
      v-if="character.currentHp <= 0"
      @click="revivir(character.id)"
      class="btn btn-sm btn-success w-100"
    >
      <i class="bi bi-heart-pulse"></i>
      Revivir
    </button>
  </div>
        </div>
      </div>

      <!-- Modal para crear personaje -->
      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click="showCreateModal = false"
      >
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
                <input
                  id="characterName"
                  v-model="newCharacter.name"
                  type="text"
                  class="form-control"
                  placeholder="Ej: Gandalf"
                  required
                />
              </div>
              <div class="form-group">
                <label for="characterMaxHp">HP Máximo</label>
                <input
                  id="characterMaxHp"
                  v-model="newCharacter.maxHp"
                  type="number"
                  class="form-control"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
              <div class="form-group">
                <label for="characterRegeneration"
                  >Regeneración por Turno (opcional)</label
                >
                <input
                  id="characterRegeneration"
                  v-model="newCharacter.regeneration"
                  type="number"
                  class="form-control"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="xp">XP:</label>
                <input
                  id="xp"
                  v-model="newCharacter.xp"
                  type="text"
                  class="form-control"
                  placeholder=""
                />
              </div>
              <div class="form-group">
                <label for="ca">CA (Clase de Armadura):</label>
                <input
                  id="ca"
                  v-model="newCharacter.ca"
                  type="text"
                  class="form-control"
                  placeholder=""
                />
              </div>
              <div class="form-group">
                <label for="resistencias">Resistencias:</label>
                <input
                  id="resistencias"
                  v-model="newCharacter.resistencias"
                  type="text"
                  class="form-control"
                  placeholder=""
                />
              </div>
              <div class="form-group">
                <label for="inmunidades">Inmunidades:</label>
                <input
                  id="inmunidades"
                  v-model="newCharacter.inmunidades"
                  type="text"
                  class="form-control"
                  placeholder=""
                />
              </div>
              
              <!-- Atributos en dos columnas -->
              <div class="attributes-section">
                <h4 style="color: #ecf0f1; margin-bottom: 15px;">Tiradas de Salvación</h4>
                <div class="attributes-grid" id="tiradas-salvacion">
                  <div class="attribute-column">
                    <div class="form-group attribute-input">
                      <label for="fuerza">Fuerza:</label>
                      <input
                        id="fuerza"
                        v-model="newCharacter.fuerza"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="destreza">Destreza:</label>
                      <input
                        id="destreza"
                        v-model="newCharacter.destreza"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="constitucion">Constitución:</label>
                      <input
                        id="constitucion"
                        v-model="newCharacter.constitucion"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                  </div>
                  <div class="attribute-column">
                    <div class="form-group attribute-input">
                      <label for="inteligencia">Inteligencia:</label>
                      <input
                        id="inteligencia"
                        v-model="newCharacter.inteligencia"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="sabiduria">Sabiduría:</label>
                      <input
                        id="sabiduria"
                        v-model="newCharacter.sabiduria"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="carisma">Carisma:</label>
                      <input
                        id="carisma"
                        v-model="newCharacter.carisma"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="notas">Notas:</label>
                <textarea
                  id="notas"
                  v-model="newCharacter.notas"
                  class="form-control"
                  rows="3"
                  placeholder=""
                ></textarea>
              </div>
              <div class="modal-actions">
                <button
                  type="button"
                  @click="showCreateModal = false"
                  class="btn btn-secondary"
                >
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
      <div
        v-if="showEditModal && editingCharacter"
        class="modal-overlay"
        @click="showEditModal = false"
      >
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
                <input
                  id="editCharacterName"
                  v-model="editingCharacter.name"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
              <div class="form-group">
                <label for="editCharacterMaxHp">HP Máximo</label>
                <input
                  id="editCharacterMaxHp"
                  v-model="editingCharacter.maxHp"
                  type="number"
                  class="form-control"
                  min="1"
                  required
                />
              </div>
              <div class="form-group">
                <label for="editCharacterCurrentHp">HP Actual</label>
                <input
                  id="editCharacterCurrentHp"
                  v-model="editingCharacter.currentHp"
                  type="number"
                  class="form-control"
                  min="0"
                  :max="editingCharacter.maxHp"
                  required
                />
              </div>
              <div class="form-group">
                <label for="editCharacterRegeneration"
                  >Regeneración por Turno</label
                >
                <input
                  id="editCharacterRegeneration"
                  v-model="editingCharacter.regeneration"
                  type="number"
                  class="form-control"
                  min="0"
                />
              </div>
              <div class="form-group">
                <label for="editXp">XP:</label>
                <input
                  id="editXp"
                  v-model="editingCharacter.xp"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="editCa">CA (Clase de Armadura):</label>
                <input
                  id="editCa"
                  v-model="editingCharacter.ca"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="editResistencias">Resistencias:</label>
                <input
                  id="editResistencias"
                  v-model="editingCharacter.resistencias"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="editInmunidades">Inmunidades:</label>
                <input
                  id="editInmunidades"
                  v-model="editingCharacter.inmunidades"
                  type="text"
                  class="form-control"
                />
              </div>
              
              <!-- Atributos en dos columnas -->
              <div class="attributes-section">
                <h4 style="color: #ecf0f1; margin-bottom: 15px;">Tiradas de Salvación</h4>
                <div class="attributes-grid">
                  <div class="attribute-column">
                    <div class="form-group attribute-input">
                      <label for="editFuerza">Fuerza:</label>
                      <input
                        id="editFuerza"
                        v-model="editingCharacter.fuerza"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="editDestreza">Destreza:</label>
                      <input
                        id="editDestreza"
                        v-model="editingCharacter.destreza"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="editConstitucion">Constitución:</label>
                      <input
                        id="editConstitucion"
                        v-model="editingCharacter.constitucion"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                  </div>
                  <div class="attribute-column">
                    <div class="form-group attribute-input">
                      <label for="editInteligencia">Inteligencia:</label>
                      <input
                        id="editInteligencia"
                        v-model="editingCharacter.inteligencia"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="editSabiduria">Sabiduría:</label>
                      <input
                        id="editSabiduria"
                        v-model="editingCharacter.sabiduria"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                    <div class="form-group attribute-input">
                      <label for="editCarisma">Carisma:</label>
                      <input
                        id="editCarisma"
                        v-model="editingCharacter.carisma"
                        type="number"
                        class="form-control small-input"
                        placeholder="+0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="editNotas">Notas:</label>
                <textarea
                  id="editNotas"
                  v-model="editingCharacter.notas"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
              <div class="modal-actions">
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="btn btn-secondary"
                >
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
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileImport"
        style="display: none"
      />

      <!-- Modal para importar -->
      <div
        v-if="showImportModal"
        class="modal-overlay"
        @click="showImportModal = false"
      >
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
                <textarea
                  v-model="importData"
                  class="form-control"
                  rows="6"
                  placeholder="Pega aquí el JSON exportado..."
                ></textarea>
              </div>
            </div>

            <div class="modal-actions">
              <button
                type="button"
                @click="showImportModal = false"
                class="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                @click="importCharacters"
                class="btn btn-primary"
                :disabled="!importData.trim()"
              >
                Importar desde Texto
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de muerte -->
      <div
        v-if="showDeathModal"
        class="modal-overlay"
        @click="closeDeathModalIfEmpty"
      >
        <div class="modal-content death-modal" @click.stop>
          <div class="modal-header">
            <h3>¡Personaje Derrotado!</h3>
            <button @click="showDeathModal = false" class="btn-close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="death-notification">
              <div class="death-icon">💀</div>
              <p>
                ¡El personaje <strong>{{ defeatedCharacter.name }}</strong> ha
                sido derrotado!
              </p>
              <p class="hp-status">
                HP:
                <span class="hp-dead">{{ defeatedCharacter.currentHp }}</span> /
                {{ defeatedCharacter.maxHp }}
              </p>
              <p>¿Quién fue el héroe que lo derrotó?</p>
            </div>
            <div class="form-group">
              <label for="heroName">Nombre del Héroe:</label>
              <input
                id="heroName"
                v-model="heroName"
                type="text"
                class="form-control"
                placeholder="Escribe el nombre del héroe..."
                @keyup.enter="saveHeroName"
              />
            </div>
            <div class="modal-actions">
              <button
                @click="saveHeroName"
                class="btn btn-primary"
                :disabled="!heroName.trim()"
              >
                <i class="bi bi-save"></i>
                Guardar
              </button>
              <button @click="closeDeathModal" class="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para la lista de tareas -->
    <div v-if="showTodoModal" class="modal-overlay" id="todo-list" @click="showTodoModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Lista de Tareas</h3>
          <button @click="showTodoModal = false" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="add-todo">
            <input
              v-model="newTodoItem"
              type="text"
              class="form-control"
              placeholder="Nueva tarea"
              @keyup.enter="addTodoItem"
            />
            <button @click="addTodoItem" class="btn btn-primary">Agregar</button>
          </div>
          <ul class="todo-list">
            <li v-for="item in todoItems" :key="item.id">
              <input type="checkbox" v-model="item.completed" @change="toggleTodoItem(item.id)" />
              <span :class="{ completed: item.completed }">{{ item.text }}</span>
              <button @click="deleteTodoItem(item.id)" class="btn btn-danger btn-sm">Eliminar</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Lista flotante draggable -->
    <DraggableList
      v-if="showDraggableList"
      :characters="dmStore.characters"
      :players="players"
      @close="showDraggableList = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useDMStore } from "../stores/useDMStore";
import { usePlayerStore } from "../stores/usePlayerStore";
import { storeToRefs } from "pinia";
import Swal from "sweetalert2";
import DraggableList from "../components/DraggableList.vue";
import DiceRoller from "../components/DiceRoller.vue";
import DMAttackManager from "../components/DMAttackManager.vue";
import PlayerManager from "../components/PlayerManager.vue"; // Importar el nuevo componente

const dmStore = useDMStore();
const playerStore = usePlayerStore();
const { players } = storeToRefs(playerStore);

const showDraggableList = ref(false);
const showDiceRoller = ref(false);
const showDMAttackManager = ref(false);
const showPlayerManager = ref(false); // Estado para el nuevo modal

// Estado local
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showImportModal = ref(false);
const showDeathModal = ref(false);
const showTodoModal = ref(false);
const sortBy = ref("name");
const importData = ref("");

const defeatedCharacter = ref(null);
const heroName = ref("");
const todoItems = ref([]);
const newTodoItem = ref("");

// Referencia para el input de archivo
const fileInput = ref(null);

// Personaje en edición
const editingCharacter = ref(null);

// Nuevo personaje
const newCharacter = ref({
  name: "",
  maxHp: "",
  regeneration: "",
  xp: "",
  resistencias: "",
  inmunidades: "",
  fuerza: "",
  destreza: "",
  constitucion: "",
  inteligencia: "",
  sabiduria: "",
  carisma: "",
  notas: "",
  ca: "",
  necroDamage: false,
  necroResistantDamage: false
});

// Computed
const sortedCharacters = computed(() => {
  switch (sortBy.value) {
    case "hp":
      return dmStore.charactersByHp;
    case "created":
      return [...dmStore.characters].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    default:
      return dmStore.charactersByName;
}});

// Métodos
const createCharacter = () => {
  if (newCharacter.value.name && newCharacter.value.maxHp) {
    dmStore.createCharacter(
      newCharacter.value.name,
      newCharacter.value.maxHp,
      newCharacter.value.regeneration,
      newCharacter.value.xp,
      newCharacter.value.resistencias,
      newCharacter.value.inmunidades,
      newCharacter.value.fuerza,
      newCharacter.value.destreza,
      newCharacter.value.constitucion,
      newCharacter.value.inteligencia,
      newCharacter.value.sabiduria,
      newCharacter.value.carisma,
      newCharacter.value.notas,
      newCharacter.value.ca
    );

    // Reset form
    newCharacter.value = { name: "", maxHp: "", regeneration: "", xp: "", resistencias: "", inmunidades: "", fuerza: "", destreza: "", constitucion: "", inteligencia: "", sabiduria: "", carisma: "", notas: "", ca: "", necroDamage: false, necroResistantDamage: false };
    showCreateModal.value = false;
  }
};

const editCharacter = (character) => {
  editingCharacter.value = { ...character };
  showEditModal.value = true;
};

const saveCharacterEdit = () => {
  if (editingCharacter.value) {
    dmStore.editCharacter(editingCharacter.value.id, {
      name: editingCharacter.value.name,
      maxHp: editingCharacter.value.maxHp,
      currentHp: editingCharacter.value.currentHp,
      regeneration: editingCharacter.value.regeneration,
      xp: editingCharacter.value.xp,
      resistencias: editingCharacter.value.resistencias,
      inmunidades: editingCharacter.value.inmunidades,
      fuerza: editingCharacter.value.fuerza,
      destreza: editingCharacter.value.destreza,
      constitucion: editingCharacter.value.constitucion,
      inteligencia: editingCharacter.value.inteligencia,
      sabiduria: editingCharacter.value.sabiduria,
      carisma: editingCharacter.value.carisma,
      notas: editingCharacter.value.notas,
      ca: editingCharacter.value.ca
    });
    showEditModal.value = false;
    editingCharacter.value = null;
  }
};

const deleteCharacter = (id) => {
  if (confirm("¿Estás seguro de que quieres eliminar este personaje?")) {
    dmStore.deleteCharacter(id);
  }
};

const duplicateCharacter = (character) => {
  // Clonación profunda del personaje
  const duplicatedCharacter = JSON.parse(JSON.stringify(character));
  // Generar nuevo id y fecha
  duplicatedCharacter.id = Date.now() + Math.random();
  duplicatedCharacter.createdAt = new Date().toISOString();
  // Cambiar el nombre, asegurando que sea único
  let duplicatedName = `${character.name} (Copia)`;
  let finalName = duplicatedName;
  let counter = 1;
  while (dmStore.getCharacterByName(finalName)) {
    finalName = `${character.name} (Copia ${counter})`;
    counter++;
  }
  duplicatedCharacter.name = finalName;
  // Opcional: limpiar logs si no quieres copiar el historial
  // duplicatedCharacter.logs = [];
  // Agregar el personaje clonado directamente al array y guardar
  dmStore.characters.push(duplicatedCharacter);
  dmStore.saveToLocalStorage();
  // Agregar log de clonación
  dmStore.addLogToCharacter(duplicatedCharacter.id, 'Clonación', `Personaje clonado de ${character.name}`);
};

const applyDamage = (character) => {
  if (character.damageInput && character.damageInput > 0) {
    const oldHp = character.currentHp;
    const isNecroDamage = character.necroDamage || false;
    const result = dmStore.damageCharacter(character.id, character.damageInput, isNecroDamage);
    character.damageInput = "";

    // Check if character died from this damage
    if (oldHp > 0 && result && result.remainingHp <= 0) {
      defeatedCharacter.value = character;
      showDeathModal.value = true;
    }
  }
};

const applyResistantDamage = (character) => {
  if (character.resistantDamageInput && character.resistantDamageInput > 0) {
    const damage = Math.floor(character.resistantDamageInput / 2);
    const oldHp = character.currentHp;
    const isNecroDamage = character.necroResistantDamage || false;
    const result = dmStore.damageCharacter(character.id, damage, isNecroDamage);
    character.resistantDamageInput = "";

    // Check if character died from this damage
    if (oldHp > 0 && result && result.remainingHp <= 0) {
      defeatedCharacter.value = character;
      showDeathModal.value = true;
    }
  }
};

const toggleDiceRoller = () => {
  showDiceRoller.value = !showDiceRoller.value;
};

const saveHeroName = () => {
  if (heroName.value.trim() && defeatedCharacter.value) {
    const heroNameTrimmed = heroName.value.trim();

    // Check if hero name is the same as defeated character
    if (
      heroNameTrimmed.toLowerCase() ===
      defeatedCharacter.value.name.toLowerCase()
    ) {
      alert(
        "El nombre del héroe no puede ser el mismo que el personaje derrotado."
      );
      return;
    }

    // Registrar el héroe que derrotó al personaje
    dmStore.setDefeatedBy(defeatedCharacter.value.id, heroNameTrimmed);

    // Add log entry about who defeated the character
    dmStore.addLogToCharacter(
      defeatedCharacter.value.id,
      "Derrotado por",
      `Derrotado por ${heroNameTrimmed}`
    );

    // Close modal and reset
    closeDeathModal();
  } else {
    alert("Por favor, escribe el nombre del héroe que derrotó al personaje.");
  }
};

const closeDeathModal = () => {
  showDeathModal.value = false;
  defeatedCharacter.value = null;
  heroName.value = "";
};

const closeDeathModalIfEmpty = () => {
  if (heroName.value.trim()) {
    // If there's text in the input, ask for confirmation
    if (
      confirm(
        "¿Estás seguro de que quieres cerrar? Se perderá el nombre del héroe ingresado."
      )
    ) {
      closeDeathModal();
    }
  } else {
    // If input is empty, close directly
    closeDeathModal();
  }
};

// Watch for death modal to open and focus the input
watch(showDeathModal, (newValue) => {
  if (newValue) {
    // Focus the hero name input after the modal is rendered
    nextTick(() => {
      const heroNameInput = document.getElementById("heroName");
      if (heroNameInput) {
        heroNameInput.focus();
      }
    });
  }
});

// Add escape key listener for death modal
onMounted(() => {
  const handleEscape = (event) => {
    if (event.key === "Escape" && showDeathModal.value) {
      closeDeathModalIfEmpty();
    }
  };
  document.addEventListener("keydown", handleEscape);

  // Clean up on unmount
  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});

const applyHeal = (character) => {
  if (character.healInput && character.healInput > 0) {
    dmStore.healCharacter(character.id, character.healInput);
    character.healInput = "";
  }
};

const applyTempHp = (character) => {
  if (character.tempHpInput && character.tempHpInput > 0) {
    dmStore.addTempHpToCharacter(character.id, character.tempHpInput);
    character.tempHpInput = "";
  }
};

const restoreMaxHp = (characterId) => {
  const character = dmStore.getCharacterById(characterId);
  if (character && character.maxHp < character.originalMaxHp) {
    const oldMaxHp = character.maxHp;
    character.maxHp = character.originalMaxHp;
    
    // Agregar log de restauración
    dmStore.addLogToCharacter(characterId, 'Restaurar HP Máximo', `HP máximo restaurado de ${oldMaxHp} a ${character.originalMaxHp} (daño necro revertido)`);
    
    // Mostrar confirmación
    Swal.fire({
      icon: 'success',
      title: 'HP Máximo Restaurado',
      text: `El HP máximo de ${character.name} ha sido restaurado de ${oldMaxHp} a ${character.originalMaxHp}`,
      timer: 2000,
      showConfirmButton: false
    });
  }
};

const revivir = async (characterId) => {
  const character = dmStore.getCharacterById(characterId);
  if (!character) return;

  // Si el personaje tiene daño necro, restaurar el HP máximo primero
  let maxHpRestaurado = false;
  if (character.maxHp < character.originalMaxHp) {
    const oldMaxHp = character.maxHp;
    character.maxHp = character.originalMaxHp;
    maxHpRestaurado = true;
    dmStore.addLogToCharacter(characterId, 'Restaurar HP Máximo', `HP máximo restaurado de ${oldMaxHp} a ${character.originalMaxHp} (daño necro revertido)`);
  }

  // Modal de opciones de resurrección
  const { value: reviveOption } = await Swal.fire({
    title: `¿Cómo quieres revivir a ${character.name}?`,
    html: `
      <div style='text-align:left;'>
        <label><input type='radio' name='reviveOption' value='1' checked> Revivir con 1 HP</label><br>
        <label><input type='radio' name='reviveOption' value='half'> Revivir con la mitad de la vida máxima (${Math.floor(character.maxHp / 2)} HP)</label><br>
        <label><input type='radio' name='reviveOption' value='custom'> Revivir con cantidad personalizada:</label>
        <input id='customHpInput' type='number' min='1' max='${character.maxHp}' class='swal2-input' style='width:100%;margin:0;' placeholder='HP' disabled>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Revivir',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const selected = document.querySelector('input[name="reviveOption"]:checked').value;
      if (selected === 'custom') {
        const customValue = parseInt(document.getElementById('customHpInput').value);
        if (isNaN(customValue) || customValue < 1 || customValue > character.maxHp) {
          Swal.showValidationMessage(`Introduce un valor entre 1 y ${character.maxHp}`);
          return false;
        }
        return customValue;
      }
      if (selected === 'half') {
        return Math.floor(character.maxHp / 2);
      }
      return 1;
    },
    didOpen: () => {
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
    dmStore.reviveCharacter(characterId, reviveOption);
  }
};

const getHpBarColor = (character) => {
  const percentage = (character.currentHp / character.maxHp) * 100;
  if (percentage > 75) return "hp-high";
  if (percentage > 50) return "hp-medium";
  if (percentage > 25) return "hp-low";
  return "hp-critical";
};

const getStatusClass = (character) => {
  if (character.currentHp <= 0) return "status-dead";
  if (character.currentHp <= character.maxHp * 0.25) return "status-critical";
  if (character.currentHp <= character.maxHp * 0.5) return "status-wounded";
  return "status-healthy";
};

const getStatusText = (character) => {
  if (character.currentHp <= 0) return "Muerto";
  if (character.currentHp <= character.maxHp * 0.25) return "Crítico";
  if (character.currentHp <= character.maxHp * 0.5) return "Herido";
  return "Saludable";
};

const formatModifier = (value) => {
  const num = parseInt(value);
  if (isNaN(num)) return value;
  return num >= 0 ? `+${num}` : `${num}`;
};

const hasAnyAttribute = (character) => {
  return character.fuerza || character.destreza || character.constitucion || 
         character.inteligencia || character.sabiduria || character.carisma;
};

const exportData = () => {
  const data = dmStore.exportCharacters();
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dnd-characters-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const triggerFileImport = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        if (dmStore.importCharacters(content)) {
          alert("Personajes importados correctamente desde el archivo");
          showImportModal.value = false;
          // Limpiar el input de archivo
          event.target.value = "";
        } else {
          alert(
            "Error al importar los personajes. Verifica que el archivo contenga datos válidos."
          );
        }
      } catch (error) {
        alert(
          "Error al leer el archivo. Verifica que sea un archivo JSON válido."
        );
        console.error("Error importing file:", error);
      }
    };
    reader.onerror = () => {
      alert("Error al leer el archivo. Inténtalo de nuevo.");
    };
    reader.readAsText(file);
  }
};

const importCharacters = () => {
  if (importData.value.trim()) {
    if (dmStore.importCharacters(importData.value)) {
      alert("Personajes importados correctamente");
      importData.value = "";
      showImportModal.value = false;
    } else {
      alert("Error al importar los personajes. Verifica el formato JSON.");
    }
  }
};

const clearAllLogs = () => {
  Swal.fire({
    title: "¿Limpiar todos los logs?",
    text: "Esta acción eliminará todo el historial de logs de todos los personajes. Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, limpiar logs",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      dmStore.clearAllLogs();

      Swal.fire({
        icon: "success",
        title: "Logs Limpiados",
        text: "Todos los logs han sido eliminados correctamente",
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
};

const viewAllLogs = () => {
  // Crear un modal para mostrar todos los logs de todos los personajes
  const allLogs = [];

  dmStore.characters.forEach((character) => {
    character.logs.forEach((log) => {
      allLogs.push({
        ...log,
        characterName: character.name
      });
    });
  });

  // Ordenar logs por timestamp (más recientes primero)
  allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Crear contenido HTML para el modal
  let logsHTML = '<div style="max-height: 400px; overflow-y: auto;">';

  if (allLogs.length === 0) {
    logsHTML +=
      '<p style="text-align: center; color: #666;">No hay logs para mostrar</p>';
  } else {
    allLogs.forEach((log) => {
      logsHTML += `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px;">
          <div style="font-weight: bold; color: #f39c12;">${log.characterName}</div>
          <div style="color: #333;">${log.action}: ${log.details}</div>
          <div style="font-size: 0.8em; color: #666;">Turno ${log.turn} - ${log.timestamp}</div>
        </div>
      `;
    });
  }

  logsHTML += "</div>";

  // Mostrar modal con SweetAlert2
  Swal.fire({
    title: "Historial de Logs - Todos los Personajes",
    html: logsHTML,
    width: "800px",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#3085d6"
  });
};

// Inicializar inputs para cada personaje
const initializeCharacterInputs = () => {
  dmStore.characters.forEach((character) => {
    character.damageInput = "";
    character.healInput = "";
    character.tempHpInput = "";
    character.resistantDamageInput = "";
    character.necroDamage = false;
    character.necroResistantDamage = false;
  });
};

// Estado para controlar qué personajes tienen las acciones plegadas
const collapsedCharacters = ref(new Set());

// Función para alternar el estado de plegado de un personaje
const toggleCharacterActions = (characterId) => {
  const newCollapsed = new Set(collapsedCharacters.value);
  if (newCollapsed.has(characterId)) {
    newCollapsed.delete(characterId);
  } else {
    newCollapsed.add(characterId);
  }
  collapsedCharacters.value = newCollapsed;
};

// Función para alternar la visibilidad de la lista flotante
const toggleDraggableList = () => {
  showDraggableList.value = !showDraggableList.value;
};

// Función para verificar si las acciones de un personaje están plegadas
const isCharacterCollapsed = (characterId) => {
  return collapsedCharacters.value.has(characterId);
};

// Guardar el estado de los personajes plegados en localStorage
watch(collapsedCharacters, (newCollapsed) => {
  const collapsedArray = Array.from(newCollapsed);
  localStorage.setItem('collapsedCharacters', JSON.stringify(collapsedArray));
}, { deep: true });

// Todo List Methods
const addTodoItem = () => {
  if (newTodoItem.value.trim() === '') return;
  const todo = {
    id: Date.now(),
    text: newTodoItem.value.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todoItems.value.push(todo);
  newTodoItem.value = '';
  saveTodoItems();
};

const deleteTodoItem = (id) => {
  todoItems.value = todoItems.value.filter(item => item.id !== id);
  saveTodoItems();
};

const toggleTodoItem = (id) => {
  const item = todoItems.value.find(item => item.id === id);
  if (item) {
    saveTodoItems();
  }
};

const saveTodoItems = () => {
  localStorage.setItem('dnd-todo-items', JSON.stringify(todoItems.value));
};

const loadTodoItems = () => {
  const savedItems = localStorage.getItem('dnd-todo-items');
  if (savedItems) {
    try {
      todoItems.value = JSON.parse(savedItems);
    } catch (e) {
      console.error("Error loading todo items:", e);
      todoItems.value = [];
    }
  }
};

// Drag and drop methods for todo items
const dragTodoItem = (index) => {
  const item = todoItems.value.splice(index, 1)[0];
  todoItems.value.push(item);
  saveTodoItems();
};

// Lifecycle
onMounted(() => {
  // Cargar el estado de los personajes plegados desde localStorage
  const savedCollapsed = localStorage.getItem('collapsedCharacters');
  if (savedCollapsed) {
    try {
      const collapsedArray = JSON.parse(savedCollapsed);
      collapsedCharacters.value = new Set(collapsedArray);
    } catch (e) {
      console.error("Error loading collapsed characters state:", e);
      // Si hay un error, empezar con un set vacío
      collapsedCharacters.value = new Set();
    }
  }

  // Load todo items
  loadTodoItems();

  dmStore.loadFromLocalStorage();
  initializeCharacterInputs();
});
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


.attributes-display{
  color: #bdc3c7;
}

.attributes-list{
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
}

.fuerza{
  color: red
}

.destreza{
  color: #3498db;
}

.constitucion{
  color: #27ae60;
}

.inteligencia{
  color: #9b59b6;
}

.sabiduria{
  color: #f39c12;
}

.carisma{
  color: palevioletred;
}

/* Opcional: Si quieres que las notas tengan un fondo diferente para distinguirlas mejor */
.detail-item.notas {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.detail-item.notas .detail-label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #f39c12;
}

.detail-item.notas .detail-value {
  white-space: pre-wrap; /* Preserva saltos de línea y espacios */
  word-wrap: break-word; /* Rompe palabras largas si es necesario */
  font-family: inherit; /* Mantiene la fuente del resto del componente */
  font-weight: normal;
  line-height: 1.4; /* Mejora la legibilidad */
  margin-top: 5px; /* Pequeño espacio entre label y contenido */
}

/* Estilo para el textarea en los modales */
.form-control[rows] {
  resize: vertical; /* Permite redimensionar verticalmente */
  min-height: 80px; /* Altura mínima */
}

/* Asegurar que el textarea preserve los saltos de línea durante la edición */
textarea.form-control {
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.4;
}


#tiradas-salvacion{
  display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px
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
  position: relative;
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

.hp-fill.temp-hp {
  background: linear-gradient(90deg, #9b59b6, #8e44ad);
}

.necro-bar-indicator {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: #e74c3c;
  border-right: 1px solid #fff;
  box-shadow: 0 0 4px rgba(231, 76, 60, 0.8);
  z-index: 2;
}

.hp-text {
  text-align: center;
  color: #ecf0f1;
  font-weight: bold;
  font-size: 1.1rem;
}

.temp-hp {
  text-align: center;
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

.defeated-by {
  text-align: center;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.defeated-by-label {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-right: 8px;
  font-weight: 500;
}

.defeated-by-hero {
  color: #f39c12;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: capitalize;
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

.attributes-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Estilos para el checkbox de daño necro */
.necro-checkbox {
  margin-top: 8px;
}

.necro-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.necro-input {
  width: 16px;
  height: 16px;
  accent-color: #e74c3c;
  cursor: pointer;
}

.necro-text {
  color: #e74c3c;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.necro-info-icon {
  color: #7f8c8d;
  font-size: 0.8rem;
  cursor: help;
  transition: color 0.2s ease;
}

.necro-info-icon:hover {
  color: #f39c12;
}

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

.reset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.reset-buttons .btn {
  flex: 1;
  min-width: 120px;
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
  content: "";
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.import-divider span {
  padding: 0 15px;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Death Modal specific styles */
.death-modal .modal-header {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.death-modal .modal-header h3 {
  color: white;
}

.death-modal .modal-body p {
  color: #ecf0f1;
  margin-bottom: 15px;
  line-height: 1.5;
}

.death-modal .modal-body p strong {
  color: #f39c12;
  font-weight: 600;
}

.death-modal .form-group label {
  color: #ecf0f1;
  font-weight: 600;
  margin-bottom: 10px;
}

.death-modal .form-control {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(243, 156, 18, 0.3);
  transition: all 0.3s ease;
}

.death-modal .form-control:focus {
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
  background: rgba(0, 0, 0, 0.4);
}

.death-notification {
  text-align: center;
  margin-bottom: 25px;
}

.death-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.hp-status {
  font-size: 0.9rem;
  color: #bdc3c7;
  margin: 10px 0;
}

.hp-dead {
  color: #e74c3c;
  font-weight: bold;
  text-decoration: line-through;
}
/* Responsive */
@media (max-width: 768px) {  .dm-view {
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

.detail-item.notas .detail-value {
  white-space: pre-wrap; /* Preserva saltos de línea y espacios */
  word-wrap: break-word; /* Rompe palabras largas si es necesario */
  font-family: inherit; /* Mantiene la fuente del resto del componente */
  font-weight: normal;
  line-height: 1.4; /* Mejora la legibilidad */
  margin-top: 5px; /* Pequeño espacio entre label y contenido */
}

/* Opcional: Si quieres que las notas tengan un fondo diferente para distinguirlas mejor */
.detail-item.notas {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.detail-item.notas .detail-label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #f39c12;
}

/* Estilo para el textarea en los modales */
.form-control[rows] {
  resize: vertical; /* Permite redimensionar verticalmente */
  min-height: 80px; /* Altura mínima */
}

/* Asegurar que el textarea preserve los saltos de línea durante la edición */
textarea.form-control {
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.4;
}

/* Estilos para el botón de plegar acciones */
.actions-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.toggle-actions-btn {
  background: rgba(243, 156, 18, 0.2);
  border: 1px solid rgba(243, 156, 18, 0.3);
  color: #f39c12;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-actions-btn:hover {
  background: rgba(243, 156, 18, 0.3);
  border-color: rgba(243, 156, 18, 0.5);
  color: #fff;
  transform: translateY(-1px);
}

.toggle-actions-btn:active {
  transform: translateY(0);
}

.toggle-actions-btn i {
  transition: transform 0.3s ease;
}

.toggle-actions-btn.collapsed i {
  transform: rotate(180deg);
}

/* Animación para mostrar/ocultar el panel de acciones */
.character-actions-panel {
  transition: all 0.3s ease;
  overflow: hidden;
}

.character-actions-panel.collapsed {
  max-height: 0;
  padding: 0;
  margin: 0;
  opacity: 0;
}

/* Modal Overlay */
#todo-list {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

/* Modal Content */
#todo-list .modal-content {
  background: linear-gradient(145deg, #2d2d3d, #1e1e2e);
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

/* Modal Header */
#todo-list .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #4a4a5e, #3a3a4e);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

#todo-list .modal-header h3 {
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

#todo-list .btn-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

#todo-list .btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Modal Body */
#todo-list .modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* Scrollbar personalizado */
#todo-list .modal-body::-webkit-scrollbar {
  width: 6px;
}

#todo-list .modal-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

#todo-list .modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

#todo-list .modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Add Todo Section */
#todo-list .add-todo {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

#todo-list .form-control {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

#todo-list .form-control:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
}

#todo-list .form-control::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

#todo-list .btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

#todo-list .btn-primary {
  background: linear-gradient(135deg, #4a9eff, #357abd);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
}

#todo-list .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
}

#todo-list .btn-primary:active {
  transform: translateY(0);
}

/* Todo List */
#todo-list .todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#todo-list .todo-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

#todo-list .todo-list li:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

/* Custom Checkbox */
#todo-list .todo-list input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

#todo-list .todo-list input[type="checkbox"]:checked {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-color: #22c55e;
}

#todo-list .todo-list input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Todo Text */
#todo-list .todo-list span {
  flex: 1;
  color: #ffffff;
  font-size: 0.95rem;
  line-height: 1.4;
  transition: all 0.2s ease;
}

#todo-list .todo-list span.completed {
  text-decoration: line-through !important;
  color: rgba(255, 255, 255, 0.5);
}

/* Delete Button */
#todo-list .btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 6px 12px;
  font-size: 0.8rem;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

#todo-list .btn-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
}

#todo-list .btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Empty State */
#todo-list .todo-list:empty::after {
  content: 'No hay tareas aún. ¡Agrega tu primera tarea!';
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}


/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .add-todo {
    flex-direction: column;
    gap: 8px;
  }
  
  .todo-list li {
    padding: 10px 12px;
  }
  
  .modal-header h3 {
    font-size: 1.2rem;
  }
}
</style>
