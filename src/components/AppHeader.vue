<template>
    <nav class="navbar navbar-expand-lg navbar-dark escanor-navbar">
        <div class="container">
            <router-link class="navbar-brand d-flex align-items-center" to="/">
                <img :src="getImageUrl('icon.png')" alt="Escanor" width="32" height="32" class="me-2 rounded-circle">
                <span class="golden-text fw-bold">ESCANOR</span>
            </router-link>
            
            <button 
                class="navbar-toggler" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <router-link class="nav-link" to="/">
                            <i class="bi bi-house-door"></i> Inicio
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/combat">
                            <i class="bi bi-sword"></i> Combate
                        </router-link>
                    </li>
                </ul>
                
                <div class="d-flex align-items-center">
                    <!-- Estado actual del personaje en el navbar -->
                    <div class="me-3 d-none d-md-block">
                        <span class="badge text-dark me-2" :style="{ backgroundColor: currentStateData.color }">
                            {{ currentStateData.name }}
                        </span>
                        <span class="text-light small">
                            <i class="bi bi-heart-fill text-danger"></i> {{ character.currentHp }}/{{ character.maxHp }}
                        </span>
                        <span v-if="character.isFuryActive" class="ms-2">
                            <i class="bi bi-fire text-danger"></i>
                        </span>
                    </div>
                    
                    <button 
                        @click="gameStore.resetCharacter" 
                        class="btn btn-outline-warning btn-sm"
                        type="button"
                        title="Reset completo del personaje"
                    >
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/useGameStore.js'
import { getImageUrl } from '../utils/imageHelper'

const gameStore = useGameStore()

// Computed properties
const character = computed(() => gameStore.character)
const currentStateData = computed(() => gameStore.currentStateData)
</script>

<style scoped>
.escanor-navbar {
    background: linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #e94560 100%) !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    border-bottom: 2px solid #f39c12;
}

.golden-text {
    background: linear-gradient(45deg, #f39c12, #f1c40f);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    font-size: 1.2rem;
    letter-spacing: 1px;
}

.navbar-brand {
    transition: all 0.3s ease;
}

.navbar-brand:hover {
    transform: scale(1.05);
}

.nav-link {
    font-weight: 500;
    transition: all 0.3s ease;
    border-radius: 8px;
    margin: 0 2px;
}

.nav-link:hover {
    background-color: rgba(243, 156, 18, 0.2);
    color: #f39c12 !important;
}

.nav-link.router-link-active {
    background-color: rgba(243, 156, 18, 0.3);
    color: #f39c12 !important;
    font-weight: bold;
}

.btn-outline-warning {
    border-color: #f39c12;
    color: #f39c12;
    transition: all 0.3s ease;
}

.btn-outline-warning:hover {
    background-color: #f39c12;
    border-color: #f39c12;
    color: #1a1a2e;
    transform: scale(1.05);
}

.badge {
    font-size: 0.75rem;
    padding: 0.25em 0.5em;
    border-radius: 0.375rem;
}

@media (max-width: 768px) {
    .golden-text {
        font-size: 1rem;
    }
}
</style>
