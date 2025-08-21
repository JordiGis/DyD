<template>
    <div class="home-view">
        <div class="container-fluid h-100">
            <div class="row h-100">
                <!-- Panel Principal -->
                <div class="col-lg-8 d-flex align-items-center justify-content-center">
                    <div class="text-center text-white">
                        <div class="hero-content">
                            <img :src="getImageUrl('Escanor.png')" alt="Escanor" class="character-portrait mb-4">
                            <h1 class="display-2 fw-bold mb-3 golden-text">ESCANOR</h1>
                            <h3 class="mb-4 text-warning">El León del Orgullo</h3>
                            <p class="lead mb-5">
                                "¿Quién decidió eso? Solo hay una persona en este mundo que puede decidir lo que hago... y esa persona soy yo."
                            </p>
                            
                            <div class="d-grid gap-3 col-md-6 mx-auto">
                                <router-link :to="{ path: '/', query: { combat: '' } }" class="btn btn-warning btn-lg shadow-lg">
                                    <i class="bi bi-sword"></i> Entrar en Combate
                                </router-link>
                                <button class="btn btn-outline-light btn-lg" @click="showCharacterInfo = !showCharacterInfo">
                                    <i class="bi bi-info-circle"></i> Información del Personaje
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel de Información -->
                <div class="col-lg-4 info-panel">
                    <div class="card h-100 bg-dark text-white border-warning">
                        <div class="card-header bg-warning text-dark">
                            <h4 class="mb-0"><i class="bi bi-person-badge"></i> Estado del Personaje</h4>
                        </div>
                        <div class="card-body">
                            <!-- Estado Actual -->
                            <div class="mb-4">
                                <h5 class="text-warning">Estado Actual</h5>
                                <div class="d-flex align-items-center mb-2">
                                    <img :src="getImageUrl(currentStateData.image)" 
                                         alt="Estado actual" 
                                         class="state-icon me-3"
                                         width="40" height="40">
                                    <div>
                                        <strong :style="{ color: currentStateData.color }">
                                            {{ currentStateData.name }}
                                        </strong>
                                        <br>
                                        <small class="text-muted">{{ currentStateData.description }}</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Vida -->
                            <div class="mb-4">
                                <h5 class="text-warning">Puntos de Vida</h5>
                                <div class="progress mb-2" style="height: 20px;">
                                    <div class="progress-bar bg-success" 
                                         :style="{ width: hpPercentage + '%' }" 
                                         role="progressbar">
                                        {{ character.currentHp }}/{{ character.maxHp }}
                                    </div>
                                </div>
                            </div>

                            <!-- Furia -->
                            <div class="mb-4">
                                <h5 class="text-warning">Furia</h5>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>Cargas: {{ furyCountDisplay }}</span>
                                    <span v-if="character.isFuryActive" class="badge bg-danger">
                                        <i class="bi bi-fire"></i> ACTIVA
                                    </span>
                                    <span v-else class="badge bg-secondary">Inactiva</span>
                                </div>
                            </div>

                            <!-- Información Adicional -->
                            <div v-if="showCharacterInfo" class="character-info">
                                <hr class="border-warning">
                                <h5 class="text-warning">Los Cuatro Estados</h5>
                                <div class="accordion accordion-flush" id="statesAccordion">
                                    <div v-for="(state, key) in characterStates" :key="key" class="accordion-item bg-dark">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed bg-dark text-light border-0" 
                                                    type="button" 
                                                    :data-bs-toggle="`collapse`" 
                                                    :data-bs-target="`#collapse${key}`">
                                                <img :src="getImageUrl(state.image)" 
                                                     width="20" height="20" 
                                                     class="me-2 rounded-circle">
                                                {{ state.name }}
                                            </button>
                                        </h2>
                                        <div :id="`collapse${key}`" class="accordion-collapse collapse">
                                            <div class="accordion-body text-light">
                                                {{ state.description }}
                                                <br>
                                                <small class="text-muted">
                                                    Los modificadores de estadísticas varían según el estado.
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-warning">
                            <small class="text-muted">
                                <i class="bi bi-clock"></i> Última actualización: {{ new Date().toLocaleTimeString() }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import { getImageUrl } from '../utils/imageHelper'

const gameStore = useGameStore()
const showCharacterInfo = ref(false)

// Computed properties desde el store
const character = computed(() => gameStore.character)
const currentStateData = computed(() => gameStore.currentStateData)
const hpPercentage = computed(() => gameStore.hpPercentage)
const furyCountDisplay = computed(() => gameStore.furyCountDisplay)
const characterStates = computed(() => gameStore.characterStates)

onMounted(() => {
    // Efecto de fade-in al cargar la página
    document.querySelector('.hero-content').style.opacity = '0'
    setTimeout(() => {
        document.querySelector('.hero-content').style.transition = 'opacity 1s ease-in-out'
        document.querySelector('.hero-content').style.opacity = '1'
    }, 100)
})
</script>

<style scoped>
.home-view {
    min-height: 100vh;
    background: linear-gradient(
        135deg,
        #0f0f23 0%,
        #1a1a2e 25%,
        #16213e 50%,
        #e94560 75%,
        #f39c12 100%
    );
    position: relative;
    overflow: hidden;
}

.home-view::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50" opacity="0.1">⚔️</text></svg>');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    opacity: 0.1;
    z-index: 1;
}

.container-fluid {
    position: relative;
    z-index: 2;
}

.character-portrait {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 5px solid #f39c12;
    box-shadow: 0 0 30px rgba(243, 156, 18, 0.5);
    transition: all 0.3s ease;
}

.character-portrait:hover {
    transform: scale(1.05);
    box-shadow: 0 0 40px rgba(243, 156, 18, 0.8);
}

.golden-text {
    background: linear-gradient(45deg, #f39c12, #f1c40f, #e67e22);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.info-panel {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
}

.state-icon {
    border-radius: 50%;
    border: 2px solid #f39c12;
}

.btn {
    border-radius: 12px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.btn-warning {
    background: linear-gradient(45deg, #f39c12, #e67e22);
    border: none;
    color: white;
}

.btn-warning:hover {
    background: linear-gradient(45deg, #e67e22, #d35400);
    color: white;
}

.card {
    border-radius: 15px;
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.progress {
    background-color: rgba(255,255,255,0.1);
    border-radius: 10px;
    overflow: hidden;
}

.accordion-button {
    font-weight: bold;
}

.accordion-button:not(.collapsed) {
    background-color: rgba(243, 156, 18, 0.2) !important;
    color: #f39c12 !important;
}

.hero-content {
    animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .character-portrait {
        width: 150px;
        height: 150px;
    }
    
    .display-2 {
        font-size: 2.5rem;
    }
}
</style>

<style scoped>
/* Estilos específicos del componente */
</style>
