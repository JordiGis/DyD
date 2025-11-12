<template>
  <div class="draggable-list-overlay" @click.self="handleOverlayClick">
    <div class="draggable-list" :style="desktopStyle">
      <div class="header" @mousedown="startDrag">
        <span>🎯 Orden de Iniciativa</span>
        <button @click="toggleMinimize" class="minimize-btn">{{ minimized ? '📋' : '➖' }}</button>
        <button @click="handleClose" class="close-btn">✖️</button>
      </div>
      <div v-if="!minimized" class="content">
      <!-- Controles de turno -->
      <div class="turn-controls">
        <button @click="nextTurn" class="btn-next-turn" :disabled="initiativeOrder.length === 0">
          <i class="bi bi-arrow-right-circle-fill"></i> Siguiente Turno
        </button>
        <button @click="resetTurn" class="btn-reset-turn" :disabled="initiativeOrder.length === 0">
          <i class="bi bi-arrow-counterclockwise"></i> Resetear
        </button>
      </div>

      <!-- Lista de iniciativa -->
      <ul v-if="initiativeOrder.length > 0" class="initiative-list">
        <li
          v-for="(item, index) in initiativeOrder"
          :key="item.id"
          :class="[item.type, { active: currentTurnIndex === index, dragging: draggedIndex === index }]"
          :draggable="isMobile ? false : true"
          @dragstart="startItemDrag(index)"
          @dragover.prevent
          @drop="dropItem(index)"
          @touchstart="isMobile ? null : startItemDragTouch(index, $event)"
          @touchmove="isMobile ? null : moveItemTouch($event)"
          @touchend="isMobile ? null : endItemDragTouch"
          @click="selectTurn(index)"
        >
          <div class="turn-indicator">
            <span class="turn-number">{{ index + 1 }}</span>
          </div>
          <i
            class="bi item-icon"
            :class="
              item.type === 'player' ? 'bi-person-fill' : 'bi-shield-fill'
            "
          ></i>
          <span class="item-name">{{ item.name }}</span>
          
          <!-- Botones de reordenamiento para móvil -->
          <div v-if="isMobile && initiativeOrder.length > 1" class="mobile-reorder-buttons">
            <button 
              @click.stop="moveItemUp(index)" 
              class="btn-reorder btn-up" 
              :disabled="index === 0"
              title="Mover arriba"
            >
              <i class="bi bi-chevron-up"></i>
            </button>
            <button 
              @click.stop="moveItemDown(index)" 
              class="btn-reorder btn-down" 
              :disabled="index === initiativeOrder.length - 1"
              title="Mover abajo"
            >
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
          
          <button @click.stop="removeFromInitiative(index)" class="btn-remove" title="Quitar de iniciativa">
            <i class="bi bi-x"></i>
          </button>
        </li>
      </ul>
      <div v-else class="empty-list">
        <p>No hay personajes en la iniciativa</p>
        <small>Añade jugadores desde el gestor o personajes manualmente</small>
      </div>

      <!-- Añadir personajes manualmente -->
      <div class="add-character-section">
        <input
          v-model="newCharacterName"
          @keyup.enter="addCustomCharacter"
          type="text"
          placeholder="Añadir personaje/enemigo..."
          class="input-add-character"
        />
        <button @click="addCustomCharacter" :disabled="!newCharacterName.trim()" class="btn-add-character">
          <i class="bi bi-plus-circle-fill"></i>
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import { v4 as uuidv4 } from "uuid";

const props = defineProps({
  characters: {
    type: Array,
    required: true,
  },
  players: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close']);

const position = reactive({ x: 100, y: 100 });
const minimized = ref(false);
const initiativeOrder = ref([]);
const currentTurnIndex = ref(null);
const newCharacterName = ref("");
const draggedIndex = ref(null);
const isMobile = ref(window.innerWidth <= 768);
let dragging = false;
let dragStartIndex = null;
let touchDragData = null;

// Computed para aplicar posición solo en desktop
const desktopStyle = computed(() => {
  // En móvil, el estilo se maneja con CSS
  if (window.innerWidth <= 768) {
    return {};
  }
  return {
    top: position.y + 'px',
    left: position.x + 'px'
  };
});

// Métodos para cerrar
const handleClose = () => {
  emit('close');
};

const handleOverlayClick = () => {
  // Solo cerrar en móvil cuando se hace click en el overlay
  if (window.innerWidth <= 768) {
    emit('close');
  }
};

// Combinar personajes y jugadores en una sola lista
const combinedList = computed(() => {
  const chara = props.characters.map((c) => ({ ...c, type: "character" }));
  const play = props.players.map((p) => ({ ...p, type: "player" }));
  return [...play, ...chara]; // Jugadores primero
});

// Sincronizar la lista de iniciativa con la lista combinada
watch(
  combinedList,
  (newList) => {
    // Mantener el orden existente si es posible, añadiendo nuevos y quitando los que ya no están
    const newOrder = [];
    const newListIds = new Set(newList.map((item) => item.id));

    // Añadir primero los que ya estaban en el orden
    initiativeOrder.value.forEach((item) => {
      if (newListIds.has(item.id)) {
        newOrder.push(item);
      }
    });

    // Añadir los nuevos que no estaban en la lista
    const currentOrderIds = new Set(newOrder.map((item) => item.id));
    newList.forEach((item) => {
      if (!currentOrderIds.has(item.id)) {
        newOrder.push(item);
      }
    });

    initiativeOrder.value = newOrder;
  },
  { immediate: true, deep: true }
);

// Actualizar isMobile en resize
onMounted(() => {
  const updateMobile = () => {
    isMobile.value = window.innerWidth <= 768;
  };
  window.addEventListener('resize', updateMobile);
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateMobile);
  });
});

const startDrag = (event) => {
  // Solo permitir drag en desktop
  if (window.innerWidth <= 768) return;
  
  dragging = true;
  const startX = event.clientX - position.x;
  const startY = event.clientY - position.y;

  const move = (moveEvent) => {
    if (dragging) {
      position.x = moveEvent.clientX - startX;
      position.y = moveEvent.clientY - startY;
    }
  };

  const stop = () => {
    dragging = false;
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", stop);
  };

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);
};

const toggleMinimize = () => {
  minimized.value = !minimized.value;
};

const startItemDrag = (index) => {
  dragStartIndex = index;
};

const dropItem = (dropIndex) => {
  if (dragStartIndex === null || dragStartIndex === dropIndex) return;
  const itemToMove = initiativeOrder.value.splice(dragStartIndex, 1)[0];
  initiativeOrder.value.splice(dropIndex, 0, itemToMove);
  
  // Ajustar el índice del turno actual si es necesario
  if (currentTurnIndex.value !== null) {
    if (dragStartIndex === currentTurnIndex.value) {
      currentTurnIndex.value = dropIndex;
    } else if (dragStartIndex < currentTurnIndex.value && dropIndex >= currentTurnIndex.value) {
      currentTurnIndex.value--;
    } else if (dragStartIndex > currentTurnIndex.value && dropIndex <= currentTurnIndex.value) {
      currentTurnIndex.value++;
    }
  }
  
  dragStartIndex = null;
  draggedIndex.value = null;
};

// Touch events para drag and drop de items
const startItemDragTouch = (index, event) => {
  // No iniciar drag si se toca un botón
  if (event.target.closest('button')) {
    return;
  }
  
  // Solo iniciar drag si se mantiene presionado por un momento
  const touch = event.touches[0];
  
  touchDragData = {
    startIndex: index,
    startY: touch.clientY,
    currentIndex: index,
    moving: false
  };
  
  draggedIndex.value = index;
  
  // Prevenir scroll mientras se arrastra
  event.preventDefault();
};

const moveItemTouch = (event) => {
  if (!touchDragData) return;
  
  const touch = event.touches[0];
  const deltaY = touch.clientY - touchDragData.startY;
  
  // Solo activar movimiento si se ha movido más de 10px
  if (Math.abs(deltaY) > 10) {
    touchDragData.moving = true;
  }
  
  if (!touchDragData.moving) return;
  
  // Encontrar el elemento sobre el que estamos
  const elements = document.querySelectorAll('.initiative-list li');
  let targetIndex = touchDragData.startIndex;
  
  elements.forEach((el, idx) => {
    const rect = el.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    
    if (touch.clientY > rect.top && touch.clientY < rect.bottom) {
      targetIndex = idx;
    }
  });
  
  // Si cambió de posición, reordenar
  if (targetIndex !== touchDragData.currentIndex) {
    const item = initiativeOrder.value.splice(touchDragData.currentIndex, 1)[0];
    initiativeOrder.value.splice(targetIndex, 0, item);
    
    // Actualizar el turno actual si es necesario
    if (currentTurnIndex.value !== null) {
      if (touchDragData.currentIndex === currentTurnIndex.value) {
        currentTurnIndex.value = targetIndex;
      } else if (touchDragData.currentIndex < currentTurnIndex.value && targetIndex >= currentTurnIndex.value) {
        currentTurnIndex.value--;
      } else if (touchDragData.currentIndex > currentTurnIndex.value && targetIndex <= currentTurnIndex.value) {
        currentTurnIndex.value++;
      }
    }
    
    touchDragData.currentIndex = targetIndex;
  }
  
  event.preventDefault();
};

const endItemDragTouch = () => {
  touchDragData = null;
  draggedIndex.value = null;
};

// Funciones para reordenar en móvil
const moveItemUp = (index) => {
  if (index === 0) return;
  
  const item = initiativeOrder.value.splice(index, 1)[0];
  initiativeOrder.value.splice(index - 1, 0, item);
  
  // Ajustar el índice del turno actual
  if (currentTurnIndex.value !== null) {
    if (currentTurnIndex.value === index) {
      currentTurnIndex.value = index - 1;
    } else if (currentTurnIndex.value === index - 1) {
      currentTurnIndex.value = index;
    }
  }
};

const moveItemDown = (index) => {
  if (index === initiativeOrder.value.length - 1) return;
  
  const item = initiativeOrder.value.splice(index, 1)[0];
  initiativeOrder.value.splice(index + 1, 0, item);
  
  // Ajustar el índice del turno actual
  if (currentTurnIndex.value !== null) {
    if (currentTurnIndex.value === index) {
      currentTurnIndex.value = index + 1;
    } else if (currentTurnIndex.value === index + 1) {
      currentTurnIndex.value = index;
    }
  }
};

// Seleccionar un turno manualmente haciendo clic
const selectTurn = (index) => {
  currentTurnIndex.value = index;
};

// Avanzar al siguiente turno
const nextTurn = () => {
  if (initiativeOrder.value.length === 0) return;
  
  if (currentTurnIndex.value === null) {
    currentTurnIndex.value = 0;
  } else {
    currentTurnIndex.value = (currentTurnIndex.value + 1) % initiativeOrder.value.length;
  }
};

// Resetear turno (volver al primero)
const resetTurn = () => {
  if (initiativeOrder.value.length > 0) {
    currentTurnIndex.value = 0;
  } else {
    currentTurnIndex.value = null;
  }
};

// Añadir un personaje personalizado
const addCustomCharacter = () => {
  if (!newCharacterName.value.trim()) return;
  
  const newChar = {
    id: uuidv4(),
    name: newCharacterName.value.trim(),
    type: "custom",
  };
  
  initiativeOrder.value.push(newChar);
  newCharacterName.value = "";
};

// Quitar un personaje de la iniciativa
const removeFromInitiative = (index) => {
  initiativeOrder.value.splice(index, 1);
  
  // Ajustar el índice del turno actual
  if (currentTurnIndex.value !== null) {
    if (index === currentTurnIndex.value) {
      // Si eliminamos el turno actual, resetear
      if (initiativeOrder.value.length > 0) {
        currentTurnIndex.value = Math.min(currentTurnIndex.value, initiativeOrder.value.length - 1);
      } else {
        currentTurnIndex.value = null;
      }
    } else if (index < currentTurnIndex.value) {
      currentTurnIndex.value--;
    }
  }
};
</script>

<style scoped>
.draggable-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 100;
  pointer-events: none;
}

.draggable-list {
  position: fixed;
  border: 2px solid rgba(243, 156, 18, 0.4);
  background-color: rgba(26, 26, 46, 0.98);
  width: 380px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  z-index: 100;
  backdrop-filter: blur(12px);
  pointer-events: auto;
}

.header {
  padding: 16px;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.4), rgba(230, 126, 34, 0.4));
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-radius: 14px 14px 0 0;
  border-bottom: 2px solid rgba(243, 156, 18, 0.3);
}

.header span {
  color: #f39c12;
  font-weight: bold;
  font-size: 1.15rem;
  flex: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.minimize-btn,
.close-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ecf0f1;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 14px;
}

.minimize-btn:hover {
  background: rgba(243, 156, 18, 0.4);
  border-color: rgba(243, 156, 18, 0.6);
  transform: scale(1.05);
}

.close-btn:hover {
  background: rgba(231, 76, 60, 0.4);
  border-color: rgba(231, 76, 60, 0.6);
  transform: scale(1.05);
}

.content {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(243, 156, 18, 0.5);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(243, 156, 18, 0.7);
}

/* Controles de turno */
.turn-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.btn-next-turn,
.btn-reset-turn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-next-turn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.btn-next-turn:hover:not(:disabled) {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
}

.btn-reset-turn {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.btn-reset-turn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d35400, #ba4a00);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(230, 126, 34, 0.4);
}

.btn-next-turn:disabled,
.btn-reset-turn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Lista de iniciativa */
.initiative-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.initiative-list li {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  gap: 10px;
}

.initiative-list li:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(243, 156, 18, 0.4);
  transform: translateX(4px);
}

.initiative-list li.active {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.3));
  border-color: rgba(46, 204, 113, 0.8);
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(46, 204, 113, 0.6);
  }
}

.turn-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(243, 156, 18, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #f39c12;
  font-size: 0.9rem;
  border: 2px solid rgba(243, 156, 18, 0.5);
  flex-shrink: 0;
}

.initiative-list li.active .turn-indicator {
  background: rgba(46, 204, 113, 0.5);
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.8);
}

.item-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.item-name {
  flex-grow: 1;
  cursor: grab;
  color: #ecf0f1;
  font-size: 1rem;
  font-weight: 500;
  user-select: none;
}

.initiative-list li:active .item-name {
  cursor: grabbing;
}

.mobile-reorder-buttons {
  display: flex;
  gap: 4px;
  margin-right: 8px;
}

.btn-reorder {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(52, 152, 219, 0.3);
  border: 1px solid rgba(52, 152, 219, 0.5);
  color: #3498db;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-reorder:hover:not(:disabled) {
  background: rgba(52, 152, 219, 0.5);
  border-color: rgba(52, 152, 219, 0.8);
  transform: scale(1.1);
}

.btn-reorder:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-reorder i {
  font-size: 0.9rem;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(231, 76, 60, 0.3);
  border: 1px solid rgba(231, 76, 60, 0.5);
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: rgba(231, 76, 60, 0.5);
  border-color: rgba(231, 76, 60, 0.8);
  transform: scale(1.1);
}

/* Estilos específicos para tipos */
.initiative-list li.player {
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.4);
}

.initiative-list li.player .item-icon {
  color: #3498db;
}

.initiative-list li.player:hover {
  background: rgba(52, 152, 219, 0.3);
  border-color: rgba(52, 152, 219, 0.6);
}

.initiative-list li.character {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.4);
}

.initiative-list li.character .item-icon {
  color: #e74c3c;
}

.initiative-list li.character:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
}

.initiative-list li.custom {
  background: rgba(155, 89, 182, 0.2);
  border-color: rgba(155, 89, 182, 0.4);
}

.initiative-list li.custom .item-icon {
  color: #9b59b6;
}

.initiative-list li.custom:hover {
  background: rgba(155, 89, 182, 0.3);
  border-color: rgba(155, 89, 182, 0.6);
}

/* Añadir personaje */
.add-character-section {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-add-character {
  flex: 1;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ecf0f1;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-add-character:focus {
  border-color: rgba(243, 156, 18, 0.5);
  background: rgba(0, 0, 0, 0.4);
}

.input-add-character::placeholder {
  color: rgba(236, 240, 241, 0.5);
}

.btn-add-character {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-add-character:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #21618c);
  transform: scale(1.05);
}

.btn-add-character:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Estado vacío */
.empty-list {
  text-align: center;
  padding: 30px 20px;
  color: #7f8c8d;
}

.empty-list p {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #95a5a6;
}

.empty-list small {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Drag and drop styling */
.initiative-list li[draggable="true"] {
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.initiative-list li[draggable="true"]:active {
  cursor: grabbing;
  opacity: 0.7;
}

.initiative-list li.dragging {
  opacity: 0.5;
  transform: scale(1.05);
  z-index: 1000;
}

/* Responsive styles */
@media (max-width: 768px) {
  .draggable-list-overlay {
    background: rgba(0, 0, 0, 0.7);
    pointer-events: auto;
    z-index: 1000;
  }

  .draggable-list {
    position: fixed;
    top: 0 !important;
    left: 0 !important;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    border-radius: 0;
    border: none;
    margin: 0;
  }

  .header {
    padding: 16px 20px;
    cursor: default;
    border-radius: 0;
  }

  .header span {
    font-size: 1.1rem;
  }

  .minimize-btn {
    display: none;
  }

  .content {
    padding: 20px;
    max-height: calc(100vh - 80px);
    height: calc(100vh - 80px);
  }

  .turn-controls {
    flex-direction: column;
  }

  .btn-next-turn,
  .btn-reset-turn {
    width: 100%;
    padding: 12px;
    font-size: 0.95rem;
  }

  .initiative-list li {
    padding: 14px 12px;
    font-size: 0.95rem;
  }
  
  /* Desactivar cursor grab en móvil */
  .item-name {
    cursor: default;
  }
  
  .initiative-list li:active .item-name {
    cursor: default;
  }

  .turn-indicator {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .item-icon {
    font-size: 1.2rem;
  }

  .item-name {
    font-size: 1rem;
  }

  .btn-remove {
    width: 36px;
    height: 36px;
  }

  .add-character-section {
    flex-direction: row;
    padding-top: 16px;
  }

  .input-add-character {
    width: 100%;
    font-size: 1rem;
    padding: 12px 15px;
  }

  .btn-add-character {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 14px 16px;
  }

  .header span {
    font-size: 1rem;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .content {
    padding: 16px;
  }

  .btn-next-turn,
  .btn-reset-turn {
    padding: 10px;
    font-size: 0.9rem;
  }

  .initiative-list li {
    padding: 12px 10px;
  }

  .turn-indicator {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }

  .item-name {
    font-size: 0.95rem;
  }

  .btn-remove {
    width: 32px;
    height: 32px;
  }

  .empty-list {
    padding: 20px 10px;
  }

  .empty-list p {
    font-size: 0.9rem;
  }

  .empty-list small {
    font-size: 0.8rem;
  }

  .input-add-character {
    font-size: 0.95rem;
    padding: 10px 12px;
  }

  .btn-add-character {
    width: 46px;
    height: 46px;
  }
}
</style>
