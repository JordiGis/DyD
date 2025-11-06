<template>
  <div class="passive-damage-manager-overlay" @click.self="$emit('close')">
    <div class="passive-damage-manager-container">
      <div class="header">
        <h2><i class="bi bi-shield-fill-exclamation"></i> Gestor de Daño Pasivo</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="content">
        <!-- Lista de daños pasivos -->
        <div class="passive-damages-list">
          <div v-if="passiveDamageStore.passiveDamages.length === 0" class="no-damages">
            No hay daños pasivos configurados.
          </div>
          <div v-for="damage in passiveDamageStore.passiveDamages" :key="damage.id" class="damage-item">
            <div class="damage-info">
              <span class="damage-name">{{ damage.name }}</span>
              <span class="damage-dice">{{ damage.dice }}</span>
            </div>
            <div class="damage-actions">
              <button @click="editDamage(damage)" class="action-btn btn-edit">Editar</button>
              <button @click="confirmDelete(damage.id)" class="action-btn btn-delete">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Botón para crear nuevo daño pasivo -->
        <div class="new-damage-area">
          <button @click="showDamageForm()" class="btn-new-damage">
            <i class="bi bi-plus-circle-fill"></i> Añadir Daño Pasivo
          </button>
        </div>

        <!-- Formulario de daño pasivo (modal) -->
        <div v-if="isFormVisible" class="damage-form-overlay" @click.self="hideDamageForm">
          <div class="damage-form">
            <h3>{{ isEditing ? 'Editar Daño Pasivo' : 'Nuevo Daño Pasivo' }}</h3>

            <div class="form-group">
              <label>Nombre</label>
              <input type="text" v-model="currentDamage.name" placeholder="Ej: Veneno, Quemadura">
            </div>

            <div class="form-group">
              <label>Dados de Daño</label>
              <input type="text" v-model="currentDamage.dice" placeholder="Ej: 1d6, 2d4+2">
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
import Swal from 'sweetalert2';

const emit = defineEmits(['close']);
const passiveDamageStore = usePassiveDamageStore();

const isFormVisible = ref(false);
const isEditing = ref(false);

const currentDamage = reactive({
  id: null,
  name: '',
  dice: '',
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
  currentDamage.dice = damage.dice;
  isFormVisible.value = true;
};

const showDamageForm = () => {
  isEditing.value = false;
  setupForm({ id: null, name: '', dice: '' });
};

const editDamage = (damage) => {
  isEditing.value = true;
  setupForm(damage);
};

const hideDamageForm = () => {
  isFormVisible.value = false;
};

const saveDamage = () => {
  if (!currentDamage.name || !currentDamage.dice) {
    Swal.fire('Error', 'El nombre y los dados no pueden estar vacíos.', 'error');
    return;
  }

  if (isEditing.value) {
    passiveDamageStore.updatePassiveDamage({ ...currentDamage });
  } else {
    passiveDamageStore.addPassiveDamage({ name: currentDamage.name, dice: currentDamage.dice });
  }
  hideDamageForm();
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
/* Estilos generales (similares a AttackManager) */
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
  max-width: 600px;
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

/* Lista de daños */
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
  border-left: 5px solid #f04747; /* Rojo para daño */
}

.damage-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.damage-name {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: bold;
}

.damage-dice {
  background: #7289da;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  align-self: flex-start;
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
.btn-delete { background-color: #f04747; }

/* Área de nuevo daño */
.new-damage-area {
  margin-top: 25px;
  text-align: center;
}

.btn-new-damage {
  background-color: #43b581; /* Verde para añadir */
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

/* Formulario */
.damage-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.damage-form {
  background: #2c2f33;
  padding: 25px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
}

.damage-form h3 {
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

.form-actions {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-save { background-color: #43b581; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
.btn-cancel { background-color: #99aab5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
</style>
