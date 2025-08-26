<template>
  <header class="app-header">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🎲</span>
          <span class="brand-text">D&D Life Tracker</span>
        </router-link>
      </div>
      
      <!-- Mobile menu toggle -->
      <button 
        @click="toggleMobileMenu" 
        class="mobile-menu-toggle"
        :class="{ 'active': isMobileMenuOpen }"
        aria-label="Toggle mobile menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <div class="navbar-nav" :class="{ 'mobile-open': isMobileMenuOpen }">
        <router-link to="/" class="nav-link" active-class="active" @click="closeMobileMenu">
          <i class="bi bi-house-door"></i>
          <span>Inicio</span>
        </router-link>
        <router-link to="/config" class="nav-link" active-class="active" @click="closeMobileMenu">
          <i class="bi bi-gear"></i>
          <span>Configuración</span>
        </router-link>
        <router-link v-if="hasCharacter" to="/character" class="nav-link" active-class="active" @click="closeMobileMenu">
          <i class="bi bi-person"></i>
          <span>Personaje</span>
        </router-link>
        <router-link v-if="hasCharacter" to="/logs" class="nav-link" active-class="active" @click="closeMobileMenu">
          <i class="bi bi-journal-text"></i>
          <span>Historial</span>
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCharacterStore } from '../stores/useCharacterStore'

const characterStore = useCharacterStore()
const isMobileMenuOpen = ref(false)

const hasCharacter = computed(() => characterStore.character.isConfigured)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
.app-header {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
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
  height: 60px;
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
  gap: 12px;
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
  font-size: 1.6rem;
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
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ecf0f1;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f39c12;
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.nav-link i {
  font-size: 1.1rem;
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background: #f39c12;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* Mobile styles */
@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;
    height: 65px;
  }
  
  .brand-text {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .navbar-nav {
    position: fixed;
    top: 65px;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    flex-direction: column;
    gap: 0;
    padding: 20px 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .navbar-nav.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-link {
    width: 100%;
    padding: 15px 20px;
    justify-content: flex-start;
    border-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 1.1rem;
  }
  
  .nav-link:hover {
    background: rgba(243, 156, 18, 0.1);
    transform: none;
  }
  
  .nav-link.active {
    background: rgba(243, 156, 18, 0.2);
    border-left: 4px solid #f39c12;
    border-bottom: 1px solid rgba(243, 156, 18, 0.3);
  }
  
  .nav-link i {
    font-size: 1.2rem;
    min-width: 24px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 12px;
    height: 60px;
  }
  
  .brand-icon {
    font-size: 1.4rem;
  }
  
  .navbar-nav {
    top: 60px;
  }
  
  .nav-link {
    padding: 18px 20px;
    font-size: 1.2rem;
  }
}
</style>
