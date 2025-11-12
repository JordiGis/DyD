<template>
  <div class="draggable-list" :style="{ top: position.y + 'px', left: position.x + 'px' }">
    <div class="header" @mousedown="startDrag">
      <span>Orden de Perosnajes</span>
      <button @click="toggleMinimize">{{ minimized ? '+' : '-' }}</button>
    </div>
    <div v-if="!minimized" class="content">
      <ul v-if="initiativeOrder.length > 0">
        <li
          v-for="(item, index) in initiativeOrder"
          :key="item.id"
          :class="item.type"
          :draggable="true"
          @dragstart="startItemDrag(index)"
          @dragover.prevent
          @drop="dropItem(index)"
        >
          <i
            class="bi"
            :class="
              item.type === 'player' ? 'bi-person-fill' : 'bi-shield-fill'
            "
          ></i>
          <span class="item-name">{{ item.name }}</span>
          <input
            type="radio"
            name="selected-item"
            :value="item.id"
            v-model="selectedItem"
            class="turn-selector"
          />
        </li>
      </ul>
      <div v-else class="empty-list">
        <p>No hay personajes ni jugadores</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

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

const position = reactive({ x: 100, y: 100 });
const minimized = ref(false);
const initiativeOrder = ref([]);
const selectedItem = ref(null);
let dragging = false;
let dragStartIndex = null;

// Combinar personajes y jugadores en una sola lista
const combinedList = computed(() => {
  const chara = props.characters.map((c) => ({ ...c, type: "character" }));
  const play = props.players.map((p) => ({ ...p, type: "player" }));
  return [...chara, ...play];
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

const startDrag = (event) => {
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
  dragStartIndex = null;
};
</script>

<style scoped>
.draggable-list {
  position: fixed;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(26, 26, 46, 0.95);
  width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header {
  padding: 15px;
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.3), rgba(230, 126, 34, 0.3));
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header span {
  color: #f39c12;
  font-weight: bold;
  font-size: 1.1rem;
}

.header button {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ecf0f1;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.header button:hover {
  background: rgba(243, 156, 18, 0.3);
  border-color: rgba(243, 156, 18, 0.5);
}

.content {
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(243, 156, 18, 0.4);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(243, 156, 18, 0.6);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

li:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(243, 156, 18, 0.3);
  transform: translateX(2px);
}

li input[type="radio"] {
  margin-right: 12px;
  accent-color: #f39c12;
  cursor: pointer;
}

li span {
  flex-grow: 1;
  cursor: grab;
  color: #ecf0f1;
  font-size: 0.95rem;
  user-select: none;
}

li .item-name {
  flex-grow: 1;
  cursor: grab;
  color: #ecf0f1;
  font-size: 0.95rem;
  user-select: none;
}

li .item-name:active {
  cursor: grabbing;
}

/* Estilos específicos para jugadores y personajes */
li.player {
  background: rgba(52, 152, 219, 0.15);
  border-color: rgba(52, 152, 219, 0.3);
}

li.player:hover {
  background: rgba(52, 152, 219, 0.25);
  border-color: rgba(52, 152, 219, 0.5);
}

li.character {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.3);
}

li.character:hover {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.5);
}

.empty-list {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
}

/* Drag and drop styling */
li[draggable="true"] {
  cursor: grab;
}

li[draggable=true]:active {
  cursor: grabbing;
}

/* Minimized state */
.draggable-list.minimized .content {
  display: none;
}

.draggable-list.minimized {
  width: auto;
  min-width: 200px;
}

.draggable-list.minimized .header {
  border-radius: 12px;
}
</style>
