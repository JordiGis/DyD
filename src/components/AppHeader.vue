<template>
  <header class="app-header">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🎲</span>
          <span class="brand-text">D&D Life Tracker</span>
        </router-link>
      </div>
      
      <div class="navbar-nav">
        <router-link to="/" class="nav-link" active-class="active">
          Inicio
        </router-link>
        <router-link to="/config" class="nav-link" active-class="active">
          Configuración
        </router-link>
        <router-link v-if="hasCharacter" to="/character" class="nav-link" active-class="active">
          Personaje
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../stores/useCharacterStore'

const characterStore = useCharacterStore()

const hasCharacter = computed(() => characterStore.character.isConfigured)
</script>

<style scoped>
.app-header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 56px;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #f39c12;
  font-weight: bold;
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.brand-link:hover {
  color: #e67e22;
  transform: translateY(-1px);
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  font-size: 1.2rem;
}

.navbar-nav {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: #ecf0f1;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f39c12;
}

.nav-link.active {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;
  }
  
  .brand-text {
    display: none;
  }
  
  .navbar-nav {
    gap: 10px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>
