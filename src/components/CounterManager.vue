<template>
  <div>
    <h2 class="text-lg font-bold mb-2">Contadores</h2>
    <div class="counter-grid">
      <template v-for="counter in counters" :key="counter.id">
        <div class="counter-card">
          <div class="counter-card-header">
            <span class="counter-name">{{ counter.name }}</span>
            <div>
              <button @click="openEditModal(counter)" class="counter-edit" title="Editar contador"><span aria-label="Editar">✏️</span></button>
              <button @click="removeCounter(counter.id)" class="counter-remove" title="Eliminar contador"><span aria-label="Eliminar">🗑️</span></button>
            </div>
          </div>
          <div class="counter-btns">
            <button
              v-for="btn in counter.buttons"
              :key="btn.label"
              @click="updateCounterValue(counter.id, btn.increment)"
              class="counter-action-btn"
            >
              {{ btn.label }}
            </button>
            <button @click="setCounterToMax(counter.id)" class="counter-action-btn counter-max-btn">Máx</button>
          </div>
          <div class="counter-values">
            <span>Valor: <b>{{ counter.value }}</b> <span class="counter-minmax">(min: {{ counter.min }}, máx: {{ counter.max }})</span></span>
          </div>
        </div>
      </template>
      <!-- Botón para abrir el modal, ahora dentro del grid -->
      <div class="counter-card counter-add-card">
        <button @click="showModal = true" class="counter-add-btn" title="Agregar contador">
          <span class="counter-fab-plus">＋</span>
          <span style="display:block;font-size:1rem;margin-top:0.3rem;">Nuevo</span>
        </button>
      </div>
    </div>
    <!-- Modal estilo pop-up -->
    <div v-if="showModal" class="counter-modal-overlay" @click.self="closeModal">
      <div class="counter-modal">
        <button @click="closeModal" class="counter-modal-close">✕</button>
        <form @submit.prevent="isEditing ? saveEditCounter() : addNewCounter()">
          <h3 class="counter-modal-title">{{ isEditing ? 'Editar contador' : 'Nuevo contador' }}</h3>
          <label class="counter-modal-label">
            Nombre
            <input v-model="newCounter.name" placeholder="Ej: Furias" class="counter-modal-input" required />
          </label>
          <label class="counter-modal-label">
            Valor inicial
            <input v-model.number="newCounter.initial" type="number" placeholder="Ej: 3" class="counter-modal-input" required />
          </label>
          <label class="counter-modal-label">
            Valor mínimo
            <input v-model.number="newCounter.min" type="number" placeholder="Ej: 0" class="counter-modal-input" required />
          </label>
          <label class="counter-modal-label">
            Valor máximo
            <input v-model.number="newCounter.max" type="number" placeholder="Ej: 5" class="counter-modal-input" required />
          </label>
          <label class="counter-modal-label">
            Recarga por descanso corto
            <input v-model.number="newCounter.shortRest" type="number" placeholder="Ej: 0" class="counter-modal-input" />
          </label>
          <label class="counter-modal-label">
            Recarga por descanso largo
            <input v-model.number="newCounter.longRest" type="number" placeholder="Ej: 0" class="counter-modal-input" />
          </label>
          <button type="submit" class="counter-modal-btn">{{ isEditing ? 'Guardar cambios' : 'Agregar' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Grid de 3 columnas para los contadores */
.counter-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 500px) {
  .counter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 900px) {
  .counter-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tarjeta para agregar contador */
div.counter-add-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
  min-height: 80px;
  padding: 0;
  border: 2.5px dashed #d4af37;
}

button.counter-add-btn{
    padding: 0px;
}

.counter-add-btn {
  background: none;
  border: none;
  color: #d4af37;
  font-size: 2.2rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: color 0.2s;
}
.counter-fab-plus {
  font-size: 2.2rem;
  line-height: 1;
}
@media (max-width: 500px) {
  .counter-add-btn {
    font-size: 1.3rem;
    padding: 0.3rem 0.2rem;
  }
  .counter-fab-plus {
    font-size: 1.3rem;
  }
}
.counter-card {
  background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
  border-radius: 12px;
  border: 2px solid #d4af37;
  box-shadow: 0 4px 18px rgba(212,175,55,0.08), 0 1.5px 0 #d4af37;
  padding: 1.1rem 1rem 1rem 1rem;
  color: #f7e7b3;
  transition: box-shadow 0.2s;
  min-height: 170px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.counter-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}
.counter-name {
  font-weight: 700;
  color: #d4af37;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}
.counter-edit, .counter-remove {
  background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  border: 2px solid #d4af37;
  color: #d4af37;
  font-size: 1.2rem;
  border-radius: 6px;
  margin-left: 0.3rem;
  padding: 0.18rem 0.5rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
  box-shadow: 0 1px 4px rgba(212,175,55,0.13);
}
.counter-edit:hover {
  background: #f7d774;
  color: #1a0f0a;
  border-color: #f7d774;
}
.counter-remove:hover {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}
.counter-btns {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.counter-action-btn {
  background: #d4af37;
  color: #1a0f0a;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 1.1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(212,175,55,0.13);
  transition: background 0.2s;
}
.counter-action-btn:hover {
  background: #f7d774;
}
.counter-max-btn {
  background: #2980b9;
  color: #fff;
}
.counter-max-btn:hover {
  background: #206090;
}
.counter-values {
  color: #f7e7b3;
  font-size: 1rem;
}
.counter-minmax {
  color: #b8941f;
  font-size: 0.95em;
}
.counter-modal-label {
  display: block;
  color: #d4af37;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-family: 'Cinzel', serif;
}
.counter-modal-label input {
  margin-top: 0.2rem;
}
.counter-fab-plus {
  font-size: 2.2rem;
  line-height: 1;
}
.counter-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30, 20, 10, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.counter-modal {
  background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  border: 2.5px solid #d4af37;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.13);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  width: 100%;
  max-width: 350px;
  position: relative;
  animation: counter-modal-in 0.18s cubic-bezier(.4,1.3,.6,1) both;
  font-family: 'Cinzel', serif;
}
@keyframes counter-modal-in {
  0% { transform: scale(0.85) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.counter-modal-close {
  position: absolute;
  top: 10px;
  right: 14px;
  background: none;
  border: none;
  color: #d4af37;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
  text-shadow: 0 2px 8px #000a;
}
.counter-modal-close:hover {
  color: #e74c3c;
  text-shadow: 0 2px 8px #d4af37cc;
}
.counter-modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #d4af37;
  text-align: center;
  text-shadow: 2px 2px 4px #000a;
  font-family: 'Cinzel', serif;
}
.counter-modal-input {
  display: block;
  width: 100%;
  margin-bottom: 0.9rem;
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #d4af37;
  border-radius: 7px;
  font-size: 1.05rem;
  background: #1a0f0a;
  color: #fff;
  outline: none;
  transition: border 0.2s;
  font-family: 'Cinzel', serif;
}
.counter-modal-input:focus {
  border-color: #f7d774;
}
.counter-modal-btn {
  width: 100%;
  background: linear-gradient(90deg, #d4af37 0%, #b8941f 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 7px;
  padding: 0.8rem 0;
  font-size: 1.08rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.2rem;
  box-shadow: 0 2px 8px rgba(212,175,55,0.13);
  transition: background 0.2s;
  font-family: 'Cinzel', serif;
}
.counter-modal-btn:hover {
  background: linear-gradient(90deg, #f7d774 0%, #d4af37 100%);
}
</style>

<script setup>
import { ref } from 'vue';
import { useCounterStore } from '../stores/useCounterStore';

const store = useCounterStore();
import { toRef } from 'vue';
const counters = toRef(store, 'counters');
const { addCounter, updateCounterValue, setCounterToMax, removeCounter } = store;

const newCounter = ref({
  name: '',
  initial: 0,
  min: 0,
  max: 10,
  shortRest: 0,
  longRest: 0,
});
const showModal = ref(false);

function addNewCounter() {
  addCounter({
    name: newCounter.value.name,
    initial: newCounter.value.initial,
    min: newCounter.value.min,
    max: newCounter.value.max,
    shortRest: newCounter.value.shortRest,
    longRest: newCounter.value.longRest,
  });
  newCounter.value = { name: '', initial: 0, min: 0, max: 10, shortRest: 0, longRest: 0 };
  showModal.value = false;
}

// --- Edición de contadores ---
const isEditing = ref(false);
let editingId = null;

function openEditModal(counter) {
  isEditing.value = true;
  editingId = counter.id;
  newCounter.value = {
    name: counter.name,
    initial: counter.value, // Para edición, el valor actual
    min: counter.min,
    max: counter.max,
    shortRest: counter.shortRest,
    longRest: counter.longRest,
  };
  showModal.value = true;
}

function saveEditCounter() {
  const idx = counters.value.findIndex(c => c.id === editingId);
  if (idx !== -1) {
    counters.value[idx].name = newCounter.value.name;
    counters.value[idx].min = newCounter.value.min;
    counters.value[idx].max = newCounter.value.max;
    counters.value[idx].shortRest = newCounter.value.shortRest;
    counters.value[idx].longRest = newCounter.value.longRest;
    counters.value[idx].value = newCounter.value.initial;
  }
  closeModal();
}

function closeModal() {
  showModal.value = false;
  isEditing.value = false;
  editingId = null;
  newCounter.value = { name: '', initial: 0, min: 0, max: 10, shortRest: 0, longRest: 0 };
}
</script>
