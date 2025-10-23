<template>
  <div class="attack-manager-overlay" @click.self="$emit('close')">
    <div class="attack-manager-container">
      <div class="header">
        <h2><i class="bi bi-hammer"></i> Gestor de Ataques</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="content">
        <!-- Lista de ataques -->
        <div class="attacks-list">
          <div v-if="attackStore.attacks.length === 0" class="no-attacks">
            No hay ataques guardados. ¡Crea uno nuevo!
          </div>
          <div v-for="attack in attackStore.attacks" :key="attack.id" class="attack-item" :data-id="attack.id">
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
              <button @click="executeAndShowAttack(attack)" class="action-btn btn-execute">Atacar</button>
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
            <h3>{{ isEditing ? 'Editar Ataque' : 'Nuevo Ataque' }}</h3>

            <!-- Nombre del ataque -->
            <div class="form-group">
              <label>Nombre del Ataque</label>
              <input type="text" v-model="currentAttack.name" placeholder="Ej: Espadazo flamígero">
            </div>

            <!-- Tiradas de daño -->
            <div class="damage-rolls-section">
              <h4>Tiradas de Daño</h4>
              <div v-for="(roll, index) in currentAttack.damageRolls" :key="index" class="damage-roll-item">
                <div class="damage-roll-inputs">
                  <div class="form-group-inline">
                    <label :for="`dice-num-${index}`">Cantidad</label>
                    <input :id="`dice-num-${index}`" type="number" v-model.number="roll.numDice" min="1" class="input-narrow">
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
                    <label :for="`type-${index}`">Tipo</label>
                    <select :id="`type-${index}`" v-model="roll.type">
                      <option v-for="dType in damageTypes" :key="dType.id" :value="dType.id">
                        {{ dType.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group-inline">
                    <label :for="`bonus-${index}`">Bonus</label>
                    <input :id="`bonus-${index}`" type="number" v-model.number="roll.bonus" placeholder="+3">
                  </div>
                  <div class="form-group-inline">
                    <label :for="`min-${index}`">Mínimo</label>
                    <input :id="`min-${index}`" type="number" v-model.number="roll.min" placeholder="1">
                  </div>
                  <div class="form-group-inline">
                    <label :for="`lifesteal-${index}`">Robo Vida (%)</label>
                    <input :id="`lifesteal-${index}`" type="number" v-model.number="roll.lifeSteal.percentage" placeholder="0">
                  </div>
                </div>
                <button @click="removeDamageRoll(index)" class="btn-remove-roll">✕</button>
              </div>
              <button @click="addDamageRoll" class="btn-add-roll">
                <i class="bi bi-plus"></i> Añadir tipo de daño
              </button>
            </div>

            <!-- Dados de Reroll -->
            <div class="damage-rolls-section">
              <h4>Dados de Reroll (Opcional)</h4>
              <div v-for="(reroll, index) in currentAttack.rerollDice" :key="index" class="damage-roll-item">
                <div class="damage-roll-inputs">
                  <div class="form-group-inline">
                    <label :for="`reroll-dice-num-${index}`">Cantidad</label>
                    <input :id="`reroll-dice-num-${index}`" type="number" v-model.number="reroll.numDice" min="1" class="input-narrow">
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
                    <input :id="`reroll-min-${index}`" type="number" v-model.number="reroll.min" placeholder="1">
                  </div>
                </div>
                <button @click="removeRerollDice(index)" class="btn-remove-roll">✕</button>
              </div>
              <button @click="addRerollDice" class="btn-add-roll">
                <i class="bi bi-plus"></i> Añadir dado de reroll
              </button>
            </div>

            <!-- Acciones del formulario -->
            <div class="form-actions">
              <button @click="saveAttack" class="btn-save">{{ isEditing ? 'Guardar Cambios' : 'Crear Ataque' }}</button>
              <button @click="hideAttackForm" class="btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue';
import Sortable from 'sortablejs';
import { useAttackStore } from '../stores/useAttackStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { executeAttack, rollRerollDice, replaceDice } from '../utils/attackLogic';
import { damageTypes, getColorForType } from '../utils/damageTypes';
import Swal from 'sweetalert2';

const emit = defineEmits(['close']);

const attackStore = useAttackStore();
const characterStore = useCharacterStore();

const isFormVisible = ref(false);
const isEditing = ref(false);

// Estructura del ataque reactiva
const currentAttack = reactive({
  id: null,
  name: '',
  damageRolls: [],
  rerollDice: [],
});

onMounted(() => {
  // Deshabilitar scroll en el body
  document.body.style.overflow = 'hidden';
  
  attackStore.loadAttacks();
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
          attackStore.updateAttackOrder(newOrder);
        }
      });
    }

    // Redirigir el scroll del overlay al contenido del modal
    const overlay = document.querySelector('.attack-manager-overlay');
    const content = document.querySelector('.content');
    
    if (overlay && content) {
      const handleWheel = (e) => {
        // Prevenir el scroll por defecto
        e.preventDefault();
        // Aplicar el scroll al contenido del modal
        content.scrollTop += e.deltaY;
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
  attackStore.duplicateAttack(attack.id);
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
    attackStore.updateAttack(attackToSave);
  } else {
    attackStore.addAttack(attackToSave);
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
      attackStore.deleteAttack(attackId);
      Swal.fire('Eliminado', 'El ataque ha sido eliminado.', 'success');
    }
  });
};

const executeAndShowAttack = (attack) => {
  let attackResult = executeAttack(attack);

  const getRollsHTML = (rolls) => {
    return rolls.map(r =>
      `<span class="roll-value ${r.isReplaced ? 'replaced' : ''}">${r.value}</span>`
    ).join(', ');
  };

  const getRerollResultsHTML = (rerollResults) => {
    if (!rerollResults) return '';
    let html = `<div class="reroll-results-block-modern"><h4><i class="bi bi-dice-5"></i> Resultados del Reroll</h4>`;
    for (const type in rerollResults) {
      html += `<div class="reroll-type"><strong>${type}:</strong> [${rerollResults[type].join(', ')}]</div>`;
    }
    html += '</div>';
    return html;
  };

  const renderModalContent = (result, rerollResults = null) => {
    let htmlResult = `<div class="attack-result-modal">`;
    htmlResult += `<h3 class="dnd-title-modern">${result.name}</h3>`;

    for (const type in result.results) {
      const data = result.results[type];
      const typeColor = getColorForType(type);
      const typeInfo = damageTypes.find(t => t.id === type) || { name: type };
      const typeName = typeInfo.name.toUpperCase();

      htmlResult += `
        <div class="damage-type-block-modern" style="border-left-color: ${typeColor};">
          <div class="damage-header">
            <span class="damage-type-modern" style="color: ${typeColor};">${typeName}</span>
            <span class="damage-total-modern">${data.total}</span>
          </div>
          <div class="damage-details">
            <span><strong>Tiradas:</strong> [${getRollsHTML(data.rolls)}]</span>
            <span><strong>Bonus:</strong> ${data.bonus > 0 ? '+' : ''}${data.bonus}</span>
          </div>
      `;
      if (data.lifeSteal) {
        htmlResult += `
          <div class="lifesteal-details">
            <i class="bi bi-heart-fill"></i>
            <span><strong>Curado:</strong> ${data.lifeSteal.healed} (${data.lifeSteal.percentage_display})</span>
          </div>
        `;
      }
      htmlResult += `</div>`;
    }

    htmlResult += getRerollResultsHTML(rerollResults);

    htmlResult += `<div class="grand-total-modern">Daño Total: ${result.grandTotal}</div>`;
    if (result.totalHealed > 0) {
      htmlResult += `<div class="total-healed-modern">Curación Total: ${result.totalHealed}</div>`;
    }
    htmlResult += `</div>`;
    return htmlResult;
  };

  const styleId = 'dnd-modern-modal-styles';
  const originalStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Teko:wght@700&display=swap');
        .dnd-modern-swal-popup { background: #1e1e1e; border: 1px solid #444; border-radius: 10px; color: #f0f0f0; box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
        .dnd-modern-swal-container { padding: 0 !important; }
        .dnd-title-modern { font-family: 'Teko', sans-serif; font-size: 2.5rem; color: #f0f0f0; text-align: center; padding: 15px; background: #111; border-top-left-radius: 9px; border-top-right-radius: 9px; }
        .dnd-modern-swal-popup .attack-result-modal { padding: 20px; font-family: 'Roboto', sans-serif; }
        .damage-type-block-modern { background: #2a2a2a; border-left: 4px solid; margin-bottom: 15px; padding: 15px; border-radius: 4px; }
        .damage-type-modern { font-family: 'Teko', sans-serif; font-size: 1.5rem; }
        .damage-total-modern { font-family: 'Teko', sans-serif; font-size: 2.8rem; color: #ff4d4d; }
        .grand-total-modern, .total-healed-modern { font-family: 'Teko', sans-serif; font-size: 2rem; text-align: center; margin-top: 20px; padding: 10px; border-radius: 5px; }
        .grand-total-modern { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; }
        .total-healed-modern { background: rgba(77, 255, 126, 0.1); color: #4dff7e; }
        .dnd-modern-swal-popup .lifesteal-details { color: #4dff7e; }`;
  const newStyles = `
    .roll-value.replaced { color: #ffd700; font-weight: bold; text-shadow: 0 0 5px #ffd700; background-color: rgba(255, 215, 0, 0.1); padding: 2px 4px; border-radius: 3px; }
    .reroll-results-block-modern { background: #2a2a2a; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #444; }
    .reroll-results-block-modern h4 { color: #f39c12; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
    .reroll-type { margin-bottom: 5px; padding-left: 10px; }
    .swal2-actions { gap: 15px !important; }
    .dnd-reroll-button { background-color: #9b59b6 !important; color: white !important; }
    .dnd-replace-button { background-color: #f39c12 !important; color: white !important; }`;

  let rerollData = null;
  // Estado local para controlar si ya se ha aplicado el reemplazo
  let hasReplaced = false;

  Swal.fire({
    width: 600,
    html: renderModalContent(attackResult),
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    showDenyButton: attack.rerollDice && attack.rerollDice.length > 0,
    denyButtonText: 'Lanzar Reroll',
    showCancelButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'dnd-modern-swal-popup',
      htmlContainer: 'dnd-modern-swal-container',
      denyButton: 'dnd-reroll-button',
      cancelButton: 'dnd-replace-button',
    },
    didOpen: () => {
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = originalStyles + newStyles;
      document.head.appendChild(style);
    },
    didClose: () => {
      if (attackResult.totalHealed > 0) characterStore.heal(attackResult.totalHealed);
      characterStore.addLog(`Ataque: ${attack.name}`, `Daño total: ${attackResult.grandTotal}. Curación por robo de vida: ${attackResult.totalHealed}.`);
    },
    preDeny: () => {
      // Generar reroll pero no aplicar aún. Mostrar los resultados de reroll y ofrecer 'Reemplazar Dados'.
      rerollData = rollRerollDice(attack.rerollDice);
      hasReplaced = false;
      Swal.update({
        html: renderModalContent(attackResult, rerollData),
        showDenyButton: false,
        showCancelButton: false,
        footer: '<button id="swal-replace-btn" class="swal2-styled dnd-replace-button">Reemplazar Dados</button>',
      });

      // Añadir listener al botón normal de "Reemplazar Dados"
      // Usamos setTimeout para esperar a que SweetAlert haya renderizado el footer
      setTimeout(() => {
        const replaceBtn = document.getElementById('swal-replace-btn');
        if (!replaceBtn) return;
        replaceBtn.onclick = () => {
          if (!rerollData) {
            rerollData = rollRerollDice(attack.rerollDice);
          }
          // Aplicar reemplazo y actualizar modal (sin cerrarlo)
          attackResult = replaceDice(attackResult, rerollData);
          hasReplaced = true;
          Swal.update({
            html: renderModalContent(attackResult, rerollData),
            showConfirmButton: true,
            showDenyButton: false,
            showCancelButton: false,
            footer: '' // quitar el botón para evitar reaplicaciones
          });
        };
      }, 0);
      // Evitar que el modal se cierre por defecto
      return false;
    },
    preCancel: () => {
      // Reemplazar dados NUNCA debe cerrar el modal. Siempre aplicamos el reemplazo
      // (si no hay rerollData, lo generamos) y actualizamos el modal. Devolvemos false
      // para evitar el cierre del modal.
      if (!rerollData) {
        rerollData = rollRerollDice(attack.rerollDice);
      }

      // Aplicar reemplazo: sustituir los dados más bajos por los mejores reroll
      attackResult = replaceDice(attackResult, rerollData);
      hasReplaced = true;

      // Actualizar el modal mostrando los dados reemplazados; mantener el modal abierto.
      // Ocultamos el botón de reemplazo para evitar re-aplicaciones.
      Swal.update({
        html: renderModalContent(attackResult, rerollData),
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar'
      });

      // Evitar cierre del modal
      return false;
    }
  });
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
.btn-edit { background-color: #faa61a; }
.btn-duplicate { background-color: #5865f2; }
.btn-delete { background-color: #f04747; }

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
}

/* Formulario de ataque */
.attack-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  overflow-y: auto;
  padding: 5vh 0;
  z-index: 1100;
}

.attack-form {
  background: #2c2f33;
  padding: 25px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}

.attack-form h3 {
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  color: #99aab5;
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  background: #23272a;
  border: 1px solid #99aab5;
  border-radius: 5px;
  color: #ffffff;
}

.damage-rolls-section h4, .lifesteal-section h4 {
  color: #ffffff;
  margin-top: 20px;
  margin-bottom: 10px;
}

.damage-roll-item {
  background: rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-end; /* Align to the bottom */
  gap: 10px;
}

.damage-roll-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
  width: 100%;
}

.form-group-inline select {
  padding: 8px;
  background: #23272a;
  border: 1px solid #99aab5;
  border-radius: 5px;
  color: #ffffff;
  width: 100%;
}

.input-narrow {
  width: 100%;
}

.form-group-inline {
  display: flex;
  flex-direction: column;
}

.form-group-inline label {
  color: #99aab5;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.form-group-inline input {
  padding: 8px;
  background: #23272a;
  border: 1px solid #99aab5;
  border-radius: 5px;
  color: #ffffff;
  width: 100%;
}

.btn-remove-roll {
  background: #f04747;
  color: white;
  border: none;
  border-radius: 5px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-add-roll {
  background: #43b581;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.form-actions {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-save { background-color: #43b581; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
.btn-cancel { background-color: #99aab5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }

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
    height: 80vh;
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

  .damage-roll-item {
    flex-direction: column;
    align-items: stretch;
  }

  .damage-roll-inputs {
    grid-template-columns: 1fr 1fr; /* Two columns for smaller screens */
  }

  .btn-remove-roll {
    margin-top: 10px;
    width: 100%;
    height: 40px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
  }

  .btn-save, .btn-cancel {
    width: 100%;
    padding: 12px 20px;
    font-size: 1rem;
  }

  .btn-new-attack {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .attack-manager-container {
    width: 100%;
    height: 80vh;
    border-radius: 0;
  }

  .header {
    flex-direction: row;
    padding: 12px 15px;
    border-radius: 0;
  }

  .header h2 {
    font-size: 1.2rem;
  }

  .close-btn {
    font-size: 1.6rem;
  }

  .content {
    padding: 15px;
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

  .damage-roll-inputs {
    grid-template-columns: 1fr; /* Single column for very small screens */
  }

  .btn-new-attack {
    font-size: 1rem;
    padding: 10px 20px;
  }

  .attack-form {
    width: 95%;
    padding: 20px;
  }

  .form-group-inline label {
    font-size: 0.8rem;
  }

  .btn-add-roll {
    width: 100%;
    justify-content: center;
    padding: 10px;
  }
}
</style>