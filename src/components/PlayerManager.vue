<template>
  <div class="player-manager-overlay">
    <div class="player-manager-content">
      <div class="player-manager-header">
        <h2><i class="bi bi-person-badge"></i> Gestión de Jugadores</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="player-manager-body">
        <!-- Controles globales -->
        <div class="global-controls-player">
          <button @click="startNewSession" class="btn btn-warning">
            <i class="bi bi-play-circle"></i> Iniciar Nueva Sesión
          </button>
          <div class="add-xp-all">
            <input
              type="number"
              v-model.number="xpToAll"
              placeholder="XP para todos"
              min="1"
            />
            <button
              @click="addXpToAll"
              :disabled="!xpToAll || xpToAll <= 0"
              class="btn btn-info"
            >
              <i class="bi bi-people-fill"></i> Dar a Todos
            </button>
          </div>
        </div>

        <!-- Añadir nuevo jugador -->
        <div class="add-player">
          <input
            type="text"
            v-model="newPlayerName"
            placeholder="Nombre del nuevo jugador"
            @keyup.enter="addPlayer"
          />
          <button
            @click="addPlayer"
            :disabled="!newPlayerName.trim()"
            class="btn btn-primary"
          >
            <i class="bi bi-plus-circle"></i> Añadir Jugador
          </button>
        </div>

        <!-- Lista de jugadores -->
        <div class="player-list">
          <div v-if="players.length === 0" class="empty-state">
            <p>Aún no hay jugadores. ¡Añade el primero para empezar!</p>
          </div>

          <div
            v-for="player in players"
            :key="player.id"
            class="player-card"
          >
            <div class="player-info">
              <h3 class="player-name">{{ player.name }}</h3>
              <div class="player-xp-total">
                XP Sesión: <strong>{{ player.sessionXp }}</strong>
              </div>
            </div>

            <div class="player-actions">
              <div class="add-xp-single">
                <input
                  type="number"
                  v-model.number="playerXpInputs[player.id]"
                  placeholder="Añadir XP"
                  min="1"
                  class="xp-input"
                />
                <button
                  @click="addXpToPlayer(player.id)"
                  :disabled="
                    !playerXpInputs[player.id] || playerXpInputs[player.id] <= 0
                  "
                  class="btn btn-success btn-sm"
                >
                  <i class="bi bi-plus"></i>
                </button>
                <button
                  @click="removeXpFromPlayer(player.id)"
                  :disabled="
                    !playerXpInputs[player.id] || playerXpInputs[player.id] <= 0
                  "
                  class="btn btn-danger btn-sm"
                >
                  <i class="bi bi-dash"></i>
                </button>
              </div>
              <div class="quick-xp-buttons">
                <button
                  v-for="amount in mostUsedXpValues"
                  :key="amount"
                  @click="addQuickXp(player.id, amount)"
                  class="btn btn-outline-primary btn-sm"
                >
                  +{{ amount }} XP
                </button>
              </div>
            </div>

            <div class="player-footer">
              <button
                @click="toggleXpHistory(player.id)"
                class="btn btn-link btn-sm"
              >
                <i class="bi bi-clock-history"></i> Ver Historial
              </button>
              <button
                @click="toggleNotes(player.id)"
                class="btn btn-link btn-sm"
              >
                <i class="bi bi-journal-text"></i> Notas
              </button>
              <div>
                <button
                  @click="openEditModal(player)"
                  class="btn btn-secondary btn-sm"
                >
                  <i class="bi bi-pencil"></i> Editar
                </button>
                <button
                  @click="deletePlayer(player.id)"
                  class="btn btn-danger btn-sm"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div
              v-if="visibleHistories.has(player.id)"
              class="xp-history"
            >
              <h4>Historial de XP (Sesión)</h4>
              <ul>
                <li
                  v-for="(entry, index) in player.xpHistory"
                  :key="index"
                  :class="{
                    'xp-gain': entry.amount > 0,
                    'xp-loss': entry.amount < 0,
                  }"
                >
                  {{ entry.amount > 0 ? "+" : "" }}{{ entry.amount }} XP
                  <span class="timestamp">{{
                    new Date(entry.timestamp).toLocaleTimeString()
                  }}</span>
                </li>
                <li v-if="player.xpHistory.length === 0">
                  No hay entradas de XP en esta sesión.
                </li>
              </ul>
            </div>

            <!-- Sección de Notas -->
            <div v-if="visibleNotes.has(player.id)" class="notes-section">
              <textarea
                v-model="player.notes"
                @blur="saveNotes(player)"
                placeholder="Añade tus notas aquí..."
                class="notes-textarea"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal de Edición -->
    <div v-if="showEditModal" class="player-manager-overlay edit-modal">
      <div class="player-manager-content">
        <div class="player-manager-header">
          <h2><i class="bi bi-pencil-square"></i> Editar Jugador</h2>
          <button @click="showEditModal = false" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="player-manager-body">
          <div v-if="editingPlayer" class="edit-form">
            <div class="form-group">
              <label for="playerName">Nombre del Jugador</label>
              <input
                id="playerName"
                type="text"
                v-model="editingPlayer.name"
                class="form-control"
              />
            </div>
            <div class="modal-actions">
              <button @click="showEditModal = false" class="btn btn-secondary">
                Cancelar
              </button>
              <button @click="savePlayerEdit" class="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { usePlayerStore } from "../stores/usePlayerStore";
import Swal from "sweetalert2";

// No es necesario definir emits aquí con la nueva sintaxis
// defineEmits(['close']);

const playerStore = usePlayerStore();
const { players, mostUsedXpValues } = storeToRefs(playerStore);

const newPlayerName = ref("");
const xpToAll = ref(null);
const playerXpInputs = ref({});
const visibleHistories = ref(new Set());
const visibleNotes = ref(new Set()); // Para controlar la visibilidad de las notas
const showEditModal = ref(false);
const editingPlayer = ref(null);

onMounted(() => {
  playerStore.loadFromLocalStorage();
  // Bloquear el scroll del body
  document.body.classList.add("modal-open");
  // Inicializar los inputs de XP para cada jugador
  players.value.forEach((p) => {
    playerXpInputs.value[p.id] = null;
  });
});

onUnmounted(() => {
  // Restaurar el scroll del body
  document.body.classList.remove("modal-open");
});

const addPlayer = () => {
  if (newPlayerName.value.trim()) {
    playerStore.addPlayer(newPlayerName.value);
    newPlayerName.value = "";
  }
};

const deletePlayer = (playerId) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, ¡elimínalo!",
    cancelButtonText: "Cancelar",
    customClass: {
      container: "high-z-index",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      playerStore.deletePlayer(playerId);
      Swal.fire("¡Eliminado!", "El jugador ha sido eliminado.", "success");
    }
  });
};

const addXpToPlayer = (playerId) => {
  const amount = playerXpInputs.value[playerId];
  if (amount && amount > 0) {
    playerStore.addXpToPlayer(playerId, amount);
    playerXpInputs.value[playerId] = null; // Reset input
  }
};

const removeXpFromPlayer = (playerId) => {
  const amount = playerXpInputs.value[playerId];
  if (amount && amount > 0) {
    playerStore.removeXpFromPlayer(playerId, amount);
    playerXpInputs.value[playerId] = null; // Reset input
  }
};

const addQuickXp = (playerId, amount) => {
  playerStore.addXpToPlayer(playerId, amount);
};

const addXpToAll = () => {
  if (xpToAll.value && xpToAll.value > 0) {
    playerStore.addXpToAllPlayers(xpToAll.value);
    xpToAll.value = null; // Reset input
  }
};

const startNewSession = () => {
  Swal.fire({
    title: "¿Iniciar una nueva sesión?",
    text: "Esto reseteará la XP de la sesión actual de todos los jugadores a 0.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, iniciar",
    cancelButtonText: "Cancelar",
    customClass: {
      container: "high-z-index",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      playerStore.startNewSession();
      Swal.fire({
        title: "¡Nueva sesión iniciada!",
        text: "La XP de la sesión ha sido reseteada.",
        icon: "success",
        customClass: {
          container: "high-z-index",
        },
      });
    }
  });
};

const toggleXpHistory = (playerId) => {
  if (visibleHistories.value.has(playerId)) {
    visibleHistories.value.delete(playerId);
  } else {
    visibleHistories.value.add(playerId);
  }
};

const openEditModal = (player) => {
  editingPlayer.value = { ...player }; // Clonar para no modificar el original directamente
  showEditModal.value = true;
};

const savePlayerEdit = () => {
  if (editingPlayer.value) {
    playerStore.editPlayer(editingPlayer.value.id, {
      name: editingPlayer.value.name,
    });
    showEditModal.value = false;
    editingPlayer.value = null;
  }
};

const toggleNotes = (playerId) => {
  if (visibleNotes.value.has(playerId)) {
    visibleNotes.value.delete(playerId);
  } else {
    visibleNotes.value.add(playerId);
  }
};

const saveNotes = (player) => {
  playerStore.editPlayer(player.id, { notes: player.notes });
};
</script>

<style scoped>
/* Clase para bloquear el scroll del body cuando el modal está abierto */
:global(body.modal-open) {
  overflow: hidden;
}

/* Clase para asegurar que SweetAlert2 esté por encima del modal */
:global(.swal2-container.high-z-index) {
  z-index: 1300 !important;
}

/* Estilo general del overlay y modal */
.player-manager-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100; /* Asegurarse de que esté por encima de otros elementos */
}

.edit-modal {
  z-index: 1200; /* Mayor que el principal para superponerse */
}

.player-manager-content {
  background: #2c2f33; /* Un fondo oscuro pero no negro puro */
  color: #f0f0f0;
  border-radius: 15px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #23272a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.player-manager-header h2 {
  margin: 0;
  font-size: 1.6rem;
  color: #f39c12; /* Color naranja temático */
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  background: none;
  border: none;
  color: #bdc3c7;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.player-manager-body {
  padding: 25px;
  overflow-y: auto;
  flex: 1;
}

/* Controles */
.global-controls-player,
.add-player {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
}

.add-xp-all, .add-player {
  display: flex;
  flex-grow: 1;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 12px 15px;
  background: #3a3f44;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f0f0f0;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #f39c12;
}

/* Estilo "libreta" para los cards de jugador */
.player-list {
  display: grid;
  gap: 20px;
}

.player-card {
  background: #2c2a2a; /* Fondo que simula papel oscuro o cuero */
  border: 1px solid #4a413a; /* Borde tipo costura */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
}

.player-card:before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 30px;
  border-left: 1px solid rgba(243, 156, 18, 0.2);
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.player-name {
  font-family: 'Georgia', serif;
  font-size: 1.8rem;
  color: #f0e6d2; /* Color crema para el texto */
  margin: 0;
}

.player-xp-total {
  font-size: 1.2rem;
  color: #f39c12;
}

.player-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
}

.add-xp-single {
  display: flex;
  gap: 8px;
  align-items: center;
}

.xp-input {
  width: 100px;
}

.quick-xp-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.player-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

/* Historial de XP */
.xp-history {
  margin-top: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.xp-history h4 {
  margin: 0 0 10px 0;
  color: #f39c12;
  font-size: 1rem;
}

.xp-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.xp-history li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.xp-history .timestamp {
  font-size: 0.8rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

.xp-gain {
  color: #2ecc71; /* Verde para ganancias */
}

.xp-loss {
  color: #e74c3c; /* Rojo para pérdidas */
}

.player-footer div {
  display: flex;
  gap: 10px;
}

.edit-form .form-group {
  margin-bottom: 20px;
}

.edit-form .form-control {
  width: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Estilos para la sección de notas */
.notes-section {
  margin-top: 15px;
}

.notes-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  background-color: #3a3f44;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f0f0f0;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}

.notes-textarea:focus {
  outline: none;
  border-color: #f39c12;
}
</style>
