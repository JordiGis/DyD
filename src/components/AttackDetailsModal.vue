<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Detalles del Ataque</h3>
        <button @click="close" class="btn-close"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-body" v-if="attack">
        <div class="detail-section">
          <h4 class="detail-title">{{ attack.name }}</h4>
          <p v-if="attack.description" class="detail-description">{{ attack.description }}</p>
          <p v-else class="detail-description no-description">Sin descripción.</p>
        </div>

        <div class="detail-section">
          <h5 class="section-title"><i class="bi bi-dice-6-fill"></i> Tiradas de Daño</h5>
          <ul class="damage-roll-list">
            <li v-for="(roll, index) in attack.damageRolls" :key="index" class="damage-roll-item">
              <span class="dice-formula">{{ roll.dice }}</span>
              <span class="damage-type" :style="{ backgroundColor: getColorForType(roll.type).color, color: getColorForType(roll.type).textColor }">{{ roll.type }}</span>
              <span class="bonus-tag">Bonus: {{ roll.bonus >= 0 ? '+' : '' }}{{ roll.bonus }}</span>
            </li>
          </ul>
        </div>

        <div v-if="attack.rerollDice && attack.rerollDice.length > 0" class="detail-section">
          <h5 class="section-title"><i class="bi bi-arrow-repeat"></i> Dados de Reroll</h5>
          <ul class="damage-roll-list">
            <li v-for="(reroll, index) in attack.rerollDice" :key="'reroll-' + index" class="damage-roll-item reroll-item">
              <span class="dice-formula">{{ reroll.dice }}</span>
              <span class="bonus-tag">Mínimo: {{ reroll.min }}</span>
            </li>
          </ul>
        </div>

        <div class="detail-section preparable-info">
          <h5 class="section-title"><i class="bi bi-shield-check"></i> Estado</h5>
          <p>
            <strong>Preparable:</strong>
            <span :class="attack.isPreparable ? 'status-yes' : 'status-no'">
              {{ attack.isPreparable ? 'Sí' : 'No' }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { damageTypes } from '../utils/damageTypes';

const props = defineProps({
  attack: {
    type: Object,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const getColorForType = (type) => {
  const damageType = damageTypes.find(dt => dt.id === type);
  return damageType ? { color: damageType.color, textColor: damageType.textColor || '#ffffff' } : { color: '#cccccc', textColor: '#000000' };
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #2c2f33;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid #4a4a5e;
}

.modal-header {
  padding: 15px 25px;
  background: #23272a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #7289da;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  color: #ffffff;
  font-size: 1.3rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 25px;
  overflow-y: auto;
  color: #f0f0f0;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #7289da;
  margin: 0 0 10px;
}

.detail-description {
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 6px;
}

.no-description {
  font-style: italic;
  color: #99aab5;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  border-bottom: 2px solid #7289da;
  padding-bottom: 8px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.damage-roll-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.damage-roll-item {
  background: #23272a;
  border-radius: 8px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.reroll-item {
  background-color: #2a232a;
}

.dice-formula {
  font-weight: bold;
  font-size: 1.1rem;
  color: #f39c12;
}

.damage-type {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.bonus-tag {
  margin-left: auto;
  font-size: 0.9rem;
  color: #b9bbbe;
}

.preparable-info p {
  font-size: 1rem;
  margin: 0;
}

.status-yes, .status-no {
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 5px;
  margin-left: 8px;
}

.status-yes {
  color: #ffffff;
  background-color: #43b581;
}

.status-no {
  color: #ffffff;
  background-color: #f04747;
}
</style>
