<template>
  <div class="home-container fade-in">
    <div class="welcome-card">
      <h1 class="welcome-title">🎲 D&D Life Tracker</h1>
      <p class="welcome-subtitle">Control de vida para personajes de Dungeons & Dragons</p>
      
      <div class="loading-spinner" v-if="isLoading">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
      
      <div class="welcome-content" v-else>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">❤️</span>
            <span class="feature-text">Control de vida máxima y actual</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🛡️</span>
            <span class="feature-text">Vida temporal que se consume primero</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💚</span>
            <span class="feature-text">Sistema de curación inteligente</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚔️</span>
            <span class="feature-text">Gestión de daño con prioridad de vida temporal</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔄</span>
            <span class="feature-text">Regeneración pasiva por turno</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎲</span>
            <span class="feature-text">Control de turnos con contador</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💾</span>
            <span class="feature-text">Persistencia en localStorage</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <span class="feature-text">Panel del DM para gestionar múltiples personajes</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <span class="feature-text">Vista general del estado de todos los personajes</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="startNewCharacter" class="btn btn-primary">
            <span class="btn-icon">✨</span>
            <span class="btn-text">Crear Nuevo Personaje</span>
          </button>
          
          <button v-if="hasExistingCharacter" @click="loadExistingCharacter" class="btn btn-secondary">
            <span class="btn-icon">📖</span>
            <span class="btn-text">Cargar Personaje Existente</span>
          </button>
          
          <button @click="goToDM" class="btn btn-success">
            <span class="btn-icon">🛡️</span>
            <span class="btn-text">Panel del DM</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/useCharacterStore'

const router = useRouter()
const characterStore = useCharacterStore()

const isLoading = ref(true)
const hasExistingCharacter = ref(false)

onMounted(async () => {
  // Cargar datos del localStorage
  characterStore.loadFromLocalStorage()
  
  // Verificar si hay un personaje configurado
  hasExistingCharacter.value = characterStore.character.isConfigured
  
  // Simular un pequeño delay para mostrar el spinner
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

const startNewCharacter = () => {
  router.push('/config')
}

const loadExistingCharacter = () => {
  router.push('/character')
}

const goToDM = () => {
  router.push('/dm')
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 700px;
  width: 100%;
  text-align: center;
}

.welcome-title {
  color: #f39c12;
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.welcome-subtitle {
  color: #ecf0f1;
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #f39c12;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #ecf0f1;
  font-size: 1.1rem;
}

.welcome-content {
  animation: fadeIn 0.5s ease-in;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  color: #ecf0f1;
  font-size: 1rem;
  text-align: left;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 250px;
  justify-content: center;
  min-height: 56px; /* Better touch target */
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-text {
  font-size: 1rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  .home-container {
    padding: 15px;
    min-height: calc(100vh - 65px);
  }
  
  .welcome-card {
    padding: 25px 20px;
    margin: 10px;
    border-radius: 15px;
  }
  
  .welcome-title {
    font-size: 2.2rem;
    margin-bottom: 12px;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
    margin-bottom: 25px;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .feature-item {
    padding: 18px 15px;
    gap: 12px;
  }
  
  .feature-icon {
    font-size: 1.3rem;
    min-width: 24px;
  }
  
  .feature-text {
    font-size: 0.95rem;
  }
  
  .action-buttons {
    gap: 15px;
  }
  
  .btn {
    min-width: 100%;
    padding: 18px 20px;
    min-height: 60px;
    font-size: 1.1rem;
  }
  
  .btn-icon {
    font-size: 1.4rem;
  }
  
  .btn-text {
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 10px;
  }
  
  .welcome-card {
    padding: 20px 15px;
    margin: 5px;
  }
  
  .welcome-title {
    font-size: 1.9rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .feature-item {
    padding: 16px 12px;
  }
  
  .btn {
    padding: 20px 16px;
    min-height: 65px;
    font-size: 1.15rem;
  }
  
  .btn-icon {
    font-size: 1.5rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .btn:hover {
    transform: none;
  }
  
  .feature-item:hover {
    transform: none;
  }
  
  .btn:active {
    transform: scale(0.98);
  }
  
  .feature-item:active {
    background: rgba(255, 255, 255, 0.15);
  }
}
</style>
