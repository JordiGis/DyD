<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <router-link class="navbar-brand" to="/">
                <i class="bi bi-app-indicator"></i>
                Mi App
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
                        <router-link class="nav-link" to="/">Inicio</router-link>
                    </li>
                </ul>
                
                <div class="d-flex">
                    <button 
                        @click="toggleTheme" 
                        class="btn btn-outline-light"
                        type="button"
                    >
                        <i :class="store.isDarkTheme ? 'bi-sun' : 'bi-moon'"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useAppStore } from '../stores/useGameStore.js'

const store = useAppStore()

const toggleTheme = () => {
    store.toggleTheme()
}
</script>

<style scoped>
.nav-link.router-link-active {
    font-weight: bold;
}
</style>
