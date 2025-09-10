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
          <div v-for="attack in attackStore.attacks" :key="attack.id" class="attack-item">
            <div class="attack-info">
              <span class="attack-name">{{ attack.name }}</span>
              <div class="attack-summary">
                <span v-for="(roll, index) in attack.damageRolls" :key="index" class="damage-tag">
                  {{ roll.dice }} {{ roll.type }}
                </span>
              </div>
            </div>
            <div class="attack-actions">
              <button @click="executeAndShowAttack(attack)" class="action-btn btn-execute">Ejecutar</button>
              <button @click="editAttack(attack)" class="action-btn btn-edit">Editar</button>
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
              <div v-for="(roll, index) in currentAttack.damageRolls" :key="index" class="damage-roll-row">
                <input type="text" v-model="roll.dice" placeholder="2d6">
                <input type="text" v-model="roll.type" placeholder="slashing">
                <input type="number" v-model.number="roll.bonus" placeholder="Bonus (+3)">
                <input type="number" v-model.number="roll.min" placeholder="Mínimo (1)">
                <button @click="removeDamageRoll(index)" class="btn-remove-roll">✕</button>
              </div>
              <button @click="addDamageRoll" class="btn-add-roll">
                <i class="bi bi-plus"></i> Añadir tipo de daño
              </button>
            </div>

            <!-- Robo de vida -->
            <div class="lifesteal-section">
              <h4>Robo de Vida (Opcional)</h4>
              <div class="form-group">
                <label>Porcentaje de Robo de Vida (%)</label>
                <input type="number" v-model.number="currentAttack.lifeSteal.percentage" placeholder="Ej: 30">
              </div>
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
import { ref, onMounted, reactive } from 'vue';
import { useAttackStore } from '../stores/useAttackStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { executeAttack } from '../utils/attackLogic';
import Swal from 'sweetalert2';

const emit = defineEmits(['close']);

const attackStore = useAttackStore();
const characterStore = useCharacterStore();

const isFormVisible = ref(false);
const isEditing = ref(false);
const currentAttack = reactive({
  id: null,
  name: '',
  damageRolls: [],
  lifeSteal: { percentage: 0 },
});

// Cargar ataques al montar el componente
onMounted(() => {
  attackStore.loadAttacks();
});

// Funciones del formulario
const showAttackForm = () => {
  isEditing.value = false;
  Object.assign(currentAttack, {
    id: null,
    name: '',
    damageRolls: [{ dice: '1d6', type: 'normal', bonus: 0, min: 1 }],
    lifeSteal: { percentage: 0 },
  });
  isFormVisible.value = true;
};

const editAttack = (attack) => {
  isEditing.value = true;
  Object.assign(currentAttack, JSON.parse(JSON.stringify(attack)));
  isFormVisible.value = true;
};

const hideAttackForm = () => {
  isFormVisible.value = false;
};

const addDamageRoll = () => {
  currentAttack.damageRolls.push({ dice: '1d6', type: 'normal', bonus: 0, min: 1 });
};

const removeDamageRoll = (index) => {
  currentAttack.damageRolls.splice(index, 1);
};

const saveAttack = () => {
  if (!currentAttack.name) {
    Swal.fire('Error', 'El nombre del ataque no puede estar vacío.', 'error');
    return;
  }

  if (isEditing.value) {
    attackStore.updateAttack(JSON.parse(JSON.stringify(currentAttack)));
  } else {
    attackStore.addAttack(JSON.parse(JSON.stringify(currentAttack)));
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

// Ejecución del ataque
const executeAndShowAttack = (attack) => {
  const result = executeAttack(attack);

  // Formatear el resultado para SweetAlert
  let htmlResult = `<div class="attack-result-modal">`;
  htmlResult += `<h3>${result.name}</h3>`;

  for (const type in result.results) {
    const data = result.results[type];
    htmlResult += `
      <div class="damage-type-block">
        <div class="damage-header">
          <span class="damage-type">${type.toUpperCase()}</span>
          <span class="damage-total">${data.total}</span>
        </div>
        <div class="damage-details">
          <span>Tiradas: [${data.rolls.join(', ')}]</span>
          <span>Bonus: ${data.bonus > 0 ? '+' : ''}${data.bonus}</span>
        </div>
    `;
    if (data.lifeSteal) {
      htmlResult += `
        <div class="lifesteal-details">
          <i class="bi bi-heart-fill"></i>
          <span>Curado: ${data.lifeSteal.healed}</span>
        </div>
      `;
    }
    htmlResult += `</div>`;
  }

  htmlResult += `<div class="grand-total">Daño Total: ${result.grandTotal}</div>`;
  if (result.totalHealed > 0) {
    htmlResult += `<div class="total-healed">Curación Total: ${result.totalHealed}</div>`;
  }
  htmlResult += `</div>`;

  Swal.fire({
    title: 'Resultado del Ataque',
    html: htmlResult,
    confirmButtonText: '¡Entendido!',
    customClass: {
      popup: 'attack-result-swal'
    }
  });

  // Aplicar daño y curación al personaje
  characterStore.takeDamage(result.grandTotal);
  if (result.totalHealed > 0) {
    characterStore.heal(result.totalHealed);
  }

  // Añadir al log
  characterStore.addLog(
    `Ataque: ${attack.name}`,
    `Daño total: ${result.grandTotal}. Curación por robo de vida: ${result.totalHealed}.`
  );
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  justify-content: space-between;
  align-items: center;
  border-left: 5px solid #7289da;
}

.attack-name {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: bold;
}

.attack-summary {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.damage-tag {
  background: #7289da;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.attack-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: bold;
}

.btn-execute { background-color: #43b581; }
.btn-edit { background-color: #faa61a; }
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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.attack-form {
  background: #2c2f33;
  padding: 25px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
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

.damage-roll-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.damage-roll-row input {
  padding: 8px;
  background: #23272a;
  border: 1px solid #99aab5;
  border-radius: 5px;
  color: #ffffff;
}

.btn-remove-roll {
  background: #f04747;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
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
</style>
