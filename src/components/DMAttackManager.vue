<template>
  <div class="attack-manager-overlay" @click.self="$emit('close')">
    <div class="attack-manager-container">
      <div class="header">
        <h2><i class="bi bi-shield-fill"></i> Gestor de Ataques del DM</h2>
        <div class="header-actions">
          <button @click="showSettingsForm" class="settings-btn"><i class="bi bi-gear-fill"></i></button>
          <button @click="$emit('close')" class="close-btn">✕</button>
        </div>
      </div>

      <div class="content">
        <!-- Lista de ataques -->
        <div class="attacks-list">
          <div v-if="attacks.length === 0" class="no-attacks">
            No hay ataques guardados para el DM. ¡Crea uno nuevo!
          </div>
          <div v-for="attack in attacks" :key="attack.id" class="attack-item" :data-id="attack.id">
            <div class="header-attack">
              <div class="drag-handle"><i class="bi bi-grip-vertical"></i></div>
              <div class="attack-info">
                <span class="attack-name">{{ attack.name }}</span>
                <div class="attack-summary">
                  <span v-for="(roll, index) in attack.damageRolls" :key="index" class="damage-tag">
                    {{ roll.dice }} {{ roll.type }}
                  </span>
                </div>
              </div>
            </div>

            <div class="attack-actions">
              <button @click="executeAndShowAttack(attack, false)" class="action-btn btn-execute">Atacar</button>
              <button @click="executeAndShowAttack(attack, true)" class="action-btn btn-critical">Crítico</button>
              <button @click="editAttack(attack)" class="action-btn btn-edit">Editar</button>
              <button @click="duplicateAttack(attack)" class="action-btn btn-duplicate">Duplicar</button>
              <button @click="confirmDelete(attack.id)" class="action-btn btn-delete">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Botón para crear nuevo ataque -->
        <div class="new-attack-area">
          <button @click="showAttackForm()" class="btn-new-attack">
            <i class="bi bi-plus-circle-fill"></i> Crear Nuevo Ataque
          </button>
        </div>

        <!-- Formulario de ataque (modal) -->
        <div v-if="isFormVisible" class="attack-form-overlay" @click.self="hideAttackForm">
          <div class="attack-form">
            <div class="attack-form-header">
              <h3>{{ isEditing ? 'Editar Ataque' : 'Nuevo Ataque' }}</h3>
              <button @click="hideAttackForm" class="form-close-btn" aria-label="Cerrar formulario">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="attack-form-content">
              <!-- Nombre del ataque -->
              <div class="form-group">
                <label for="attack-name">Nombre del Ataque</label>
                <input
                  id="attack-name"
                  type="text"
                  v-model="currentAttack.name"
                  placeholder="Ej: Espadazo flamígero"
                  autocomplete="off"
                >
              </div>

              <!-- Campo de Descripción -->
              <div class="form-group">
                <label for="attack-description">Descripción</label>
                <textarea
                  id="attack-description"
                  v-model="currentAttack.description"
                  placeholder="Ej: Un ataque rápido que puede dejar al enemigo sangrando."
                  rows="3"
                ></textarea>
              </div>

              <!-- Checkbox para Ataque Preparable -->
              <div class="form-group-checkbox">
                <input
                  id="attack-preparable"
                  type="checkbox"
                  v-model="currentAttack.isPreparable"
                >
                <label for="attack-preparable">Ataque Preparable</label>
                <i class="bi bi-info-circle-fill" title="Si se marca, este ataque deberá ser 'preparado' desde la lista de ataques antes de poder ser lanzado."></i>
              </div>

              <!-- Tiradas de daño -->
              <div class="damage-rolls-section">
                <h4><i class="bi bi-dice-6-fill"></i> Tiradas de Daño</h4>
                <div v-for="(roll, index) in currentAttack.damageRolls" :key="index" class="damage-roll-item">
                  <div class="damage-roll-header">
                    <span class="damage-roll-title">Daño #{{ index + 1 }}</span>
                    <button
                      @click="removeDamageRoll(index)"
                      class="btn-remove-roll"
                      aria-label="Eliminar tirada de daño"
                      :disabled="currentAttack.damageRolls.length === 1"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                  <div class="damage-roll-inputs">
                    <div class="form-group-inline">
                      <label :for="`dice-num-${index}`">Cantidad</label>
                      <input
                        :id="`dice-num-${index}`"
                        type="number"
                        v-model.number="roll.numDice"
                        min="1"
                        max="20"
                        class="input-narrow"
                      >
                    </div>
                    <div class="form-group-inline">
                      <label :for="`dice-type-${index}`">Tipo de Dado</label>
                      <select :id="`dice-type-${index}`" v-model.number="roll.diceType">
                        <option value="4">d4</option>
                        <option value="6">d6</option>
                        <option value="8">d8</option>
                        <option value="10">d10</option>
                        <option value="12">d12</option>
                        <option value="20">d20</option>
                        <option value="100">d100</option>
                      </select>
                    </div>
                    <div class="form-group-inline">
                      <label :for="`type-${index}`">Tipo de Daño</label>
                      <select :id="`type-${index}`" v-model="roll.type">
                        <option v-for="dType in damageTypes" :key="dType.id" :value="dType.id">
                          {{ dType.name }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group-inline">
                      <label :for="`bonus-${index}`">Bonus</label>
                      <input
                        :id="`bonus-${index}`"
                        type="number"
                        v-model.number="roll.bonus"
                        placeholder="+3"
                      >
                    </div>
                    <div class="form-group-inline">
                      <label :for="`min-${index}`">Mínimo</label>
                      <input
                        :id="`min-${index}`"
                        type="number"
                        v-model.number="roll.min"
                        placeholder="1"
                        min="1"
                      >
                    </div>
                    <div class="form-group-inline">
                      <label :for="`lifesteal-${index}`">Robo de Vida (%)</label>
                      <input
                        :id="`lifesteal-${index}`"
                        type="number"
                        v-model.number="roll.lifeSteal.percentage"
                        placeholder="0"
                        min="0"
                        max="100"
                      >
                    </div>
                  </div>
                </div>
                <button @click="addDamageRoll" class="btn-add-roll">
                  <i class="bi bi-plus-circle"></i> Añadir Tipo de Daño
                </button>
              </div>

              <!-- Dados de Reroll -->
              <div class="damage-rolls-section">
                <h4><i class="bi bi-arrow-repeat"></i> Dados de Reroll (Opcional)</h4>
                <div v-if="currentAttack.rerollDice.length === 0" class="empty-state">
                  <p>No hay dados de reroll configurados</p>
                </div>
                <div v-for="(reroll, index) in currentAttack.rerollDice" :key="index" class="damage-roll-item">
                  <div class="damage-roll-header">
                    <span class="damage-roll-title">Reroll #{{ index + 1 }}</span>
                    <button
                      @click="removeRerollDice(index)"
                      class="btn-remove-roll"
                      aria-label="Eliminar dado de reroll"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                  <div class="damage-roll-inputs reroll-inputs">
                    <div class="form-group-inline">
                      <label :for="`reroll-dice-num-${index}`">Cantidad</label>
                      <input
                        :id="`reroll-dice-num-${index}`"
                        type="number"
                        v-model.number="reroll.numDice"
                        min="1"
                        max="20"
                        class="input-narrow"
                      >
                    </div>
                    <div class="form-group-inline">
                      <label :for="`reroll-dice-type-${index}`">Tipo de Dado</label>
                      <select :id="`reroll-dice-type-${index}`" v-model.number="reroll.diceType">
                        <option value="4">d4</option>
                        <option value="6">d6</option>
                        <option value="8">d8</option>
                        <option value="10">d10</option>
                        <option value="12">d12</option>
                        <option value="20">d20</option>
                        <option value="100">d100</option>
                      </select>
                    </div>
                    <div class="form-group-inline">
                      <label :for="`reroll-min-${index}`">Mínimo</label>
                      <input
                        :id="`reroll-min-${index}`"
                        type="number"
                        v-model.number="reroll.min"
                        placeholder="1"
                        min="1"
                      >
                    </div>
                  </div>
                </div>
                <button @click="addRerollDice" class="btn-add-roll">
                  <i class="bi bi-plus-circle"></i> Añadir Dado de Reroll
                </button>
              </div>

              <!-- Acciones del formulario -->
              <div class="form-actions">
                <button @click="saveAttack" class="btn-save">
                  <i class="bi bi-check-circle-fill"></i>
                  {{ isEditing ? 'Guardar Cambios' : 'Crear Ataque' }}
                </button>
                <button @click="hideAttackForm" class="btn-cancel">
                  <i class="bi bi-x-circle-fill"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario de configuración de críticos -->
        <div v-if="isSettingsVisible" class="attack-form-overlay" @click.self="hideSettingsForm">
          <div class="attack-form settings-form">
            <div class="attack-form-header">
              <h3><i class="bi bi-gear-fill"></i> Configuración de Daño Crítico</h3>
              <button @click="hideSettingsForm" class="form-close-btn" aria-label="Cerrar configuración">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="attack-form-content">
              <div class="form-group">
                <label for="critical-rule">Regla de Daño Crítico</label>
                <select id="critical-rule" v-model="criticalHitConfig.rule" class="settings-select">
                  <option value="default">Regla por Defecto (Duplicar Dados)</option>
                  <option value="dad">Daño Masivo (DAD)</option>
                </select>
              </div>

              <div v-if="criticalHitConfig.rule === 'dad'" class="form-group">
                <label for="character-level">Nivel del Personaje</label>
                <input
                  type="number"
                  id="character-level"
                  v-model.number="criticalHitConfig.characterLevel"
                  min="1"
                  max="20"
                  class="settings-input"
                >
                <div v-if="dadBonusDamage > 0" class="dad-bonus-display">
                  <i class="bi bi-lightning-charge-fill"></i>
                  <p>Bonus de daño por crítico: <strong>+{{ dadBonusDamage }}</strong></p>
                </div>
              </div>

              <div class="form-actions">
                <button @click="saveSettings" class="btn-save">
                  <i class="bi bi-check-circle-fill"></i>
                  Guardar
                </button>
                <button @click="hideSettingsForm" class="btn-cancel">
                  <i class="bi bi-x-circle-fill"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, nextTick, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Sortable from 'sortablejs';
import { useDMStore } from '../stores/useDMStore';
import { damageTypes } from '../utils/damageTypes';
import { showAttackResult } from '../utils/attackExecutor';
import Swal from 'sweetalert2';

const props = defineProps({
  characterId: {
    type: [String, Number],
    required: true,
  },
});

const emit = defineEmits(['close']);

const dmStore = useDMStore();
const character = computed(() => dmStore.getCharacterById(props.characterId));
const attacks = computed(() => character.value ? character.value.attacks : []);

const isFormVisible = ref(false);
const isEditing = ref(false);
const isSettingsVisible = ref(false);

const criticalHitConfig = reactive({
  rule: 'default',
  characterLevel: 1,
});

const dadBonusDamage = computed(() => {
  if (criticalHitConfig.rule !== 'dad') {
    return 0;
  }
  return calculateDadBonus(criticalHitConfig.characterLevel);
});

// Estructura del ataque reactiva
const currentAttack = reactive({
  id: null,
  name: '',
  description: '',
  isPreparable: false,
  damageRolls: [],
  rerollDice: [],
});

onMounted(() => {
  // Deshabilitar scroll en el body
  document.body.style.overflow = 'hidden';

  nextTick(() => {
    const listEl = document.querySelector('.attacks-list');
    if (listEl) {
      new Sortable(listEl, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
          const newOrder = Array.from(evt.target.children)
                                .map(el => el.dataset.id)
                                .filter(id => id); // Filtrar elementos sin data-id
          dmStore.updateCharacterAttackOrder(props.characterId, newOrder);
        }
      });
    }

    // Redirigir el scroll del overlay al contenido del modal principal
    const overlay = document.querySelector('.attack-manager-overlay');
    const content = document.querySelector('.content');

    if (overlay && content) {
      const handleWheel = (e) => {
        // Solo interceptar si el evento viene directamente del overlay o de la lista de ataques
        // No interferir con los modals de formulario
        const target = e.target;
        const isFormOverlay = target.closest('.attack-form-overlay');

        if (!isFormOverlay) {
          // Prevenir el scroll por defecto solo en el overlay principal
          e.preventDefault();
          // Aplicar el scroll al contenido del modal principal
          content.scrollTop += e.deltaY;
        }
      };

      overlay.addEventListener('wheel', handleWheel, { passive: false });

      // Guardar el listener para poder removerlo después
      overlay._wheelHandler = handleWheel;
    }
  });
});

onUnmounted(() => {
  // Rehabilitar scroll en el body al cerrar el componente
  document.body.style.overflow = '';

  // Remover el listener del scroll
  const overlay = document.querySelector('.attack-manager-overlay');
  if (overlay && overlay._wheelHandler) {
    overlay.removeEventListener('wheel', overlay._wheelHandler);
  }
});

// --- Lógica del formulario ---

const parseDiceString = (diceString) => {
  if (!diceString || !diceString.includes('d')) return { numDice: 1, diceType: 6 };
  const [num, type] = diceString.split('d');
  return { numDice: Number(num) || 1, diceType: Number(type) || 6 };
};

const setupForm = (attack) => {
  const attackCopy = JSON.parse(JSON.stringify(attack));

  attackCopy.damageRolls.forEach(roll => {
    const { numDice, diceType } = parseDiceString(roll.dice);
    roll.numDice = numDice;
    roll.diceType = diceType;
    if (!roll.lifeSteal) {
      roll.lifeSteal = { percentage: 0 };
    }
  });

  if (attackCopy.rerollDice) {
    attackCopy.rerollDice.forEach(reroll => {
      const { numDice, diceType } = parseDiceString(reroll.dice);
      reroll.numDice = numDice;
      reroll.diceType = diceType;
    });
  } else {
    attackCopy.rerollDice = [];
  }

  // Rellenar el formulario de forma reactiva para evitar problemas
  currentAttack.id = attackCopy.id;
  currentAttack.name = attackCopy.name;
  currentAttack.description = attackCopy.description || '';
  currentAttack.isPreparable = attackCopy.isPreparable || false;

  // Limpiar y rellenar los arrays para mantener la reactividad
  currentAttack.damageRolls.splice(0, currentAttack.damageRolls.length, ...attackCopy.damageRolls);
  currentAttack.rerollDice.splice(0, currentAttack.rerollDice.length, ...attackCopy.rerollDice);

  isFormVisible.value = true;
};

const showAttackForm = () => {
  isEditing.value = false;
  const newAttackBase = {
    id: null,
    name: '',
    description: '',
    isPreparable: false,
    isPrepared: false,
    damageRolls: [
      {
        dice: '1d6',
        type: 'slashing',
        bonus: 0,
        min: 1,
        lifeSteal: { percentage: 0 }
      }
    ],
    rerollDice: [],
  };
  setupForm(newAttackBase);
};

const editAttack = (attack) => {
  isEditing.value = true;
  setupForm(attack);
};

const duplicateAttack = (attack) => {
  dmStore.duplicateAttackInCharacter(props.characterId, attack.id);
};

const hideAttackForm = () => {
  isFormVisible.value = false;
};

const addDamageRoll = () => {
  currentAttack.damageRolls.push({
    dice: '1d6',
    type: 'slashing',
    bonus: 0,
    min: 1,
    numDice: 1,
    diceType: 6,
    lifeSteal: { percentage: 0 },
  });
};

const removeDamageRoll = (index) => {
  currentAttack.damageRolls.splice(index, 1);
};

const addRerollDice = () => {
  if (!currentAttack.rerollDice) {
    currentAttack.rerollDice = [];
  }
  currentAttack.rerollDice.push({
    dice: '1d6',
    numDice: 1,
    diceType: 6,
    min: 1,
  });
};

const removeRerollDice = (index) => {
  currentAttack.rerollDice.splice(index, 1);
};

const saveAttack = () => {
  if (!currentAttack.name) {
    Swal.fire('Error', 'El nombre del ataque no puede estar vacío.', 'error');
    return;
  }

  const attackToSave = JSON.parse(JSON.stringify(currentAttack));

  attackToSave.damageRolls.forEach(roll => {
    roll.dice = `${roll.numDice || 1}d${roll.diceType || 6}`;
    delete roll.numDice;
    delete roll.diceType;
  });

  if (attackToSave.rerollDice) {
    attackToSave.rerollDice.forEach(reroll => {
      reroll.dice = `${reroll.numDice || 1}d${reroll.diceType || 6}`;
      delete reroll.numDice;
      delete reroll.diceType;
    });
  }

  if (isEditing.value) {
    dmStore.updateAttackInCharacter(props.characterId, attackToSave);
  } else {
    dmStore.addAttackToCharacter(props.characterId, attackToSave);
  }
  hideAttackForm();
};

const confirmDelete = (attackId) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esta acción.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, ¡elimínalo!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      dmStore.deleteAttackFromCharacter(props.characterId, attackId);
      Swal.fire('Eliminado', 'El ataque ha sido eliminado.', 'success');
    }
  });
};

const executeAndShowAttack = (attack, isCritical = false) => {
  showAttackResult(attack, isCritical, dmStore.criticalHit);
};
</script>

<style scoped>
/* Estilos para el overlay y el contenedor principal */
.attack-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.attack-manager-container {
  background: #2c2f33;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
}

.header {
  padding: 15px 25px;
  background: #23272a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #99aab5;
  border-radius: 12px 12px 0 0;
}

.header h2 {
  color: #ffffff;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.8rem;
  cursor: pointer;
}

.content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

/* Lista de ataques */
.attacks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-attacks {
  text-align: center;
  color: #99aab5;
  padding: 30px;
  font-style: italic;
}

.attack-item {
  background: #23272a;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center; /* Alinear verticalmente */
  gap: 15px; /* Espacio entre el handle y el contenido */
  border-left: 5px solid #7289da;
}

.drag-handle {
  color: #99aab5;
  cursor: grab;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.sortable-ghost {
  opacity: 0.4;
  background: #7289da;
}

.attack-info {
  flex-grow: 1; /* El contenido principal ocupa el espacio restante */
  min-width: 0; /* Permite que el contenido se ajuste correctamente */
}

.attack-name {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.attack-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap; /* Permite que los tags se envuelvan si son muchos */
}

.damage-tag {
  background: #7289da;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.header-attack {
  display: flex;
  align-items: center;
  gap: 15px;
}

.attack-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.secondary-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  text-align: center;
}

.btn-execute { background-color: #43b581; }
.btn-critical { background-color: #e67e22; }
.btn-edit { background-color: #faa61a; }
.btn-duplicate { background-color: #5865f2; }
.btn-delete { background-color: #f04747; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.settings-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
}

.settings-select, .settings-input {
  width: 100%;
  padding: 10px;
  background: #23272a;
  border: 1px solid #99aab5;
  border-radius: 5px;
  color: #ffffff;
}

.dad-bonus-display {
  margin-top: 10px;
  padding: 12px 15px;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(243, 156, 18, 0.05));
  border-left: 3px solid #f39c12;
  border-radius: 5px;
  color: #f39c12;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
}

.dad-bonus-display i {
  font-size: 1.2rem;
}

/* Área de nuevo ataque */
.new-attack-area {
  margin-top: 25px;
  text-align: center;
}

.btn-new-attack {
  background-color: #7289da;
  color: #ffffff;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-new-attack:hover {
  background-color: #5b6eae;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 137, 218, 0.3);
}

/* Formulario de ataque */
.attack-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  overflow-y: auto;
  padding: 20px;
  z-index: 1100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  backdrop-filter: blur(3px);
}

.attack-form {
  background: linear-gradient(135deg, #2c2f33 0%, #23272a 100%);
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  margin: 20px auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  max-height: none;
  display: flex;
  flex-direction: column;
  border: 1px solid #3a3f44;
}

.attack-form-header {
  background: #1a1d21;
  padding: 20px 25px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #7289da;
}

.attack-form-header h3 {
  color: #ffffff;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.form-close-btn:hover {
  background: rgba(255, 77, 77, 0.8);
  transform: scale(1.05);
}

.attack-form-content {
  padding: 25px;
  overflow-y: visible;
  max-height: none;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  color: #b9bbbe;
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  background: #1a1d21;
  border: 1px solid #3a3f44;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
}

.form-group-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #7289da;
  cursor: pointer;
}

.form-group-checkbox label {
  color: #b9bbbe;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0;
}

.form-group-checkbox .bi-info-circle-fill {
  color: #7289da;
  cursor: help;
}


.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #7289da;
  box-shadow: 0 0 0 3px rgba(114, 137, 218, 0.1);
}

.damage-rolls-section {
  margin-top: 25px;
}

.damage-rolls-section h4 {
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 2px solid #3a3f44;
}

.empty-state {
  text-align: center;
  padding: 30px 20px;
  color: #72767d;
  font-style: italic;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 15px;
}

.damage-roll-item {
  background: linear-gradient(135deg, rgba(26, 29, 33, 0.8), rgba(26, 29, 33, 0.6));
  padding: 18px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #3a3f44;
  transition: all 0.2s ease;
}

.damage-roll-item:hover {
  border-color: #7289da;
  box-shadow: 0 2px 8px rgba(114, 137, 218, 0.1);
}

.damage-roll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3a3f44;
}

.damage-roll-title {
  color: #7289da;
  font-weight: 600;
  font-size: 1rem;
}

.damage-roll-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  width: 100%;
}

.reroll-inputs {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.form-group-inline {
  display: flex;
  flex-direction: column;
}

.form-group-inline label {
  color: #b9bbbe;
  font-size: 0.85rem;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group-inline input,
.form-group-inline select {
  padding: 10px;
  background: #0f1214;
  border: 1px solid #3a3f44;
  border-radius: 5px;
  color: #ffffff;
  width: 100%;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-group-inline input:focus,
.form-group-inline select:focus {
  outline: none;
  border-color: #7289da;
  box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.15);
}

.input-narrow {
  width: 100%;
}

.btn-remove-roll {
  background: linear-gradient(135deg, #f04747, #d63939);
  color: white;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-remove-roll:hover:not(:disabled) {
  background: linear-gradient(135deg, #d63939, #c02b2b);
  transform: scale(1.05);
}

.btn-remove-roll:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-add-roll {
  background: linear-gradient(135deg, #43b581, #3a9d6f);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.btn-add-roll:hover {
  background: linear-gradient(135deg, #3a9d6f, #2d7a57);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 181, 129, 0.3);
}

.form-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #3a3f44;
  display: flex;
  gap: 12px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-save {
  background: linear-gradient(135deg, #43b581, #3a9d6f);
  color: white;
}

.btn-save:hover {
  background: linear-gradient(135deg, #3a9d6f, #2d7a57);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 181, 129, 0.4);
}

.btn-cancel {
  background: linear-gradient(135deg, #72767d, #5c6169);
  color: white;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #5c6169, #4a4e54);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 118, 125, 0.4);
}

/* Estilos para el modal de resultados de SweetAlert */
.attack-result-swal .attack-result-modal {
  color: #ffffff;
  text-align: left;
}

.attack-result-modal h3 {
  color: #7289da;
  text-align: center;
  margin-bottom: 15px;
}

.damage-type-block {
  background: #23272a;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  border-left: 5px solid transparent; /* Placeholder for color */
  transition: border-color 0.3s;
}

.damage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.damage-type {
  font-weight: bold;
  color: #faa61a;
}

.damage-total {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f04747;
}

.damage-details, .lifesteal-details {
  color: #99aab5;
  display: flex;
  justify-content: space-between;
}

.lifesteal-details {
  margin-top: 8px;
  color: #43b581;
  font-weight: bold;
}
.lifesteal-details i {
  margin-right: 5px;
}

.grand-total, .total-healed {
  margin-top: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.grand-total { color: #f04747; }
.total-healed { color: #43b581; }

/* Media Queries for Responsiveness */
@media (max-width: 768px) {
  .attack-manager-container {
    width: 95%;
    height: 85vh;
  }

  .attack-form-overlay {
    padding: 10px;
  }

  .attack-form {
    max-width: 100%;
    max-height: none;
    margin: 0 auto;
  }

  .attack-form-header {
    padding: 15px 20px;
  }

  .attack-form-header h3 {
    font-size: 1.3rem;
  }

  .attack-form-content {
    padding: 20px;
    max-height: none;
  }

  .damage-roll-inputs {
    grid-template-columns: repeat(2, 1fr);
  }

  .reroll-inputs {
    grid-template-columns: 1fr 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }

  .drag-handle {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px;
    border-radius: 5px;
  }

  .attack-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }

  .attack-name {
    font-size: 1.1rem;
  }

  .attack-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    gap: 10px;
  }

  .secondary-actions {
    flex-direction: row;
    gap: 8px;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    text-align: center;
    padding: 10px 12px;
    font-size: 0.95rem;
  }

  .btn-execute {
    order: -1; /* El botón Atacar siempre primero */
  }

  .secondary-actions .action-btn {
    flex: 1; /* Los botones secundarios ocupan espacio igual */
  }

  .btn-new-attack {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .attack-manager-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .attack-form-overlay {
    padding: 0;
    align-items: flex-start;
  }

  .attack-form {
    border-radius: 0;
    max-height: none;
    margin: 0;
    min-height: 100vh;
  }

  .attack-form-header {
    padding: 12px 15px;
    border-radius: 0;
  }

  .attack-form-header h3 {
    font-size: 1.1rem;
  }

  .form-close-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .attack-form-content {
    padding: 15px;
    max-height: none;
  }

  .damage-roll-inputs,
  .reroll-inputs {
    grid-template-columns: 1fr;
  }

  .damage-roll-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .btn-remove-roll {
    width: 100%;
    height: 40px;
  }

  .form-group-inline label {
    font-size: 0.8rem;
  }

  .btn-add-roll {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .header {
    padding: 12px 15px;
  }

  .header h2 {
    font-size: 1.1rem;
  }

  .close-btn, .settings-btn {
    font-size: 1.4rem;
  }

  .content {
    padding: 12px;
  }

  .attack-item {
    padding: 10px;
  }

  .attack-name {
    font-size: 1rem;
    text-align: left;
  }

  .damage-tag {
    font-size: 0.75rem;
    padding: 2px 6px;
  }

  .attack-summary {
    justify-content: flex-start;
  }

  .secondary-actions {
    flex-direction: column;
    gap: 8px;
  }

  .secondary-actions .action-btn {
    width: 100%;
  }

  .action-btn {
    padding: 10px;
    font-size: 0.9rem;
  }

  .btn-new-attack {
    font-size: 1rem;
    padding: 10px 20px;
  }
}
</style>
