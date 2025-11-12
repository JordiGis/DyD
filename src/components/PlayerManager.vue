<template>
  <div class="player-manager-overlay" @click.self="$emit('close')">
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
              @keyup.enter="addXpToAll"
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
                  @keyup.enter="addXpToPlayer(player.id)"
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
    <div v-if="showEditModal" class="player-manager-overlay edit-modal" @click.self="showEditModal = false">
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

// Definir emits
const emit = defineEmits(['close']);

const playerStore = usePlayerStore();
const { players, mostUsedXpValues } = storeToRefs(playerStore);

const newPlayerName = ref("");
const xpToAll = ref(null);
const playerXpInputs = ref({});
const visibleHistories = ref(new Set());
const visibleNotes = ref(new Set()); // Para controlar la visibilidad de las notas
const showEditModal = ref(false);
const editingPlayer = ref(null);

// Manejar tecla Escape
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
  playerStore.loadFromLocalStorage();
  // Bloquear el scroll del body
  document.body.classList.add("modal-open");
  // Inicializar los inputs de XP para cada jugador
  players.value.forEach((p) => {
    playerXpInputs.value[p.id] = null;
  });
  // Agregar listener para Escape
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  // Restaurar el scroll del body
  document.body.classList.remove("modal-open");
  // Remover listener para Escape
  document.removeEventListener('keydown', handleEscape);
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
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.edit-modal {
  z-index: 1200;
}

.player-manager-content {
  background: linear-gradient(145deg, #2c2f33, #23272a);
  color: #f0f0f0;
  border-radius: 20px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(243, 156, 18, 0.2);
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.player-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 4px 20px rgba(243, 156, 18, 0.3);
}

.player-manager-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 700;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  transform: scale(1.1) rotate(90deg);
}

.player-manager-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Scrollbar personalizado */
.player-manager-body::-webkit-scrollbar {
  width: 8px;
}

.player-manager-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.player-manager-body::-webkit-scrollbar-thumb {
  background: rgba(243, 156, 18, 0.4);
  border-radius: 4px;
}

.player-manager-body::-webkit-scrollbar-thumb:hover {
  background: rgba(243, 156, 18, 0.6);
}

/* Controles */
.global-controls-player,
.add-player {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(230, 126, 52, 0.15));
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(243, 156, 18, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.global-controls-player:hover,
.add-player:hover {
  border-color: rgba(243, 156, 18, 0.5);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.2);
  transform: translateY(-2px);
}

.add-xp-all, .add-player {
  display: flex;
  flex-grow: 1;
}

input[type="text"],
input[type="number"] {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #f0f0f0;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #f39c12;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
}

/* Estilo "libreta" para los cards de jugador */
.player-list {
  display: grid;
  gap: 18px;
}

.player-card {
  background: linear-gradient(145deg, #2c2a2a, #242222);
  border: 2px solid #4a413a;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
}

.player-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.5),
    0 0 0 2px rgba(243, 156, 18, 0.3);
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.player-name {
  font-family: 'Georgia', serif;
  font-size: 1.8rem;
  color: #f0e6d2;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 700;
}

.player-xp-total {
  font-size: 1.2rem;
  color: #f39c12;
  background: rgba(243, 156, 18, 0.2);
  padding: 6px 14px;
  border-radius: 10px;
  border: 2px solid rgba(243, 156, 18, 0.4);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
  white-space: nowrap;
}

.player-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.add-xp-single {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 260px;
}

.xp-input {
  width: 100%;
  min-width: 100px;
}

.quick-xp-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-end;
}

.player-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
  gap: 8px;
  flex-wrap: wrap;
}

/* Historial de XP */
.xp-history {
  margin-top: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2));
  border-radius: 10px;
  border: 1px solid rgba(243, 156, 18, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.xp-history h4 {
  margin: 0 0 10px 0;
  color: #f39c12;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.xp-history ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.xp-history ul::-webkit-scrollbar {
  width: 4px;
}

.xp-history ul::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.xp-history ul::-webkit-scrollbar-thumb {
  background: rgba(243, 156, 18, 0.3);
  border-radius: 2px;
}

.xp-history li {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.xp-history li:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: translateX(4px);
}

.xp-history .timestamp {
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-style: italic;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

.xp-gain {
  color: #2ecc71;
  font-weight: 600;
}

.xp-loss {
  color: #e74c3c;
  font-weight: 600;
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
  margin-top: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  transition: all 0.3s ease;
}

.notes-textarea:focus {
  outline: none;
  border-color: #f39c12;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
}

/* Estilos mejorados para botones */
.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #21618c);
}

.btn-success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #27ae60, #1e8449);
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b, #a93226);
}

.btn-warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: linear-gradient(135deg, #e67e22, #d35400);
}

.btn-info {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: linear-gradient(135deg, #2c3e50, #1a252f);
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7f8c8d, #566573);
}

.btn-outline-primary {
  background: transparent;
  color: #3498db;
  border: 2px solid #3498db;
  box-shadow: none;
}

.btn-outline-primary:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.btn-sm {
  padding: 8px 14px;
  font-size: 0.85rem;
}

.btn-link {
  background: none;
  color: #3498db;
  border: none;
  box-shadow: none;
  text-decoration: none;
  padding: 6px 12px;
}

.btn-link:hover {
  color: #2980b9;
  background: rgba(52, 152, 219, 0.1);
  transform: none;
}

/* Responsive mejoras */
@media (max-width: 768px) {
  .player-manager-content {
    width: 95%;
    max-width: 100%;
    border-radius: 16px;
    max-height: 95vh;
  }
  
  .player-manager-header {
    padding: 14px 18px;
  }
  
  .player-manager-header h2 {
    font-size: 1.3rem;
    gap: 8px;
  }
  
  .player-manager-header h2 i {
    font-size: 1.1rem;
  }
  
  .btn-close {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
  
  .player-manager-body {
    padding: 16px;
  }
  
  .global-controls-player,
  .add-player {
    flex-direction: column;
    padding: 14px;
    gap: 10px;
    margin-bottom: 16px;
  }
  
  .add-xp-all {
    width: 100%;
    flex-direction: column;
    gap: 10px;
  }
  
  .add-xp-all input {
    width: 100%;
  }
  
  .add-xp-all button {
    width: 100%;
  }
  
  .player-card {
    padding: 16px;
    border-radius: 10px;
  }
  
  .player-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
  }
  
  .player-name {
    font-size: 1.5rem;
  }
  
  .player-xp-total {
    font-size: 1.1rem;
    padding: 6px 12px;
    width: 100%;
    text-align: center;
  }
  
  .player-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .add-xp-single {
    min-width: 100%;
    width: 100%;
  }
  
  .xp-input {
    min-width: 0;
  }
  
  .quick-xp-buttons {
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
  
  .quick-xp-buttons button {
    flex: 1;
    min-width: 70px;
  }
  
  .player-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .player-footer > button,
  .player-footer > div {
    width: 100%;
  }
  
  .player-footer div {
    display: flex;
    gap: 8px;
  }
  
  .player-footer div button {
    flex: 1;
  }
  
  .xp-history {
    padding: 14px;
  }
  
  .notes-textarea {
    min-height: 80px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .player-manager-content {
    width: 98%;
    max-height: 98vh;
    border-radius: 12px;
  }
  
  .player-manager-header {
    padding: 12px 14px;
  }
  
  .player-manager-header h2 {
    font-size: 1.15rem;
    gap: 6px;
  }
  
  .player-manager-header h2 i {
    font-size: 1rem;
  }
  
  .btn-close {
    width: 28px;
    height: 28px;
    font-size: 0.95rem;
  }
  
  .player-manager-body {
    padding: 12px;
  }
  
  .global-controls-player,
  .add-player {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .player-card {
    padding: 14px;
    border-radius: 8px;
  }
  
  .player-name {
    font-size: 1.3rem;
  }
  
  .player-xp-total {
    font-size: 1rem;
    padding: 5px 10px;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .btn-sm {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .quick-xp-buttons button {
    min-width: 60px;
    font-size: 0.75rem;
  }
  
  input[type="text"],
  input[type="number"] {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  
  .xp-history {
    padding: 12px;
  }
  
  .xp-history h4 {
    font-size: 0.95rem;
  }
  
  .xp-history li {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
  
  .notes-textarea {
    min-height: 70px;
    padding: 10px 12px;
    font-size: 0.85rem;
  }
  
  .empty-state {
    padding: 40px 15px;
  }
  
  .empty-state p {
    font-size: 1rem;
  }
}
</style>
