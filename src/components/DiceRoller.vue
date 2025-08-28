<template>
  <div class="dice-roller" :style="{ top: position.y + 'px', left: position.x + 'px' }">
    <div class="header" @mousedown="startDrag">
      <span><i class="bi bi-dice-6"></i> Lanzar Dados</span>
      <div class="header-actions">
        <button @click="toggleMinimize" class="minimize-btn">{{ minimized ? '+' : '-' }}</button>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>
    </div>
    
    <div v-if="!minimized" class="content">
      <!-- Configuración de dados -->
      <div class="dice-config">
        <div class="config-row">
          <label>Cantidad:</label>
          <input 
            type="number" 
            v-model="diceCount"
            class="dice-count-input"
          >
        </div>
        
        <div class="config-row">
          <label>Tipo:</label>
          <select v-model="diceType">
            <option value="4">d4</option>
            <option value="6">d6</option>
            <option value="8">d8</option>
            <option value="10">d10</option>
            <option value="12">d12</option>
            <option value="20">d20</option>
            <option value="100">d100</option>
          </select>
        </div>
        
        <div class="config-row">
          <label>Modificador:</label>
          <input 
            v-model.number="modifier" 
            type="number" 
            class="modifier-input"
            placeholder="+0"
          />
        </div>
      </div>
      
      <!-- Botón de lanzar -->
      <button @click="rollDice" class="roll-button" :disabled="isRolling">
        <i class="bi bi-dice-1" v-if="!isRolling"></i>
        <i class="bi bi-arrow-clockwise rotating" v-else></i>
        {{ isRolling ? 'Lanzando...' : 'Lanzar Dados' }}
      </button>
      
      <!-- Resultado actual -->
      <div v-if="lastRoll" class="result-section">
        <div class="current-result">
          <div class="result-formula">
            {{ diceCount }}d{{ diceType }}{{ modifier > 0 ? '+' + modifier : modifier < 0 ? modifier : '' }}
          </div>
          <div class="result-total">{{ lastRoll.total }}</div>
        </div>
        
        <div class="dice-breakdown">
          <div class="dice-values">
            <span 
              v-for="(value, index) in lastRoll.rolls" 
              :key="index" 
              class="dice-value"
              :class="getDiceClass(value)"
            >
              {{ value }}
            </span>
          </div>
          <div v-if="modifier !== 0" class="modifier-display">
            {{ modifier > 0 ? '+' : '' }}{{ modifier }}
          </div>
        </div>
      </div>
      
      <!-- Historial de tiradas -->
      <div class="history-section">
        <div class="history-header">
          <span>Historial</span>
          <button @click="clearHistory" class="clear-btn">Limpiar</button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="roll in rollHistory.slice().reverse()" 
            :key="roll.id" 
            class="history-item"
          >
            <div class="history-formula">{{ roll.formula }}</div>
            <div class="history-result">{{ roll.total }}</div>
            <div class="history-time">{{ roll.time }}</div>
          </div>
          
          <div v-if="rollHistory.length === 0" class="no-history">
            Sin tiradas aún
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

// Props
const props = defineProps({
  characters: {
    type: Array,
    default: () => []
  }
});

defineEmits(['close']);

const position = reactive({ x: 200, y: 150 });
const minimized = ref(false);
const diceCount = ref(1);
const diceType = ref(20);
const modifier = ref(0);
const lastRoll = ref(null);
const rollHistory = ref([]);
const isRolling = ref(false);

let dragging = false;
const STORAGE_KEY = 'diceRollerHistory';

// Cargar historial desde localStorage
onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      rollHistory.value = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading dice history:', error);
      rollHistory.value = [];
    }
  }
  
  // Posición inicial aleatoria para que no se superponga
  position.x = Math.random() * 300 + 200;
  position.y = Math.random() * 200 + 100;
});

// Guardar historial cuando cambie
watch(rollHistory, (newHistory) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}, { deep: true });

const startDrag = (event) => {
  dragging = true;
  const startX = event.clientX - position.x;
  const startY = event.clientY - position.y;

  const move = (moveEvent) => {
    if (dragging) {
      position.x = Math.max(0, Math.min(window.innerWidth - 320, moveEvent.clientX - startX));
      position.y = Math.max(0, Math.min(window.innerHeight - 100, moveEvent.clientY - startY));
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

const rollSingleDice = (sides) => {
  return Math.floor(Math.random() * sides) + 1;
};

const rollDice = async () => {
  isRolling.value = true;
  
  // Simular animación de lanzamiento
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const rolls = [];
  for (let i = 0; i < diceCount.value; i++) {
    rolls.push(rollSingleDice(diceType.value));
  }
  
  const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = rollSum + modifier.value;
  
  const roll = {
    id: Date.now(),
    rolls: rolls,
    modifier: modifier.value,
    total: total,
    formula: `${diceCount.value}d${diceType.value}${modifier.value > 0 ? '+' + modifier.value : modifier.value < 0 ? modifier.value : ''}`,
    time: new Date().toLocaleTimeString()
  };
  
  lastRoll.value = roll;
  rollHistory.value.push(roll);
  
  // Mantener solo las últimas 50 tiradas
  if (rollHistory.value.length > 50) {
    rollHistory.value = rollHistory.value.slice(-50);
  }
  
  isRolling.value = false;
};

const getDiceClass = (value) => {
  if (diceType.value === 20) {
    if (value === 20) return 'crit-success';
    if (value === 1) return 'crit-fail';
  }
  
  const percentage = value / diceType.value;
  if (percentage >= 0.8) return 'high-roll';
  if (percentage <= 0.2) return 'low-roll';
  return 'normal-roll';
};

const clearHistory = () => {
  if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
    rollHistory.value = [];
    lastRoll.value = null;
  }
};
</script>

<style scoped>
.dice-roller {
  position: fixed;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(26, 26, 46, 0.95);
  width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  user-select: none;
}

.header {
  padding: 15px;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(142, 68, 173, 0.3));
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header span {
  color: #9b59b6;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.minimize-btn, .close-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ecf0f1;
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

.minimize-btn:hover, .close-btn:hover {
  background: rgba(155, 89, 182, 0.3);
  border-color: rgba(155, 89, 182, 0.5);
}

.content {
  padding: 20px;
  max-height: 500px;
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
  background: rgba(155, 89, 182, 0.4);
  border-radius: 3px;
}

.dice-config {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.config-row:last-child {
  margin-bottom: 0;
}

.config-row label {
  color: #bdc3c7;
  font-size: 0.9rem;
  font-weight: 500;
}

.config-row select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ecf0f1;
  padding: 8px 12px;
  min-width: 80px;
}

.modifier-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ecf0f1;
  padding: 8px 12px;
  width: 80px;
  text-align: center;
}

.dice-count-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ecf0f1;
  padding: 8px 12px;
  width: 80px;
  text-align: center;
}

.modifier-input:focus, .config-row select:focus, .dice-count-input:focus {
  outline: none;
  border-color: #9b59b6;
  box-shadow: 0 0 0 2px rgba(155, 89, 182, 0.2);
}

.roll-button {
  width: 100%;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.roll-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.roll-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.result-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.current-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-formula {
  color: #bdc3c7;
  font-size: 0.9rem;
  font-weight: 500;
}

.result-total {
  color: #f39c12;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dice-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dice-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.dice-value {
  background: rgba(52, 73, 94, 0.6);
  color: #ecf0f1;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 35px;
  text-align: center;
}

.dice-value.crit-success {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.dice-value.crit-fail {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.dice-value.high-roll {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.dice-value.low-roll {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.modifier-display {
  text-align: center;
  color: #f39c12;
  font-weight: bold;
  font-size: 1.1rem;
}

.history-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.history-header span {
  color: #ecf0f1;
  font-weight: bold;
  font-size: 1rem;
}

.clear-btn {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(231, 76, 60, 0.3);
  color: white;
}

.history-list {
  max-height: 150px;
  overflow-y: auto;
}

.history-list::-webkit-scrollbar {
  width: 4px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(155, 89, 182, 0.3);
  border-radius: 2px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  margin-bottom: 5px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.history-formula {
  color: #bdc3c7;
  font-size: 0.8rem;
  flex: 1;
}

.history-result {
  color: #f39c12;
  font-weight: bold;
  margin: 0 10px;
}

.history-time {
  color: #7f8c8d;
  font-size: 0.7rem;
  min-width: 60px;
  text-align: right;
}

.no-history {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 20px 10px;
}
</style>