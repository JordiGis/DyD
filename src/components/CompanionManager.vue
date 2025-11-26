<template>
  <div class="companion-manager-overlay" @click.self="$emit('close')">
    <div class="companion-manager-content">
      <div class="companion-manager-header">
        <h2><i class="bi bi-person-heart"></i> Compañeros de {{ playerName }}</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="companion-manager-body">
        <div class="add-companion">
          <input
            type="text"
            v-model="newCompanionName"
            placeholder="Nombre del nuevo compañero"
            @keyup.enter="addCompanion"
          />
          <button @click="addCompanion" :disabled="!newCompanionName.trim()" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> Añadir Compañero
          </button>
        </div>

        <div class="companion-list">
          <div v-if="!companions || companions.length === 0" class="empty-state">
            <p>Este jugador no tiene compañeros todavía.</p>
          </div>

          <div v-for="companion in companions" :key="companion.id" class="companion-card">
            <div class="companion-info">
              <div class="companion-image">
                <img :src="companion.image || defaultImage" alt="Companion Image" />
              </div>
              <h3 class="companion-name">{{ companion.name }}</h3>
            </div>

            <div class="companion-footer">
              <button @click="openEditModal(companion)" class="btn btn-secondary btn-sm">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button @click="deleteCompanion(companion.id)" class="btn btn-danger btn-sm">
                <i class="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="companion-manager-overlay edit-modal" @click.self="showEditModal = false">
      <div class="companion-manager-content">
        <div class="companion-manager-header">
          <h2><i class="bi bi-pencil-square"></i> Editar Compañero</h2>
          <button @click="showEditModal = false" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="companion-manager-body">
          <div v-if="editingCompanion" class="edit-form">
            <div class="form-group">
              <label for="companionName">Nombre</label>
              <input id="companionName" type="text" v-model="editingCompanion.name" class="form-control" />
            </div>
            <div class="form-group">
              <label for="companionNotes">Notas</label>
              <textarea id="companionNotes" v-model="editingCompanion.notes" class="notes-textarea"></textarea>
            </div>
            <div class="form-group">
              <label for="companionImage">URL de la Imagen</label>
              <input id="companionImage" type="text" v-model="editingCompanion.image" class="form-control" />
            </div>
            <div class="modal-actions">
              <button @click="showEditModal = false" class="btn btn-secondary">Cancelar</button>
              <button @click="saveCompanionEdit" class="btn btn-primary">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePlayerStore } from '../stores/usePlayerStore';
import Swal from 'sweetalert2';

const props = defineProps({
  playerId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const playerStore = usePlayerStore();

const player = computed(() => playerStore.players.find(p => p.id === props.playerId));
const playerName = computed(() => player.value?.name || 'Jugador');
const companions = computed(() => player.value?.companions || []);

const newCompanionName = ref('');
const showEditModal = ref(false);
const editingCompanion = ref(null);
const defaultImage = 'https://via.placeholder.com/150';

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    if (showEditModal.value) {
      showEditModal.value = false;
    } else {
      emit('close');
    }
  }
};

onMounted(() => {
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', handleEscape);
});

const addCompanion = () => {
  if (newCompanionName.value.trim()) {
    playerStore.addCompanion(props.playerId, { name: newCompanionName.value });
    newCompanionName.value = '';
  }
};

const deleteCompanion = (companionId) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, ¡elimínalo!',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      playerStore.deleteCompanion(props.playerId, companionId);
      Swal.fire('¡Eliminado!', 'El compañero ha sido eliminado.', 'success');
    }
  });
};

const openEditModal = (companion) => {
  editingCompanion.value = { ...companion };
  showEditModal.value = true;
};

const saveCompanionEdit = () => {
  if (editingCompanion.value) {
    playerStore.editCompanion(props.playerId, editingCompanion.value.id, editingCompanion.value);
    showEditModal.value = false;
    editingCompanion.value = null;
  }
};
</script>

<style scoped>
.companion-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.edit-modal {
  z-index: 1300;
}

.companion-manager-content {
  background: linear-gradient(145deg, #2c2f33, #23272a);
  color: #f0f0f0;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.companion-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.companion-manager-body {
  padding: 24px;
  overflow-y: auto;
}

.add-companion {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.companion-list {
  display: grid;
  gap: 18px;
}

.companion-card {
  background: #2c2a2a;
  border: 2px solid #4a413a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.companion-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.companion-image img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f39c12;
}

.companion-name {
  font-size: 1.5rem;
  color: #f0e6d2;
  margin: 0;
}

.companion-footer {
  display: flex;
  gap: 10px;
}

.notes-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #f0f0f0;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
