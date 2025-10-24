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
  padding: 25px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  color: #f39c12;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.state-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #ecf0f1;
  font-weight: 600;
  font-size: 1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.form-control {
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #ecf0f1;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.form-control::placeholder {
  color: rgba(236, 240, 241, 0.6);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.storage-usage {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.storage-title {
  color: #ecf0f1;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.storage-bar {
  width: 100%;
  height: 20px;
  border-radius: 10px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
}

.storage-bar::-webkit-progress-bar {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.storage-bar::-webkit-progress-value {
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 10px;
}

.storage-bar::-moz-progress-bar {
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 10px;
}

.storage-text {
  color: #ecf0f1;
  font-size: 0.95rem;
  text-align: center;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.state-list {
  margin-top: 20px;
}

.list-title {
  color: #ecf0f1;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.empty-list {
  color: rgba(236, 240, 241, 0.7);
  text-align: center;
  padding: 30px;
  font-size: 1.1rem;
  font-style: italic;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.state-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.state-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.state-card.selected {
  border-color: #f39c12;
  background: rgba(243, 156, 18, 0.2);
  box-shadow: 0 0 20px rgba(243, 156, 18, 0.3);
}

.state-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.state-title {
  color: #ecf0f1;
  font-weight: 600;
  font-size: 1rem;
  margin: 10px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  word-wrap: break-word;
}

.btn-delete {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

@media (max-width: 768px) {
  .character-state-manager {
    padding: 20px 15px;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 0.95rem;
  }

  .form-control {
    padding: 14px 16px;
    font-size: 1rem;
  }

  .btn {
    padding: 14px 20px;
  }

  .storage-title {
    font-size: 1.1rem;
  }

  .list-title {
    font-size: 1.2rem;
  }

  .states-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }

  .state-title {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .character-state-manager {
    padding: 18px 12px;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .states-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
