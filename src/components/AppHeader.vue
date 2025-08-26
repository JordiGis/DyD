<template>
  <header class="app-header">
    <div class="header-background">
      <div class="header-glow"></div>
      <div class="header-pattern"></div>
    </div>
    
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <div class="brand-icon-container">
            <span class="brand-icon">🎲</span>
            <div class="brand-icon-glow"></div>
          </div>
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
          <div class="nav-icon-container">
            <i class="bi bi-house-door"></i>
          </div>
          <span>Inicio</span>
        </router-link>
        <router-link to="/config" class="nav-link" active-class="active" @click="closeMobileMenu">
          <div class="nav-icon-container">
            <i class="bi bi-gear"></i>
          </div>
          <span>Configuración</span>
        </router-link>
        <router-link v-if="hasCharacter" to="/character" class="nav-link" active-class="active" @click="closeMobileMenu">
          <div class="nav-icon-container">
            <i class="bi bi-person"></i>
          </div>
          <span>Personaje</span>
        </router-link>
        <router-link v-if="hasCharacter" to="/logs" class="nav-link" active-class="active" @click="closeMobileMenu">
          <div class="nav-icon-container">
            <i class="bi bi-journal-text"></i>
          </div>
          <span>Historial</span>
        </router-link>
        <router-link to="/dm" class="nav-link" active-class="active" @click="closeMobileMenu">
          <div class="nav-icon-container">
            <i class="bi bi-shield-fill"></i>
          </div>
          <span>DM</span>
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
  background: linear-gradient(135deg, 
    rgba(20, 20, 35, 0.95) 0%, 
    rgba(40, 20, 60, 0.95) 50%, 
    rgba(20, 20, 35, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(139, 69, 19, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.header-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(139, 69, 19, 0.1) 0%,
    rgba(160, 82, 45, 0.05) 30%,
    transparent 70%
  );
  animation: glow-pulse 8s ease-in-out infinite;
}

.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: pattern-float 20s linear infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes pattern-float {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-20px); }
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  justify-items: center;
  flex-wrap: wrap;
  flex-direction: row;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: #d4af37;
  font-weight: 700;
  font-size: 1.4rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.brand-link:hover {
  color: #ffd700;
  transform: translateY(-2px);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
}

.brand-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  transition: all 0.3s ease;
}

.brand-icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.brand-link:hover .brand-icon-glow {
  opacity: 1;
}

.brand-link:hover .brand-icon {
  transform: scale(1.1) rotate(5deg);
}

.brand-text {
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #d4af37, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-nav {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e8e8e8;
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: linear-gradient(135deg, 
    rgba(139, 69, 19, 0.2) 0%, 
    rgba(160, 82, 45, 0.15) 100%);
  color: #ffd700;
  transform: translateY(-2px);
  border-color: rgba(139, 69, 19, 0.4);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
}

.nav-link.active {
  background: linear-gradient(135deg, 
    rgba(139, 69, 19, 0.4) 0%, 
    rgba(160, 82, 45, 0.3) 100%);
  color: #ffd700;
  border: 2px solid rgba(139, 69, 19, 0.6);
  box-shadow: 
    0 8px 25px rgba(139, 69, 19, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.nav-link:hover .nav-icon-container {
  transform: scale(1.1);
}

.nav-link i {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.nav-link:hover i {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* Mobile menu toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 32px;
  height: 32px;
  background: rgba(139, 69, 19, 0.2);
  border: 1px solid rgba(139, 69, 19, 0.4);
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: rgba(139, 69, 19, 0.3);
  border-color: rgba(139, 69, 19, 0.6);
  transform: scale(1.05);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: #d4af37;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.mobile-menu-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
  background: #ffd700;
}

.mobile-menu-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.mobile-menu-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
  background: #ffd700;
}

/* Mobile styles */
@media (max-width: 768px) {
  .navbar {
    padding: 0 20px;
    height: 75px;
  }
  
  .brand-text {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
    align-items: center;
  }
  
  .navbar-nav {
    position: fixed;
    top: 75px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, 
      rgba(20, 20, 35, 0.98) 0%, 
      rgba(40, 20, 60, 0.98) 100%);
    backdrop-filter: blur(25px);
    flex-direction: column;
    gap: 0;
    padding: 24px 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-bottom: 2px solid rgba(139, 69, 19, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
  
  .navbar-nav.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-link {
    width: 100%;
    padding: 18px 24px;
    justify-content: flex-start;
    border-radius: 0;
    border-bottom: 1px solid rgba(139, 69, 19, 0.1);
    font-size: 1.1rem;
    margin: 0;
  }
  
  .nav-link:hover {
    background: linear-gradient(135deg, 
      rgba(139, 69, 19, 0.2) 0%, 
      rgba(160, 82, 45, 0.15) 100%);
    transform: none;
    border-left: 4px solid #d4af37;
  }
  
  .nav-link.active {
    background: linear-gradient(135deg, 
      rgba(139, 69, 19, 0.4) 0%, 
      rgba(160, 82, 45, 0.3) 100%);
    border-left: 4px solid #ffd700;
    border-bottom: 1px solid rgba(139, 69, 19, 0.3);
  }
  
  .nav-link i {
    font-size: 1.3rem;
    min-width: 28px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 16px;
    height: 70px;
  }
  
  .brand-icon {
    font-size: 1.8rem;
  }
  
  .navbar-nav {
    top: 70px;
  }
  
  .nav-link {
    padding: 20px 24px;
    font-size: 1.2rem;
  }
  
  .mobile-menu-toggle {
    width: 28px;
    height: 28px;
  }
  
  .hamburger-line {
    width: 18px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .app-header {
    border-bottom-width: 3px;
  }
  
  .nav-link.active {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .header-glow,
  .header-pattern,
  .nav-link::before,
  .brand-link,
  .nav-link,
  .mobile-menu-toggle,
  .hamburger-line {
    animation: none;
    transition: none;
  }
}
</style>
