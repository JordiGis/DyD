<template>
  <div>
    <h2 class="state-title">Estados</h2>
    <div class="state-grid">
      <template v-for="state in states" :key="state.id">
        <div :class="['state-card', 'dnd-theme-card', state.active ? 'active-state' : '']">
          <div class="state-card-header">
            <span class="state-name">{{ state.name }}</span>
            <div>
              <button @click="openEditModal(state)" class="state-edit" title="Editar estado"><span aria-label="Editar">✏️</span></button>
              <button @click="removeState(state.id)" class="state-remove" title="Eliminar estado"><span aria-label="Eliminar">🗑️</span></button>
            </div>
          </div>
          <div v-if="state.linkedCounterId" class="state-link">
            <span>Vinculado a: <b>{{ getCounterName(state.linkedCounterId) }}</b> (desc. {{ state.discountOnActivate }})</span>
          </div>
          <button
            @click="toggleState(state)"
            :class="['state-activate', 'dnd-theme-btn', state.active ? 'active-btn' : '']"
            :disabled="!state.active && state.linkedCounterId && !canActivateState(state)"
            :title="!state.active && state.linkedCounterId && !canActivateState(state) ? 'No quedan usos en el contador vinculado' : ''"
          >
            {{ state.active ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </template>
      <!-- Botón para abrir el modal, ahora dentro del grid pero fuera del v-for -->
      <div class="state-card state-add-card">
        <button @click="showModal = true" class="state-add-btn" title="Agregar estado">
          <span class="state-fab-plus">＋</span>
          <span style="display:block;font-size:1rem;margin-top:0.3rem;">Nuevo</span>
        </button>
      </div>
    </div>
    <div v-if="showModal" class="dnd-modal-overlay" @click.self="closeModal">
      <div class="dnd-modal">
        <button @click="closeModal" class="dnd-modal-close">✕</button>
        <form @submit.prevent="isEditing ? saveEditState() : addNewState()">
          <h3 class="dnd-modal-title">{{ isEditing ? 'Editar Estado' : 'Nuevo Estado' }}</h3>
          <label class="dnd-modal-label">
            Nombre del estado
            <input v-model="newState.name" placeholder="Ej: Furia" class="dnd-modal-input" required />
          </label>
          <label class="dnd-modal-label">
            Vincular a contador
            <select v-model="newState.linkedCounterId" class="dnd-modal-input">
              <option value="">Sin vincular</option>
              <option v-for="counter in counters" :key="counter.id" :value="counter.id">{{ counter.name }}</option>
            </select>
          </label>
          <label class="dnd-modal-label">
            Descuento al activar
            <input v-model.number="newState.discountOnActivate" type="number" placeholder="Ej: 1" class="dnd-modal-input" />
          </label>
          <button type="submit" class="dnd-modal-btn">{{ isEditing ? 'Guardar cambios' : 'Crear Estado' }}</button>
        </form>
      </div>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue';
import { useCounterStore } from '../stores/useCounterStore';

const store = useCounterStore();
const { states, addState, activateState, removeState, counters, updateCounterValue } = store;
const showModal = ref(false);
const newState = ref({
  name: '',
  linkedCounterId: '',
  discountOnActivate: 0,
});

function toggleState(state) {
  store.toggleStateActive(state.id);
}

function addNewState() {
  addState({
    name: newState.value.name,
    linkedCounterId: newState.value.linkedCounterId || null,
    discountOnActivate: newState.value.discountOnActivate,
  });
  newState.value = { name: '', linkedCounterId: '', discountOnActivate: 0 };
  showModal.value = false;
}

function canActivateState(state) {
  if (!state.linkedCounterId) return true;
  const counter = counters.find(c => c.id === state.linkedCounterId);
  if (!counter) return false;
  const cost = Math.abs(state.discountOnActivate || 1);
  return counter.value >= cost;
}

function getCounterName(id) {
  const c = counters.find(c => c.id === id);
  return c ? c.name : 'Desconocido';
}

// --- Edición de estados ---
const isEditing = ref(false);
let editingId = null;

function openEditModal(state) {
  isEditing.value = true;
  editingId = state.id;
  newState.value = {
    name: state.name,
    linkedCounterId: state.linkedCounterId || '',
    discountOnActivate: state.discountOnActivate,
  };
  showModal.value = true;
}

function saveEditState() {
  const idx = states.findIndex(s => s.id === editingId);
  if (idx !== -1) {
    states[idx].name = newState.value.name;
    states[idx].linkedCounterId = newState.value.linkedCounterId || null;
    states[idx].discountOnActivate = newState.value.discountOnActivate;
  }
  closeModal();
}

function closeModal() {
  showModal.value = false;
  isEditing.value = false;
  editingId = null;
  newState.value = { name: '', linkedCounterId: '', discountOnActivate: 0 };
}
</script>
<style scoped>
    
.dnd-theme-btn.active-btn {
  background: #e74c3c;
  color: #fff;
  border: 2px solid #d4af37;
  box-shadow: 0 0 8px #d4af37aa;
}
/* Resalta la tarjeta si el estado está activo */
.dnd-theme-card.active-state {
  box-shadow: 0 0 16px #d4af37cc, 0 4px 18px rgba(212,175,55,0.08);
  border-color: #e74c3c;
}

.dnd-modal-label {
  display: block;
  color: #d4af37;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.dnd-modal-label input,
.dnd-modal-label select {
  margin-top: 0.2rem;
}

.dnd-theme-card {
  background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
  border-radius: 12px;
  border: 2px solid #d4af37;
  box-shadow: 0 4px 18px rgba(212,175,55,0.08), 0 1.5px 0 #d4af37;
  padding: 1.1rem 1rem 1rem 1rem;
  margin-bottom: 1.1rem;
  color: #f7e7b3;
  transition: box-shadow 0.2s;
}
.dnd-theme-btn {
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
  margin-top: 0.3rem;
}
.dnd-theme-btn:hover {
  background: #f7d774;
}

/* Modal DnD estilo fantasía */
.dnd-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30, 20, 10, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.dnd-modal {
  background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  border: 2.5px solid #d4af37;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.7), 0 0 30px rgba(212,175,55,0.13);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  width: 100%;
  max-width: 350px;
  position: relative;
  animation: dnd-modal-in 0.18s cubic-bezier(.4,1.3,.6,1) both;
}
@keyframes dnd-modal-in {
  0% { transform: scale(0.85) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.dnd-modal-close {
  position: absolute;
  top: 10px;
  right: 14px;
  background: none;
  border: none;
  color: #d4af37;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.dnd-modal-close:hover {
  color: #e74c3c;
}
.dnd-modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #d4af37;
  text-align: center;
  text-shadow: 2px 2px 4px #000a;
}
.dnd-modal-input {
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
}
.dnd-modal-input:focus {
  border-color: #f7d774;
}
.dnd-modal-btn {
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
}
.dnd-modal-btn:hover {
  background: linear-gradient(90deg, #f7d774 0%, #d4af37 100%);
}
.state-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2980b9;
}
.state-card {
  background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
  border-radius: 14px;
  border: 2.5px solid #d4af37;
  box-shadow: 0 4px 18px rgba(212,175,55,0.13), 0 1.5px 0 #d4af37;
  padding: 1.1rem 1rem 1rem 1rem;
  margin-bottom: 1.1rem;
  color: #f7e7b3;
  transition: box-shadow 0.2s;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.5px;
  position: relative;
}
.state-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  border-bottom: 1.5px solid #d4af37;
  padding-bottom: 0.2rem;
}
.state-name {
  font-weight: 700;
  color: #d4af37;
  font-size: 1.15rem;
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #000a, 0 0 8px #d4af3744;
}
.state-edit, .state-remove {
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
.state-edit:hover {
  background: #f7d774;
  color: #1a0f0a;
  border-color: #f7d774;
}
.state-remove:hover {
  background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}
.state-remove {
  background: none;
  color: #e74c3c;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
  text-shadow: 0 1px 4px #000a;
}
.state-remove:hover {
  color: #c0392b;
  text-shadow: 0 2px 8px #d4af37cc;
}
.state-info {
  color: #444;
  font-size: 0.98rem;
  margin-bottom: 0.2rem;
}
.state-link {
  color: #b8941f;
  font-size: 0.98rem;
  margin-bottom: 0.2rem;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.5px;
}
.state-activate {
  background: #d4af37;
  color: #1a0f0a;
  border: none;
  border-radius: 6px;
  padding: 0.45rem 1.1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.3rem;
  transition: background 0.2s, color 0.2s;
  font-family: 'Cinzel', serif;
  box-shadow: 0 1px 4px rgba(212,175,55,0.13);
}
.state-activate:hover {
  background: #f7d774;
  color: #1a0f0a;
}
/* Grid de 3 columnas para los estados */
.state-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}
@media (min-width: 500px) {
  .state-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 900px) {
  .state-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tarjeta para agregar estado */
div.state-add-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a0f0a 0%, #2c1810 100%);
  border: 2.5px dashed #d4af37;
  color: #d4af37;
  min-height: 80px;
  padding: 0;
  box-shadow: 0 0 16px #d4af3744, 0 4px 18px rgba(212,175,55,0.08);
}
.state-add-btn {
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
.state-fab-plus {
  font-size: 2.2rem;
  line-height: 1;
}
@media (max-width: 500px) {
  .state-add-btn {
    font-size: 1.3rem;
    padding: 0.3rem 0.2rem;
  }
  .state-fab-plus {
    font-size: 1.3rem;
  }
}
.state-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.state-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(41,128,185,0.18);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  width: 100%;
  max-width: 340px;
  position: relative;
  animation: state-modal-in 0.18s cubic-bezier(.4,1.3,.6,1) both;
}
@keyframes state-modal-in {
  0% { transform: scale(0.85) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.state-modal-close {
  position: absolute;
  top: 10px;
  right: 14px;
  background: none;
  border: none;
  color: #bbb;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.state-modal-close:hover {
  color: #e74c3c;
}
.state-modal-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2980b9;
  text-align: center;
}
.state-modal-input {
  display: block;
  width: 100%;
  margin-bottom: 0.8rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
.state-modal-input:focus {
  border-color: #2980b9;
}
.state-modal-btn {
  width: 100%;
  background: #2980b9;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 0;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.state-modal-btn:hover {
  background: #206090;
}
/* Botón activo y tarjeta resaltada para estado activo */
.dnd-theme-btn.active-btn {
  background: #e74c3c;
  color: #fff;
  border: 2px solid #d4af37;
  box-shadow: 0 0 8px #d4af37aa, 0 0 16px #e74c3c44;
}
.dnd-theme-card.active-state {
  box-shadow: 0 0 24px #d4af37cc, 0 4px 18px rgba(212,175,55,0.18);
  border-color: #e74c3c;
}
</style>
