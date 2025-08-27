<template>
  <div class="draggable-list" :style="{ top: position.y + 'px', left: position.x + 'px' }">
    <div class="header" @mousedown="startDrag">
      <span>Orden de Perosnajes</span>
      <button @click="toggleMinimize">{{ minimized ? '+' : '-' }}</button>
    </div>
    <div v-if="!minimized" class="content">
      <ul>
        <li v-for="(item, index) in items" :key="item.id">
          <input type="radio" name="selected-item" :value="item.id" v-model="selectedItem" />
          <span :draggable="true" @dragstart="startItemDrag(index)" @dragover.prevent @drop="dropItem(index)">{{ item.name }}</span>
          <button @click="deleteItem(item.id)">x</button>
        </li>
      </ul>
      <div class="add-item">
        <input type="text" v-model="newItemName" placeholder="New item name" @keyup.enter="addItem" />
        <button @click="addItem">Add</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

const position = reactive({ x: 100, y: 100 });
const minimized = ref(false);
const items = ref([]);
const selectedItem = ref(null);
const newItemName = ref('');
let dragging = false;
let dragStartIndex = null;

// LocalStorage key
const STORAGE_KEY = 'draggableListItems';

// Load items from localStorage on component mount
onMounted(() => {
  const storedItems = localStorage.getItem(STORAGE_KEY);
  if (storedItems) {
    try {
      items.value = JSON.parse(storedItems);
    } catch (error) {
      console.error('Error parsing stored items:', error);
      items.value = [];
    }
  }
});

// Save items to localStorage whenever they change
watch(items, (newItems) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
}, { deep: true });

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
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stop);
  };

  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
};

const toggleMinimize = () => {
  minimized.value = !minimized.value;
};

const startItemDrag = (index) => {
  dragStartIndex = index;
};

const dropItem = (dropIndex) => {
  if (dragStartIndex === null) return;
  const itemToMove = items.value.splice(dragStartIndex, 1)[0];
  items.value.splice(dropIndex, 0, itemToMove);
  dragStartIndex = null;
};

const deleteItem = (id) => {
  items.value = items.value.filter(item => item.id !== id);
};

const addItem = () => {
  if (newItemName.value.trim() === '') return;
  items.value.push({
    id: Date.now(),
    name: newItemName.value,
  });
  newItemName.value = '';
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

li span:active {
  cursor: grabbing;
}

li button {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  width: 25px;
  height: 25px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

li button:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.5);
  color: #fff;
}

.add-item {
  margin-top: 15px;
  display: flex;
  gap: 8px;
}

.add-item input {
  flex-grow: 1;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-item input:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.2);
}

.add-item input::placeholder {
  color: #7f8c8d;
}

.add-item button {
  background: rgba(46, 204, 113, 0.2);
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #2ecc71;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-item button:hover {
  background: rgba(46, 204, 113, 0.3);
  border-color: rgba(46, 204, 113, 0.5);
  color: #fff;
}

.add-item button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Drag and drop styling */
li[draggable=true] {
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
