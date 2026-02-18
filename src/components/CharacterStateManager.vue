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
          <img v-if="getImageUrl(state.id)" :src="getImageUrl(state.id)" :alt="state.title" class="state-image" />
          <div v-else class="state-image state-image-placeholder">
            <p>Sin imagen</p>
          </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCharacterStateStore } from '../stores/useCharacterStateStore';
import Swal from 'sweetalert2';

const stateStore = useCharacterStateStore();
const { states, selectedStateId, isLoading } = storeToRefs(stateStore);

const newStateTitle = ref('');
const newStateImage = ref(null);
const imageUrls = ref({});

const loadStateImages = async () => {
  console.log('Cargando imágenes para estados:', states.value);
  
  for (const state of states.value) {
    console.log(`Procesando estado ${state.id}:`, state);
    
    // Si ya tiene URL, saltar
    if (imageUrls.value[state.id]) {
      console.log(`URL ya existe para ${state.id}`);
      continue;
    }
    
    if (state.image) {
      console.log(`Buscando imagen en localforage para ${state.id} (image: ${state.image})`);
      try {
        const imageBlob = await stateStore.getStateImage(state.image);
        console.log(`Blob recibido para ${state.id}:`, imageBlob);
        
        if (imageBlob) {
          imageUrls.value[state.id] = URL.createObjectURL(imageBlob);
          console.log(`URL creada para ${state.id}:`, imageUrls.value[state.id]);
        } else {
          console.log(`No se encontró blob para ${state.id}`);
        }
      } catch (error) {
        console.error(`Error cargando imagen para ${state.id}:`, error);
      }
    } else {
      console.log(`Estado ${state.id} no tiene propiedad image`);
    }
  }
};

onMounted(async () => {
  await stateStore.loadData();
  await loadStateImages();
});

// Watch para detectar cuando se añaden nuevos estados
watch(() => states.value.length, async () => {
  await loadStateImages();
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
  
  await loadStateImages();

  newStateTitle.value = '';
  newStateImage.value = null;
  document.getElementById('stateImage').value = '';

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
    if (imageUrls.value[stateId]) {
      URL.revokeObjectURL(imageUrls.value[stateId]);
      delete imageUrls.value[stateId];
    }
    Swal.fire('Eliminado', 'El estado ha sido eliminado.', 'success');
  }
};

const getImageUrl = (stateId) => {
  return imageUrls.value[stateId] || '';
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

.state-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(236, 240, 241, 0.6);
  font-size: 0.85rem;
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
