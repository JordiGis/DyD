<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="app-container">
    <AppHeader />
    
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Estilos globales para la aplicación */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.main-content {
  padding: 0;
  min-height: calc(100vh - 56px); /* Altura del navbar */
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a2e;
}

::-webkit-scrollbar-thumb {
  background: #f39c12;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #e67e22;
}

/* Animaciones globales */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Mejoras para Bootstrap */
.btn {
  transition: all 0.3s ease;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}
</style>
