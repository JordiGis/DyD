<template>
  <div class="passive-damage-manager-overlay" @click.self="$emit('close')">
    <div class="passive-damage-manager-container">
      <div class="header">
        <h2><i class="bi bi-shield-fill-exclamation"></i> Gestor de Daño Pasivo</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="content">
        <div class="passive-damages-list">
          <div v-if="passiveDamageStore.passiveDamages.length === 0" class="no-damages">
            No hay daños pasivos configurados.
          </div>
          <div v-for="damage in passiveDamageStore.passiveDamages" :key="damage.id" class="damage-item">
            <div class="damage-info">
              <span class="damage-name">{{ damage.name }}</span>
              <span v-if="damage.duration > 0" class="duration-tag">
                <i class="bi bi-hourglass-split"></i> {{ damage.duration }} turnos restantes
              </span>
              <div class="damage-summary">
                <span v-for="(roll, index) in damage.damageRolls" :key="index" class="damage-tag">
                  {{ roll.numDice }}d{{ roll.diceType }}{{ roll.bonus > 0 ? '+' + roll.bonus : '' }} {{ roll.type }}
                </span>
              </div>
            </div>
            <div class="damage-actions">
              <button @click="editDamage(damage)" class="action-btn btn-edit">Editar</button>
              <button @click="duplicateDamage(damage.id)" class="action-btn btn-duplicate">Duplicar</button>
              <button @click="confirmDelete(damage.id)" class="action-btn btn-delete">Eliminar</button>
            </div>
          </div>
        </div>

        <div class="new-damage-area">
          <button @click="showDamageForm()" class="btn-new-damage">
            <i class="bi bi-plus-circle-fill"></i> Añadir Daño Pasivo
          </button>
        </div>

        <div v-if="isFormVisible" class="damage-form-overlay" @click.self="hideDamageForm">
          <div class="damage-form">
            <h3>{{ isEditing ? 'Editar Daño Pasivo' : 'Nuevo Daño Pasivo' }}</h3>

            <div class="form-group">
              <label>Nombre</label>
              <input type="text" v-model="currentDamage.name" placeholder="Ej: Aura venenosa">
            </div>

            <div class="form-group">
              <label>Duración en Turnos (0 para infinito)</label>
              <input type="number" v-model.number="currentDamage.duration" min="0">
            </div>

            <div class="damage-rolls-section">
              <h4>Tiradas de Daño</h4>
              <div v-for="(roll, index) in currentDamage.damageRolls" :key="index" class="damage-roll-item">
                <div class="damage-roll-inputs">
                  <div class="form-group-inline">
                    <label>Cantidad</label>
                    <input type="number" v-model.number="roll.numDice" min="1" class="input-narrow">
                  </div>
                  <div class="form-group-inline">
                    <label>Tipo de Dado</label>
                    <select v-model.number="roll.diceType">
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
                    <label>Bonus</label>
                    <input type="number" v-model.number="roll.bonus" placeholder="+0">
                  </div>
                  <div class="form-group-inline">
                    <label>Tipo de Daño</label>
                    <select v-model="roll.type">
                      <option v-for="dType in damageTypes" :key="dType.id" :value="dType.id">
                        {{ dType.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <button @click="removeDamageRoll(index)" class="btn-remove-roll">✕</button>
              </div>
              <button @click="addDamageRoll" class="btn-add-roll">
                <i class="bi bi-plus"></i> Añadir tipo de daño
              </button>
            </div>

            <div class="form-actions">
              <button @click="saveDamage" class="btn-save">{{ isEditing ? 'Guardar Cambios' : 'Crear' }}</button>
              <button @click="hideDamageForm" class="btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { usePassiveDamageStore } from '../stores/usePassiveDamageStore';
import { damageTypes } from '../utils/damageTypes';
import Swal from 'sweetalert2';

const emit = defineEmits(['close']);
const passiveDamageStore = usePassiveDamageStore();

const isFormVisible = ref(false);
const isEditing = ref(false);

const currentDamage = reactive({
  id: null,
  name: '',
  duration: 0,
  damageRolls: [],
});

onMounted(() => {
  document.body.style.overflow = 'hidden';
  passiveDamageStore.loadPassiveDamages();
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const setupForm = (damage) => {
  currentDamage.id = damage.id;
  currentDamage.name = damage.name;
  currentDamage.duration = damage.duration || 0;
  currentDamage.damageRolls.splice(0, currentDamage.damageRolls.length, ...JSON.parse(JSON.stringify(damage.damageRolls || [])));
  isFormVisible.value = true;
};

const showDamageForm = () => {
  isEditing.value = false;
  setupForm({ id: null, name: '', duration: 0, damageRolls: [{ numDice: 1, diceType: 6, bonus: 0, type: 'bludgeoning' }] });
};

const editDamage = (damage) => {
  isEditing.value = true;
  setupForm(damage);
};

const hideDamageForm = () => {
  isFormVisible.value = false;
};

const addDamageRoll = () => {
  currentDamage.damageRolls.push({ numDice: 1, diceType: 6, bonus: 0, type: 'bludgeoning' });
};

const removeDamageRoll = (index) => {
  currentDamage.damageRolls.splice(index, 1);
};

const saveDamage = () => {
  if (!currentDamage.name || currentDamage.damageRolls.length === 0) {
    Swal.fire('Error', 'El nombre y al menos una tirada de daño son requeridos.', 'error');
    return;
  }

  const damageToSave = JSON.parse(JSON.stringify(currentDamage));

  if (isEditing.value) {
    passiveDamageStore.updatePassiveDamage(damageToSave);
  } else {
    passiveDamageStore.addPassiveDamage(damageToSave);
  }
  hideDamageForm();
};

const duplicateDamage = (damageId) => {
    passiveDamageStore.duplicatePassiveDamage(damageId);
};

const confirmDelete = (damageId) => {
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
      passiveDamageStore.deletePassiveDamage(damageId);
      Swal.fire('Eliminado', 'El daño pasivo ha sido eliminado.', 'success');
    }
  });
};
</script>

<style scoped>
.duration-tag {
  background-color: #3498db;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 10px;
}
.passive-damage-manager-overlay {
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
.passive-damage-manager-container {
  background: #2c2f33;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
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
.passive-damages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.no-damages {
  text-align: center;
  color: #99aab5;
  padding: 30px;
  font-style: italic;
}
.damage-item {
  background: #23272a;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border-left: 5px solid #f04747;
}
.damage-info {
  flex-grow: 1;
}
.damage-name {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
}
.damage-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.damage-tag {
  background: #7289da;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
}
.damage-actions {
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
}
.btn-edit { background-color: #faa61a; }
.btn-duplicate { background-color: #5865f2; }
.btn-delete { background-color: #f04747; }
.new-damage-area {
  margin-top: 25px;
  text-align: center;
}
.btn-new-damage {
  background-color: #43b581;
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
.damage-form-overlay {
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
.damage-form {
  background: #2c2f33;
  padding: 25px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
}
.damage-form h3 {
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
}
.form-group, .damage-rolls-section {
  margin-bottom: 15px;
}
.form-group label, .damage-rolls-section h4 {
  color: #99aab5;
  display: block;
  margin-bottom: 10px;
}
.form-group input {
  width: 100%;
  padding: 10px;
  background: #23272a;
  border: 1px solid #99aab5;
  border-radius: 5px;
  color: #ffffff;
}
.damage-roll-item {
  background: rgba(0,0,0,0.2);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.damage-roll-inputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}
.form-group-inline {
  display: flex;
  flex-direction: column;
}
.form-group-inline label {
  font-size: 0.85rem;
  margin-bottom: 5px;
}
.form-group-inline input, .form-group-inline select {
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
</style>
