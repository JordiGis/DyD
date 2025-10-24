<template>
  <div class="character-state-manager">
    <h2 class="section-title">Estados del Personaje</h2>

    <form @submit.prevent="addNewState" class="state-form">
      <div class="form-group">
        <label for="stateTitle" class="form-label">Título del Estado</label>
        <input
          id="stateTitle"
          v-model="newStateTitle"
          type="text"
          class="form-control"
          placeholder="Ej: Herido, Furioso..."
          required
        />
      </div>

      <div class="form-group">
        <label for="stateImage" class="form-label">Imagen del Estado</label>
        <input
          id="stateImage"
          @change="handleImageUpload"
          type="file"
          class="form-control"
          accept="image/*"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Guardando...' : 'Añadir Estado' }}
      </button>
    </form>

    <div class="storage-usage">
      <h3 class="storage-title">Uso del Almacenamiento</h3>
      <progress :value="storageUsed" :max="storageQuota" class="storage-bar"></progress>
      <p class="storage-text">
        {{ (storageUsed / 1024 / 1024).toFixed(2) }} MB / {{ (storageQuota / 1024 / 1024).toFixed(2) }} MB
      </p>
    </div>

    <div class="state-list">
      <h3 class="list-title">Estados Guardados</h3>
      <div v-if="states.length === 0" class="empty-list">
        No hay estados guardados.
      </div>
      <div v-else class="states-grid">
        <div
          v-for="state in states"
          :key="state.id"
          class="state-card"
          :class="{ selected: state.id === selectedStateId }"
          @click="selectState(state.id)"
        >
          <img :src="getImageUrl(state.image)" :alt="state.title" class="state-image" />
          <p class="state-title">{{ state.title }}</p>
          <button @click.stop="removeState(state.id)" class="btn-delete">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCharacterStateStore } from '../stores/useCharacterStateStore';
import Swal from 'sweetalert2';

const stateStore = useCharacterStateStore();
const { states, selectedStateId, isLoading } = storeToRefs(stateStore);

const newStateTitle = ref('');
const newStateImage = ref(null);
const storageUsed = ref(0);
const storageQuota = ref(50 * 1024 * 1024); // 50MB quota for example

const fetchStorageUsage = async () => {
  storageUsed.value = await stateStore.getStorageUsage();
};

onMounted(async () => {
  await stateStore.loadStates();
  await fetchStorageUsage();
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newStateImage.value = file;
  }
};

const addNewState = async () => {
  if (!newStateTitle.value.trim() || !newStateImage.value) {
    Swal.fire('Error', 'Por favor, completa todos los campos.', 'error');
    return;
  }

  await stateStore.addState(newStateTitle.value, newStateImage.value);

  newStateTitle.value = '';
  newStateImage.value = null;
  document.getElementById('stateImage').value = '';

  await fetchStorageUsage();

  Swal.fire('¡Éxito!', 'Nuevo estado añadido correctamente.', 'success');
};

const selectState = async (stateId) => {
  await stateStore.setSelectedState(stateId);
};

const removeState = async (stateId) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    await stateStore.deleteState(stateId);
    await fetchStorageUsage();
    Swal.fire('Eliminado', 'El estado ha sido eliminado.', 'success');
  }
};

const getImageUrl = (imageBlob) => {
  if (imageBlob instanceof Blob) {
    return URL.createObjectURL(imageBlob);
  }
  return '';
};
</script>

<style scoped>
.character-state-manager {
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
}
.section-title {
  color: #f39c12;
  text-align: center;
  margin-bottom: 20px;
}
.state-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}
.storage-usage {
  margin-bottom: 20px;
}
.storage-bar {
  width: 100%;
}
.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}
.state-card {
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}
.state-card.selected {
  border-color: #f39c12;
}
.state-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
}
.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
